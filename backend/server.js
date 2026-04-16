const path = require('path')
const http = require('http')
const mysql = require('mysql2/promise')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config({ path: path.join(__dirname, '.env') })

const packagesDB = require('./db/packages')
const inventoryDB = require('./db/inventory')
const customerDB = require('./db/customers')
const packageTrackDB = require('./db/package_track')
const employeeDB = require('./db/employees')
const priceDB = require('./db/package_type')
// const packagePickupStorageJob = require('./db/package_pickup_storage_job')
const revenueReportDB = require('./db/revenue_report')
const lostNotifsDB = require('./db/lost_package_notifs')
const { report } = require('process')
const shipmentDB = require('./db/shipments')
const operationsDB = require('./db/operations')

// ── DB pool ───────────────────────────────────────────────────────────────
const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  ssl: { rejectUnauthorized: false }
})

pool
  .getConnection()
  .then((c) => {
    console.log('✅ MySQL connected')
    c.release()
    // Initialize lost packages tracking column
    lostNotifsDB.ensureLostStatusColumn(pool).catch(err => {
      console.error('⚠️ Failed to initialize lost packages column:', err.message)
    })
  })
  .catch((e) => console.error('❌ MySQL connection failed:', e))

if (
  process.env.DISABLE_PACKAGE_PICKUP_JOB !== '1' &&
  process.env.DISABLE_PACKAGE_PICKUP_JOB !== 'true'
) {
  const jobMs = Number(process.env.PACKAGE_PICKUP_JOB_MS)
  const runOnStartEnv = process.env.PACKAGE_PICKUP_JOB_RUN_ON_START
  // packagePickupStorageJob.startPackagePickupStorageJob(pool, {
  //   intervalMs: Number.isFinite(jobMs) && jobMs > 0 ? jobMs : undefined,
  //   // Default: run once at startup so 30-day disposal applies without waiting for the first 24h tick.
  //   runOnStart: runOnStartEnv !== '0' && runOnStartEnv !== 'false',
  // })
}

// ── Helpers ───────────────────────────────────────────────────────────────

function getBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
    })
    req.on('end', () => {
      if (!data) return resolve({})
      try {
        resolve(JSON.parse(data))
      } catch {
        resolve({})
      }
    })
    req.on('error', reject)
  })
}

function send(res, status, body) {
  const json = JSON.stringify(body)
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(json),
  })
  res.end(json)
}

function setCORSHeaders(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  )
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

// Match a URL path against a pattern like '/api/packages/:id/tracking'
function matchPath(pattern, urlPath) {
  const patternParts = pattern.split('/')
  const urlParts = urlPath.split('/')
  if (patternParts.length !== urlParts.length) return { matched: false }
  const params = {}
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = decodeURIComponent(urlParts[i])
    } else if (patternParts[i] !== urlParts[i]) {
      return { matched: false }
    }
  }
  return { matched: true, params }
}

function getQueryParams(urlString) {
  const u = new URL(urlString, 'http://localhost')
  const params = {}
  u.searchParams.forEach((v, k) => {
    params[k] = v
  })
  return params
}

// ── Auth helpers ──────────────────────────────────────────────────────────

function authenticate(req, res) {
  const token = (req.headers['authorization'] || '').split(' ')[1]
  if (!token) {
    send(res, 401, { message: 'No token provided' })
    return null
  }
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'secret')
  } catch {
    send(res, 403, { message: 'Invalid or expired token' })
    return null
  }
}

function requireEmployee(user, res) {
  if (user?.type !== 'employee' || user?.employee_id == null) {
    send(res, 403, { message: 'Employee access required' })
    return false
  }
  return true
}

function requireAdmin(user, res) {
  if (Number(user?.role_id) !== 5) {
    send(res, 403, { message: 'Access denied. Admin role (5) required.' })
    return false
  }
  return true
}

// ── Business logic helpers ────────────────────────────────────────────────

function normalizePackageTypeName(raw) {
  const t = String(raw || '').toLowerCase().trim()
  if (t === 'oversized') return 'oversize'
  if (t === 'express') return 'express'
  if (t === 'general shipping') return 'general shipping'
  if (t === 'oversize') return 'oversize'
  return String(raw || '').trim()
}

const TYPE_NAME_TO_CODE = {
  express: 'EXP',
  'general shipping': 'GEN',
  oversize: 'OVR',
}

function toMysqlDateTime(value) {
  if (value == null || value === '') return null
  const s = String(value).trim().replace('T', ' ')
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(s)) return `${s}:00`
  return s
}

/** mysql2 Date or string → 'YYYY-MM-DD HH:MM:SS' for SQL parameters. */
function dateToMysqlDateTime(value) {
  if (value == null) return null
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const pad = (n) => String(n).padStart(2, '0')
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(
      value.getDate()
    )} ${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(
      value.getSeconds()
    )}`
  }
  return toMysqlDateTime(value)
}

/** Form value wins if present; otherwise use shipment.Arrival_Time_Stamp (set when status → At Office). */
function resolveArrivalForPickup(shipmentArrivalStamp, bodyArrivalTime) {
  return (
    toMysqlDateTime(bodyArrivalTime) ||
    dateToMysqlDateTime(shipmentArrivalStamp) ||
    null
  )
}

function isAtOfficeStatusName(name) {
  const raw = String(name || '').trim().toLowerCase()
  const spaced = raw
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const underscored = spaced.replace(/\s+/g, '_')
  return spaced === 'at office' || underscored === 'at_office'
}

function getPricePromise(poolRef, excessFeeTypeName, packageTypeName, weight, zone) {
  return new Promise((resolve, reject) => {
    const w = Number(weight)
    const z = Number(zone)
    priceDB.getPrice(
      poolRef,
      excessFeeTypeName || null,
      packageTypeName,
      w,
      z,
      (err, results) => {
        if (err) return reject(err)
        if (!results?.length) {
          const e = new Error('No matching price for weight, zone, and package type')
          e.status = 400
          return reject(e)
        }
        resolve(Number(results[0].Tot_Price))
      }
    )
  })
}

async function nextTrackingNumber(conn) {
  const [rows] = await conn.query(
    `SELECT Tracking_Number FROM package WHERE Tracking_Number LIKE 'TRK%' ORDER BY Tracking_Number DESC LIMIT 1`
  )
  let n = 1
  if (rows.length) {
    const m = /^TRK(\d+)$/i.exec(rows[0].Tracking_Number)
    if (m) n = parseInt(m[1], 10) + 1
  }
  return `TRK${String(n).padStart(7, '0')}`.slice(0, 10)
}

// ── Router ────────────────────────────────────────────────────────────────

async function router(req, res) {
  setCORSHeaders(req, res)

  // Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  const urlObj = new URL(req.url, 'http://localhost')
  const pathname = urlObj.pathname
  const method = req.method
  const query = getQueryParams(req.url)

  // // ── GET /api/health ──────────────────────────────────────────────────────
  // if (method === 'GET' && pathname === '/api/health') {
  //   return send(res, 200, { ok: true, service: 'postoffice-api', has_price: true })
  // }

  // ── POST /api/auth/login ─────────────────────────────────────────────────
  if (method === 'POST' && pathname === '/api/auth/login') {
    const { email, password } = await getBody(req)
    if (!email || !password) return send(res, 400, { message: 'Email and password required' })
    try {
      const emailNorm = String(email).trim().toLowerCase()
      const [rows] = await pool.query(
        `SELECT e.*, r.Role_Name, d.Department_Name
         FROM employee e
         JOIN role r       ON e.Role_ID       = r.Role_ID
         JOIN department d ON e.Department_ID = d.Department_ID
         WHERE LOWER(e.Email_Address) = ?`,
        [emailNorm]
      )
      if (!rows.length) return send(res, 401, { message: 'Invalid credentials' })
      const emp = rows[0]
      const valid = await bcrypt.compare(password, emp.Password_Hash)
      if (!valid) return send(res, 401, { message: 'Invalid credentials' })

      const token = jwt.sign(
        {
          employee_id: Number(emp.Employee_ID),
          email: emp.Email_Address,
          role_id: Number(emp.Role_ID),
          type: 'employee',
        },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '24h' }
      )
      const { Password_Hash, ...safe } = emp
      return send(res, 200, { message: 'Login successful', token, user: safe })
    } catch (err) {
      console.error(err)
      return send(res, 500, { message: 'Server error' })
    }
  }

  // ── POST /api/auth/customer-login
  if (method === 'POST' && pathname === '/api/auth/customer-login') {
    const { email, password } = await getBody(req)
    if (!email || !password) return send(res, 400, { message: 'Email and password required' })
    try {
      const emailNorm = String(email).trim().toLowerCase()
      const [rows] = await pool.query(
        'SELECT * FROM customer WHERE LOWER(Email_Address) = ? AND is_Active = 0',
        [emailNorm]
      )
      if (!rows.length) return send(res, 401, { message: 'Invalid credentials' })
      const customer = rows[0]
      const valid = await bcrypt.compare(password, customer.Password_Hash)
      if (!valid) return send(res, 401, { message: 'Invalid credentials' })

      const token = jwt.sign(
        { customer_id: customer.Customer_ID, email: customer.Email_Address, type: 'customer' },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '24h' }
      )
      const { Password_Hash, ...safe } = customer
      return send(res, 200, { message: 'Login successful', token, user: safe })
    } catch (err) {
      console.error(err)
      return send(res, 500, { message: 'Server error' })
    }
  }

  // ── POST /api/customer/register ──────────────────────────────────────────
  if (method === 'POST' && pathname === '/api/customer/register') {
    const body = await getBody(req)
    try {
      const { customer_id, user } = await customerDB.registerCustomer(pool, body)
      const token = jwt.sign(
        { customer_id, email: user.Email_Address, type: 'customer' },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '24h' }
      )
      return send(res, 201, { message: 'Customer registered successfully', token, user })
    } catch (err) {
      if (err.status === 400 || err.code === 'VALIDATION' || err.code === 'DUPLICATE_EMAIL') {
        return send(res, err.status || 400, { message: err.message })
      }
      if (err.code === 'ER_DUP_ENTRY') return send(res, 400, { message: 'Email already registered' })
      console.error(err)
      return send(res, 500, { message: err.message || 'Server error' })
    }
  }

  // ── POST /api/auth/admin-register ────────────────────────────────────────
  if (method === 'POST' && pathname === '/api/auth/admin-register') {
    const user = authenticate(req, res)
    if (!user) return
    if (!requireAdmin(user, res)) return

    const { name, email, department, position, phoneNumber, hireDate } = await getBody(req)
    if (!name || !email || !department || !position || !hireDate) {
      return send(res, 400, { message: 'Missing required fields' })
    }

    try {
      const [exists] = await pool.query('SELECT Employee_ID FROM employee WHERE Email_Address = ?', [email])
      if (exists.length) return send(res, 400, { message: 'Email already registered' })

      const tempPassword = Math.random().toString(36).slice(-10) + 'Temp1!'
      const hash = await bcrypt.hash(tempPassword, 10)

      // Look up Department_ID by name (don’t assume IDs)
      const [[deptRow]] = await pool.query(
        `SELECT Department_ID FROM department WHERE Department_Name = ? LIMIT 1`,
        [department]
      )
      if (!deptRow) return send(res, 400, { message: `Invalid department: ${department}` })
      const department_id = Number(deptRow.Department_ID)

      // Look up Role_ID by name (don’t assume IDs)
      const [[roleRow]] = await pool.query(
        `SELECT Role_ID FROM role WHERE Role_Name = ? LIMIT 1`,
        [position]
      )
      if (!roleRow) return send(res, 400, { message: `Invalid position/role: ${position}` })
      const role_id = Number(roleRow.Role_ID)

      const [firstName, ...lastNameParts] = name.split(' ')
      const lastName = lastNameParts.join(' ') || 'Employee'

      const [result] = await pool.query(
        `INSERT INTO employee (
          Post_Office_ID, Role_ID, Department_ID,
          First_Name, Middle_Name, Last_Name,
          Birthday,
          Password_Hash, Email_Address, Phone_Number,
          Sex, Salary
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          1, role_id, department_id,
          firstName, '', lastName,
          hireDate,
          hash, email, phoneNumber || null,
          'U', 0.0
        ]
      )

      console.log(`[TODO] Send email to ${email} with temporary password: ${tempPassword}`)
      return send(res, 201, {
        message: 'Employee registered successfully',
        employee_id: result.insertId,
        email,
        note: 'Temporary password sent to employee email',
      })
    } catch (err) {
      console.error(err)
      return send(res, 500, { message: 'Server error', error: err.message })
    }
  }

  // ── GET /api/admin/employees
  if (method === 'GET' && pathname === '/api/admin/employees') {
    const user = authenticate(req, res)
    if (!user) return
    if (!requireAdmin(user, res)) return

    try {
      const [rows] = await pool.query(
        `SELECT
          e.Employee_ID,
          addr.Street AS Post_Office_Street,
          d.Department_Name,
          r.Role_Name,
          e.First_Name,
          e.Last_Name,
          e.Email_Address,
          e.Sex,
          e.Phone_Number,
          e.Is_Active
        FROM employee e
        JOIN post_office po ON e.Post_Office_ID = po.Post_Office_ID
        JOIN Address addr ON po.Address_ID = addr.Address_ID
        JOIN department d ON e.Department_ID = d.Department_ID
        JOIN role r ON e.Role_ID = r.Role_ID
        WHERE e.Is_Active IN ('1',1)
        ORDER BY e.Last_Name, e.First_Name, e.Employee_ID`
      )
      return send(res, 200, { employees: rows })
    } catch (err) {
      console.error(err)
      return send(res, 500, { message: err.sqlMessage || err.message || 'Server error' })
    }
  }

  // ── PATCH /api/admin/employees/:employeeId/deactivate ────────────────────
  {
    const m = matchPath('/api/admin/employees/:employeeId/deactivate', pathname)
    if (method === 'PATCH' && m.matched) {
      const user = authenticate(req, res)
      if (!user) return
      if (!requireAdmin(user, res)) return

      const employeeId = Number(m.params.employeeId)
      if (!Number.isFinite(employeeId)) return send(res, 400, { message: 'Invalid employee id' })

      try {
        const [result] = await pool.query(
          "UPDATE employee SET Is_Active = '0' WHERE Employee_ID = ?",
          [employeeId]
        )
        if (!result.affectedRows) return send(res, 404, { message: 'Employee not found' })
        return send(res, 200, { ok: true })
      } catch (err) {
        console.error(err)
        return send(res, 500, { message: err.sqlMessage || err.message || 'Server error' })
      }
    }
  }

  // ── GET /api/auth/profile ────────────────────────────────────────────────
  if (method === 'GET' && pathname === '/api/auth/profile') {
    const user = authenticate(req, res)
    if (!user) return
    if (!requireEmployee(user, res)) return

    try {
      const [rows] = await pool.query(
        `SELECT e.Employee_ID, e.First_Name, e.Middle_Name, e.Last_Name,
                e.Email_Address, e.Phone_Number, e.Salary, e.Hours_Worked, e.Supervisor_ID,
                CONCAT(s.First_Name, ' ', s.Last_Name) AS Supervisor,
                r.Role_Name, d.Department_Name,
                off_addr.City AS Office_City, off_addr.State AS Office_State
         FROM employee e
         JOIN role r         ON e.Role_ID        = r.Role_ID
         JOIN department d   ON e.Department_ID  = d.Department_ID
         JOIN post_office po ON e.Post_Office_ID = po.Post_Office_ID
         JOIN address off_addr ON off_addr.Address_ID = po.Address_ID
         LEFT JOIN employee s ON e.Supervisor_ID = s.Employee_ID
         WHERE e.Employee_ID = ?`,
        [user.employee_id]
      )
      if (!rows.length) return send(res, 404, { message: 'Employee not found' })
      return send(res, 200, { user: rows[0] })
    } catch (err) {
      console.error(err)
      return send(res, 500, { message: 'Server error' })
    }
  }

  // ── PUT /api/auth/profile ────────────────────────────────────────────────
  if (method === 'PUT' && pathname === '/api/auth/profile') {
    const user = authenticate(req, res)
    if (!user) return
    if (!requireEmployee(user, res)) return

    const { Email_Address, Phone_Number } = await getBody(req)
    try {
      await pool.query(
        'UPDATE employee SET Phone_Number = ?, Email_Address = ? WHERE Employee_ID = ?',
        [Phone_Number, Email_Address, user.employee_id]
      )

      const [rows] = await pool.query(
        `SELECT e.Employee_ID, e.First_Name, e.Middle_Name, e.Last_Name,
                e.Email_Address, e.Phone_Number, e.Salary, e.Hours_Worked, e.Supervisor_ID,
                CONCAT(s.First_Name, ' ', s.Last_Name) AS Supervisor,
                r.Role_Name, d.Department_Name,
                off_addr.City AS Office_City, off_addr.State AS Office_State
         FROM employee e
         JOIN role r         ON e.Role_ID        = r.Role_ID
         JOIN department d   ON e.Department_ID  = d.Department_ID
         JOIN post_office po ON e.Post_Office_ID = po.Post_Office_ID
         JOIN address off_addr ON off_addr.Address_ID = po.Address_ID
         LEFT JOIN employee s ON e.Supervisor_ID = s.Employee_ID
         WHERE e.Employee_ID = ?`,
        [user.employee_id]
      )

      return send(res, 200, { message: 'Profile updated successfully', user: rows[0] })
    } catch (err) {
      console.error(err)
      return send(res, 500, { message: 'Server error' })
    }
  }

  // ── POST /api/auth/change-password ───────────────────────────────────────
  if (method === 'POST' && pathname === '/api/auth/change-password') {
    const user = authenticate(req, res)
    if (!user) return
    if (!requireEmployee(user, res)) return

    const { currentPassword, newPassword } = await getBody(req)
    if (!currentPassword || !newPassword) return send(res, 400, { message: 'Both passwords are required' })
    if (newPassword.length < 6) return send(res, 400, { message: 'New password must be at least 6 characters' })

    try {
      const [rows] = await pool.query(
        'SELECT Password_Hash FROM employee WHERE Employee_ID = ?',
        [user.employee_id]
      )
      if (!rows.length) return send(res, 404, { message: 'Employee not found' })

      const valid = await bcrypt.compare(currentPassword, rows[0].Password_Hash)
      if (!valid) return send(res, 401, { message: 'Current password is incorrect' })

      const newHash = await bcrypt.hash(newPassword, 10)
      await pool.query(
        'UPDATE employee SET Password_Hash = ? WHERE Employee_ID = ?',
        [newHash, user.employee_id]
      )
      return send(res, 200, { message: 'Password changed successfully' })
    } catch (err) {
      console.error(err)
      return send(res, 500, { message: 'Server error' })
    }
  }

  // ── GET /api/customer/profile ────────────────────────────────────────────
  if (method === 'GET' && pathname === '/api/customer/profile') {
    const user = authenticate(req, res)
    if (!user) return

    try {
      const [rows] = await pool.query(
        `SELECT c.Customer_ID, c.First_Name, c.Last_Name, c.Email_Address,
                c.Phone_Number, a.House_Number, a.Street, a.City, a.State,
                a.Zip_Code, a.Address_ID
         FROM customer c
         JOIN address a ON c.Address_ID = a.Address_ID
         WHERE c.Customer_ID = ?`,
        [user.customer_id]
      )
      if (!rows.length) return send(res, 404, { message: 'Customer not found' })
      return send(res, 200, { user: rows[0] })
    } catch (err) {
      console.error(err)
      return send(res, 500, { message: 'Server error' })
    }
  }

  // ── PUT /api/customer/profile ────────────────────────────────────────────
  if (method === 'PUT' && pathname === '/api/customer/profile') {
    const user = authenticate(req, res)
    if (!user) return

    const {
      Email_Address,
      Phone_Number,
      House_Number,
      Street,
      City,
      State,
      Zip_Code
    } = await getBody(req)

    try {
      // Update customer info
      await pool.query(
        `UPDATE customer SET Email_Address=?, Phone_Number=? WHERE Customer_ID=?`,
        [
          Email_Address,
          Phone_Number,
          user.customer_id,
        ]
      )

      // Get Address_ID for the customer
      const [customerRows] = await pool.query(
        `SELECT Address_ID FROM customer WHERE Customer_ID=?`,
        [user.customer_id]
      )
      if (!customerRows.length) return send(res, 404, { message: 'Customer not found' })
      
      const addressId = customerRows[0].Address_ID
      // const fullZip = (Zip_First3 || '') + (Zip_Last2 || '')

      // Update address info
      await pool.query(
        `UPDATE address SET House_Number=?, Street=?, City=?, State=?, Zip_Code=? WHERE Address_ID=?`,
        [
          House_Number,
          Street,
          City,
          State,
          Zip_Code || null,
          addressId,
        ]
      )

      // Fetch updated profile
      const [rows] = await pool.query(
        `SELECT c.Customer_ID, c.First_Name, c.Last_Name, c.Email_Address,
                c.Phone_Number, a.House_Number, a.Street, a.City, a.State,
                a.Zip_Code, a.Address_ID
         FROM customer c
         JOIN address a ON c.Address_ID = a.Address_ID
         WHERE c.Customer_ID = ?`,
        [user.customer_id]
      )

      return send(res, 200, { message: 'Profile updated successfully', user: rows[0] })
    } catch (err) {
      console.error(err)
      return send(res, 500, { message: 'Server error' })
    }
  }

  // ── GET /api/packages (PROTECTED: employee+admin) ────────────────────────
  if (method === 'GET' && pathname === '/api/packages') {
    const user = authenticate(req, res)
    if (!user) return
    if (!requireEmployee(user, res)) return

    packagesDB.getAllPackages(pool, (err, results) => {
      if (err) return send(res, 500, { error: 'Database error' })
      return send(res, 200, results)
    })
    return
  }

  

  // ── GET /api/price (PUBLIC) ──────────────────────────────────────────────
  if (method === 'GET' && pathname === '/api/price') {
    const { package_type, weight, zone, excess_fee, dim_x, dim_y, dim_z } = query
    const pt = normalizePackageTypeName(package_type)
    if (!pt || weight === undefined || weight === '' || zone === undefined || zone === '') {
      return send(res, 400, { error: 'package_type, weight, and zone are required' })
    }

    const w = Number(weight)
    const z = Number(zone)
    if (!Number.isFinite(w) || w <= 0 || w > 70) {
      return send(res, 400, { error: 'Weight must be greater than 0 and at most 70 lbs' })
    }
    if (!Number.isInteger(z) || z < 1 || z > 9) {
      return send(res, 400, { error: 'Zone must be a whole number from 1 to 9' })
    }

    try {
      const tot = await new Promise((resolve, reject) => {
        priceDB.getPrice(pool, excess_fee || null, pt, weight, zone, (err, results) => {
          if (err) return reject(err)
          if (!results?.length) {
            const e = new Error('No matching price for this weight, zone, and package type combination')
            e.status = 400
            return reject(e)
          }
          resolve(Number(results[0].Tot_Price))
        }, dim_x, dim_y, dim_z)
      })
      return send(res, 200, { Tot_Price: tot })
    } catch (err) {
      if (err.status === 400) return send(res, 400, { error: err.message })
      console.error(err)
      return send(res, 500, { error: err.message || 'Could not calculate price' })
    }
  }

  // ── GET /api/customer/my-packages (customer-only) ────────────────────────
  if (method === 'GET' && pathname === '/api/customer/my-packages') {
    const user = authenticate(req, res)
    if (!user) return
    if (user?.type !== 'customer' || user.customer_id == null) {
      return send(res, 403, { message: 'Customer access required' })
    }

    // try {
    //   await packagePickupStorageJob.runNodeDisposalSweep(pool)
    // } catch (e) {
    //   console.error('[my-packages] disposal sweep:', e.message || e)
    // }

    packagesDB.getPackagesForCustomer(pool, user.customer_id, (err, results) => {
      if (err) {
        console.error(err)
        return send(res, 500, { error: 'Database error' })
      }
      return send(res, 200, results)
    })
    return
  }


  if (method === 'POST' && pathname === '/api/employee/packages') {
  const user = authenticate(req, res)
  if (!user) return
  if (!requireEmployee(user, res)) return

  const b = await getBody(req)
  const {
    sender_email,
    sender_first_name, sender_last_name,
    sender_house_number, sender_street, sender_city,
    sender_state, sender_zip_code, sender_apt_number, sender_country,

    recipient_email, recipient_first_name, recipient_last_name,
    recipient_house_number, recipient_street, recipient_city,
    recipient_state, recipient_zip_code, recipient_apt_number, recipient_country,

    package_type,
    weight,
    zone,
    excess_fee,
    dim_x, dim_y, dim_z,
  } = b

  const pt = normalizePackageTypeName(package_type)
  const typeCode = TYPE_NAME_TO_CODE[pt]
  if (!typeCode) return send(res, 400, { message: 'Invalid package_type' })

  const w = Number(weight)
  const z = Number(zone)
  if (Number.isNaN(w) || Number.isNaN(z)) {
    return send(res, 400, { message: 'weight and zone must be numbers' })
  }

  const dx = dim_x ? Number(dim_x) : 12
  const dy = dim_y ? Number(dim_y) : 10
  const dz = dim_z ? Number(dim_z) : 8

  if (!(dx > 0 && dy > 0 && dz > 0)) {
    return send(res, 400, { message: 'Dimensions must be positive numbers' })
  }

  const excessName =
    excess_fee && String(excess_fee).trim() ? String(excess_fee).trim() : null

  const sigRequired = excessName === 'Signature Required'

  let priceAmount
  try {
    priceAmount = await getPricePromise(pool, excessName, pt, w, z)
  } catch (err) {
    return send(res, err.status === 400 ? 400 : 500, {
      message: err.message || 'Pricing failed'
    })
  }

  const senderEmail = (sender_email || '').trim().toLowerCase()
  if (!sender_first_name?.trim() || !sender_last_name?.trim()) {
    return send(res, 400, { message: 'Sender first name and last name are required' })
  }
  if (!sender_house_number || !sender_street || !sender_city || !sender_state || !sender_zip_code) {
    return send(res, 400, { message: 'Sender address fields are required' })
  }
  const recipientEmail = (recipient_email || '').trim().toLowerCase()

  if (!sender_first_name?.trim() || !sender_last_name?.trim()) {
    return send(res, 400, { message: 'Sender name required' })
  }
  if (!recipient_house_number || !recipient_street || !recipient_city || !recipient_state ||  !recipient_zip_code) {
    return send(res, 400, { message: 'Recipient address fields are required' })
  }
  if (!recipient_first_name?.trim() || !recipient_last_name?.trim()) {
    return send(res, 400, { message: 'Recipient name required' })
  }

  if (recipientEmail && senderEmail && recipientEmail === senderEmail) {
    return send(res, 400, {
      message: 'Sender and recipient must be different people'
    })
  }


  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    // ── Sender ──
    let senderId = (await customerDB.getCustomerByEmail(conn, senderEmail))?.Customer_ID
    
    let senderAddId
    
    if (!senderId) {
      senderAddId = await customerDB.resolveAddress(conn,{
        house_number: sender_house_number,
        street:       sender_street,
        city:         sender_city,
        state:        sender_state,
        zip_code:   sender_zip_code,
        apt_number:   sender_apt_number,
        country:      sender_country
      })
      const created = await customerDB.createCustomerMinimal(conn, {
        first_name:   sender_first_name,
        last_name:    sender_last_name,
        email:        senderEmail,
        address_Id:   senderAddId,
        phone_number: sender_phone,
      })
      recipientId = created.customerId
      
    }
  else{
     const [custRows] = await conn.query(
    `SELECT Address_ID FROM customer WHERE Customer_ID = ?`,
    [senderId]
  )

  senderAddId = custRows[0]?.Address_ID || null
  }

    // ── Recipient ──
    let recipientId = (await customerDB.getCustomerByEmail(conn, recipientEmail))?.Customer_ID
    let recipientAddId
    if (!recipientId) {
      recipientAddId = await customerDB.resolveAddress(conn,{
        house_number: recipient_house_number,
        street:       recipient_street,
        city:         recipient_city,
        state:        recipient_state,
        zip_code:     recipient_zip_code,
        apt_number:   recipient_apt_number,
        country:      recipient_country
      })

      const created = await customerDB.createCustomerMinimal(conn, {
        first_name:   recipient_first_name,
        last_name:    recipient_last_name,
        email:        recipientEmail,
        address_Id:   recipientAddId,
        phone_number: recipient_phone,
      })
      recipientId = created.customerId
    }
    else{
     const [custRows] = await conn.query(
    `SELECT Address_ID FROM customer WHERE Customer_ID = ?`,
    [recipientIdId]
  )

  recipientAddId = custRows[0]?.Address_ID || null
  }
    
    const tracking = await nextTrackingNumber(conn)
    const oversize = typeCode === 'OVR' ? 1 : 0

    const actingEmployeeId = Number(user.employee_id)

    const [[empRow]] = await conn.query(
      `SELECT Post_Office_ID
       FROM employee
       WHERE Employee_ID = ?`,
      [actingEmployeeId]
    )

    const postOfficeId = empRow?.Post_Office_ID

    if (!Number.isFinite(actingEmployeeId)) {
      await conn.rollback()
      return send(res, 401, { message: 'Invalid employee session' })
    }

    



     const [[pending]] = await conn.query(`SELECT Status_Code FROM status_code WHERE Status_Name = 'Pending' LIMIT 1`)
    if (!pending) throw new Error('Missing Pending status in status_code')
    const pendingCode = pending.Status_Code

    await conn.query(
      `INSERT INTO package (Tracking_Number, Sender_ID, Recipient_ID, Dim_X, Dim_Y, Dim_Z,
        Package_Type_Code, Weight, Zone, Oversize, Requires_Signature, Status_Code)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [tracking, senderId, recipientId, dx, dy, dz, typeCode, w, z, oversize, sigRequired ? 1 : 0,
       pendingCode]
    )

    await conn.query(
      `INSERT INTO payment (Customer_ID, Payment_Amount, Employee_ID, Tracking_Number)
       VALUES (?,?,?,?)`,
      [senderId, priceAmount, actingEmployeeId, tracking]
    )

   

    await conn.query(
      `INSERT INTO package (
        Tracking_Number, Sender_ID, Recipient_ID,
        Dim_X, Dim_Y, Dim_Z,
        Package_Type_Code, Weight, Zone,
        Oversize, Requires_Signature,
        Status_Code
      )
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        tracking,
        senderId,
        recipientId,
        dx,
        dy,
        dz,
        typeCode,
        w,
        z,
        oversize,
        sigRequired ? 1 : 0,
        pendingCode,
        recipientAddrId,
        recipientName,
      ]
    )

    // const [shipRes] = await conn.query(
    //   `INSERT INTO shipment (Status_Code, Employee_ID, From_Address_ID, To_Address_ID)
    //    VALUES (?,?,?,?)`,
    //   [
    //     pendingCode, actingEmployeeId, postOfficeId, recipientAddId
    //   ]
    // )

    // ── PAYMENT ──
    await conn.query(
      `INSERT INTO payment
       (Customer_ID, Payment_Amount, Employee_ID, Tracking_Number)
       VALUES (?,?,?,?)`,
      [senderId, priceAmount, actingEmployeeId, tracking]
    )

    // ── DELIVERY ──
    await conn.query(
      `INSERT INTO delivery
       (Tracking_Number, Delivered_Date, Signature_Required, Signature_Received, Delivered_By)
       VALUES (?,NULL,?,NULL,NULL)`,
      [tracking, sigRequired ? 1 : 0]
    )

    // ── SHIPMENT ──
    const [shipRes] = await conn.query(
      `INSERT INTO shipment (
        Status_Code,
        Employee_ID,
        From_Address_ID,
        To_Address_ID,
        Departure_Time_Stamp,
        Arrival_Time_Stamp
      )
      VALUES (?,?,?,?,NULL,NULL)`,
      [pendingCode, actingEmployeeId, senderAddrId, recipientAddrId]
    )

    const shipmentId = shipRes.insertId

    await conn.query(
      `INSERT INTO shipment_package (Shipment_ID, Tracking_Number)
       VALUES (?,?)`,
      [shipmentId, tracking]
    )

    await conn.commit()

    return send(res, 201, {
      tracking_number: tracking,
      price: priceAmount,
      sender_id: senderId,
      recipient_id: recipientId,
    })
  } catch (err) {
    await conn.rollback()
    console.error(err)

    return send(res, 500, {
      message: err.message || 'Could not create package',
    })
  } finally {
    conn.release()
  }
}
  
    // ── GET /api/reports/employee-performance ────────────────────────────────

if (method === 'GET' && pathname === '/api/reports/employee-performance') {
  const user = authenticate(req, res)
  if (!user) return
  if (!requireAdmin(user, res)) return

  const { department_id, post_office_id, date_from, date_to } = query

  try {
    const conditions = ['e.Role_ID NOT IN (SELECT Role_ID FROM role WHERE Role_Name IN (\'Manager\', \'Admin\', \'Supervisor\'))']
    const params = []

    if (department_id)  { conditions.push('e.Department_ID = ?');               params.push(Number(department_id)) }
    if (post_office_id) { conditions.push('e.Post_Office_ID = ?');              params.push(Number(post_office_id)) }
    if (date_from)      { conditions.push('s.Departure_Time_Stamp >= ?');       params.push(date_from) }
    if (date_to)        { conditions.push('s.Departure_Time_Stamp <= ?');       params.push(date_to + ' 23:59:59') }

    const whereClause = `WHERE ${conditions.join(' AND ')}`

    const [rows] = await pool.query(
      `SELECT
        e.Employee_ID,
        CONCAT(e.First_Name, ' ', e.Last_Name) AS Employee_Name,
        e.Email_Address,
        r.Role_Name,
        d.Department_Name,
        off_addr.City AS Office_City,
        off_addr.State AS Office_State,
        COUNT(DISTINCT s.Shipment_ID) AS Total_Shipments,
        COUNT(DISTINCT sp.Tracking_Number) AS Total_Packages,
        ROUND(COUNT(DISTINCT sp.Tracking_Number) / NULLIF(COUNT(DISTINCT s.Shipment_ID), 0), 1) AS Avg_Packages_Per_Shipment,
        (
          SELECT COALESCE(SUM(pay2.Payment_Amount), 0)
          FROM shipment s2
          JOIN shipment_package sp2 ON sp2.Shipment_ID = s2.Shipment_ID
          LEFT JOIN payment pay2 ON pay2.Tracking_Number = sp2.Tracking_Number
          WHERE s2.Employee_ID = e.Employee_ID
        ) AS Total_Revenue,
        (
          SELECT COALESCE(AVG(pay2.Payment_Amount), 0)
          FROM shipment s2
          JOIN shipment_package sp2 ON sp2.Shipment_ID = s2.Shipment_ID
          LEFT JOIN payment pay2 ON pay2.Tracking_Number = sp2.Tracking_Number
          WHERE s2.Employee_ID = e.Employee_ID
        ) AS Avg_Revenue_Per_Shipment,
        (
          SELECT ROUND(
            COUNT(CASE WHEN pkg2.Status_Code = 4 THEN 1 END) * 100.0 /
            NULLIF(COUNT(*), 0), 1)
          FROM shipment s2
          JOIN shipment_package sp2 ON sp2.Shipment_ID = s2.Shipment_ID
          JOIN package pkg2 ON pkg2.Tracking_Number = sp2.Tracking_Number
          WHERE s2.Employee_ID = e.Employee_ID
        ) AS Delivery_Success_Rate,
        (
          SELECT COUNT(*)
          FROM shipment s2
          JOIN shipment_package sp2 ON sp2.Shipment_ID = s2.Shipment_ID
          JOIN package pkg2 ON pkg2.Tracking_Number = sp2.Tracking_Number
          WHERE s2.Employee_ID = e.Employee_ID AND pkg2.Oversize = 1
        ) AS Oversize_Packages,
        MAX(s.Departure_Time_Stamp) AS Last_Shipment_Date
      FROM employee e
      JOIN role r ON e.Role_ID = r.Role_ID
      JOIN department d ON e.Department_ID = d.Department_ID
      JOIN post_office po ON e.Post_Office_ID = po.Post_Office_ID
      JOIN address off_addr ON off_addr.Address_ID = po.Address_ID
      LEFT JOIN shipment s ON s.Employee_ID = e.Employee_ID
      LEFT JOIN shipment_package sp ON sp.Shipment_ID = s.Shipment_ID
      LEFT JOIN package pkg ON pkg.Tracking_Number = sp.Tracking_Number
      ${whereClause}
      GROUP BY e.Employee_ID, e.First_Name, e.Last_Name, e.Email_Address,
               r.Role_Name, d.Department_Name, off_addr.City, off_addr.State
      ORDER BY Total_Packages DESC`,
      params
    )
    return send(res, 200, { report: rows })
  } catch (err) {
    console.error(err)
    return send(res, 500, { message: err.message || 'Server error' })
  }
}

// /api/employee/packages/:trackingNumber/status
{
  const m = matchPath('/api/employee/packages/:trackingNumber/status', pathname)
  if (method === 'PATCH' && m.matched) {
    // const user = authenticate(req, res)
    // if (!user) return
    // if (!requireEmployee(user, res)) return

    const trackingNumber = (m.params.trackingNumber || '').trim()
    const body = await getBody(req)
    const { status_code } = body || {}

    if (!trackingNumber)
      return send(res, 400, { message: 'trackingNumber required' })
    if (status_code === undefined || status_code === null)
      return send(res, 400, { message: 'status_code is required' })

    const code = Number(status_code)
    if (Number.isNaN(code))
      return send(res, 400, { message: 'status_code must be a number' })

    const conn = await pool.getConnection()
    try {
      await conn.beginTransaction()

      const [[d]] = await conn.query(
        `SELECT Delivery_ID FROM delivery WHERE Tracking_Number = ?`,
        [trackingNumber]
      )
      if (!d) {
        await conn.rollback()
        return send(res, 404, { message: 'Delivery record not found for this package' })
      }

      await conn.query(
        `UPDATE delivery SET Delivery_Status_Code = ? WHERE Tracking_Number = ?`,
        [code, trackingNumber]
      )

      await conn.query(
        `UPDATE package SET Status_Code = ? WHERE Tracking_Number = ?`,
        [code, trackingNumber]
      )

      const [sp] = await conn.query(
        `SELECT Shipment_ID FROM shipment_package WHERE Tracking_Number = ? LIMIT 1`,
        [trackingNumber]
      )
      if (sp.length) {
        await conn.query(
          `UPDATE shipment SET Status_Code = ? WHERE Shipment_ID = ?`,
          [code, sp[0].Shipment_ID]
        )
      }

      await conn.commit()
      return send(res, 200, { ok: true, tracking_number: trackingNumber, status_code: code })
    } catch (err) {
      await conn.rollback()
      console.error(err)
      return send(res, 500, { message: err.message || 'Update failed' })
    } finally {
      conn.release()
    }
  }
}

// ── GET /api/reports/location-stats ─────────────────────────────────────
if (method === 'GET' && pathname === '/api/reports/location-stats') {
  const user = authenticate(req, res)
  if (!user) return
  if (!requireAdmin(user, res)) return

  const { date_from, date_to } = query
  const conditions = []
  const params = []

  if (date_from) { conditions.push('s.Departure_Time_Stamp >= ?'); params.push(date_from) }
  if (date_to)   { conditions.push('s.Departure_Time_Stamp <= ?'); params.push(date_to + ' 23:59:59') }

  const whereClause = conditions.length ? `AND ${conditions.join(' AND ')}` : ''

  try {
    const [rows] = await pool.query(
      `SELECT
        po.Post_Office_ID,
        addr.City,
        addr.State,
        CONCAT(addr.House_Number, ' ', addr.Street, ', ', addr.City, ', ', addr.State) AS Full_Address,
        COUNT(DISTINCT s.Shipment_ID) AS Total_Shipments,
        COUNT(DISTINCT sp.Tracking_Number) AS Total_Packages,
        COALESCE(SUM(pay.Payment_Amount), 0) AS Total_Revenue,
        COALESCE(AVG(pay.Payment_Amount), 0) AS Avg_Package_Price,
        COUNT(DISTINCT e.Employee_ID) AS Total_Employees
      FROM post_office po
      JOIN address addr ON addr.Address_ID = po.Address_ID
      LEFT JOIN employee e ON e.Post_Office_ID = po.Post_Office_ID
      LEFT JOIN shipment s ON s.Employee_ID = e.Employee_ID ${whereClause}
      LEFT JOIN shipment_package sp ON sp.Shipment_ID = s.Shipment_ID
      LEFT JOIN package pkg ON pkg.Tracking_Number = sp.Tracking_Number
      LEFT JOIN payment pay ON pay.Tracking_Number = sp.Tracking_Number
      GROUP BY po.Post_Office_ID, addr.City, addr.State, addr.House_Number, addr.Street
      ORDER BY Total_Packages DESC`,
      params
    )
    return send(res, 200, { locations: rows })
  } catch (err) {
    console.error(err)
    return send(res, 500, { message: err.message || 'Server error' })
  }
}

// ── GET /api/reports/department-stats ────────────────────────────────────
if (method === 'GET' && pathname === '/api/reports/department-stats') {
  const user = authenticate(req, res)
  if (!user) return
  if (!requireAdmin(user, res)) return

  const { date_from, date_to } = query
  const conditions = []
  const params = []

  if (date_from) { conditions.push('s.Departure_Time_Stamp >= ?'); params.push(date_from) }
  if (date_to)   { conditions.push('s.Departure_Time_Stamp <= ?'); params.push(date_to + ' 23:59:59') }

  const whereClause = conditions.length ? `AND ${conditions.join(' AND ')}` : ''

  try {
    const [rows] = await pool.query(
      `SELECT
        d.Department_ID,
        d.Department_Name,
        COUNT(DISTINCT e.Employee_ID) AS Total_Employees,
        COUNT(DISTINCT s.Shipment_ID) AS Total_Shipments,
        COUNT(DISTINCT sp.Tracking_Number) AS Total_Packages,
        COALESCE(SUM(pay.Payment_Amount), 0) AS Total_Revenue,
        ROUND(
          COUNT(CASE WHEN pkg.Status_Code = 4 THEN 1 END) * 100.0 /
          NULLIF(COUNT(DISTINCT sp.Tracking_Number), 0), 1
        ) AS Delivery_Success_Rate
      FROM department d
      LEFT JOIN employee e ON e.Department_ID = d.Department_ID
      LEFT JOIN shipment s ON s.Employee_ID = e.Employee_ID ${whereClause}
      LEFT JOIN shipment_package sp ON sp.Shipment_ID = s.Shipment_ID
      LEFT JOIN package pkg ON pkg.Tracking_Number = sp.Tracking_Number
      LEFT JOIN payment pay ON pay.Tracking_Number = sp.Tracking_Number
      GROUP BY d.Department_ID, d.Department_Name
      ORDER BY Total_Packages DESC`,
      params
    )
    return send(res, 200, { departments: rows })
  } catch (err) {
    console.error(err)
    return send(res, 500, { message: err.message || 'Server error' })
  }
}

// ── GET /api/employee/shipments-for-package/:trackingNumber ────────────────
{
  const m = matchPath('/api/employee/shipments-for-package/:trackingNumber', pathname)
  if (method === 'GET' && m.matched) {
    const user = authenticate(req, res); if (!user) return
    if (!requireEmployee(user, res)) return
    const tn = m.params.trackingNumber.trim()
    if (!tn) return send(res, 400, { message: 'trackingNumber is required' })
    try {
      const [rows] = await pool.query(
        `SELECT
           s.Shipment_ID,
           s.Departure_Time_Stamp,
           s.Arrival_Time_Stamp,
           sc.Status_Name,
           CONCAT(s.From_Street, ', ', s.From_City, ', ', s.From_State) AS From_Summary,
           CONCAT(s.To_Street, ', ', s.To_City, ', ', s.To_State) AS To_Summary
         FROM shipment_package sp
         INNER JOIN shipment s ON sp.Shipment_ID = s.Shipment_ID
         INNER JOIN status_code sc ON s.Status_Code = sc.Status_Code
         WHERE sp.Tracking_Number = ?
         ORDER BY s.Shipment_ID ASC`,
        [tn]
      )
      return send(res, 200, rows)
    } catch (err) {
      console.error(err)
      return send(res, 500, { message: err.sqlMessage || err.message || 'Database error' })
    }
  }
}

// ── GET /api/employee/shipment/:shipmentId/routing-events ─────────────────
{
  const m = matchPath('/api/employee/shipment/:shipmentId/routing-events', pathname)
  if (method === 'GET' && m.matched) {
    const user = authenticate(req, res); if (!user) return
    if (!requireEmployee(user, res)) return
    const sid = Number(m.params.shipmentId)
    if (!Number.isFinite(sid)) return send(res, 400, { message: 'Invalid shipment id' })
    try {
      const rows = await queryRoutingEventsForShipmentId(pool, sid)
      return send(res, 200, sortRoutingDeliveredLast(rows))
    } catch (err) {
      console.error(err)
      if (err.code === 'ER_NO_SUCH_TABLE') {
        return send(res, 500, {
          message:
            'Table shipment_routing_event is missing. Run backend/db/shipment_routing_schema.sql',
        })
      }
      return send(res, 500, { message: err.sqlMessage || err.message || 'Database error' })
    }
  }
}

// ── POST /api/employee/shipment/routing-event ─────────────────────────────
if (method === 'POST' && pathname === '/api/employee/shipment/routing-event') {
  const user = authenticate(req, res); if (!user) return
  if (!requireEmployee(user, res)) return
  const body = await getBody(req)
  const sid = Number(body.shipment_id)
  const poid = Number(body.post_office_id)
  const eventType = String(body.event_type || '').toLowerCase().trim()
  const eventTime = toMysqlDateTime(body.event_time) || dateToMysqlDateTime(new Date())
  const empId = Number(user.employee_id)

  if (!Number.isFinite(sid)) return send(res, 400, { message: 'shipment_id is required' })
  if (!Number.isFinite(poid)) return send(res, 400, { message: 'post_office_id is required' })
  if (!['arrival', 'departure'].includes(eventType)) {
    return send(res, 400, { message: 'event_type must be arrival or departure' })
  }
  if (!eventTime) return send(res, 400, { message: 'event_time is invalid' })

  try {
    const [[sh]] = await pool.query(`SELECT Shipment_ID FROM shipment WHERE Shipment_ID = ?`, [sid])
    if (!sh) return send(res, 404, { message: 'Shipment not found' })

    await pool.query(
      `INSERT INTO shipment_routing_event
         (Shipment_ID, Post_Office_ID, Event_Type, Event_Time, Logged_By_Employee_ID)
       VALUES (?, ?, ?, ?, ?)`,
      [sid, poid, eventType, eventTime, Number.isFinite(empId) ? empId : null]
    )
    return send(res, 201, { ok: true, shipment_id: sid, event_type: eventType, event_time: eventTime })
  } catch (err) {
    console.error(err)
    if (err.code === 'ER_NO_SUCH_TABLE') {
      return send(res, 500, {
        message:
          'Table shipment_routing_event is missing. Run backend/db/shipment_routing_schema.sql',
      })
    }
    return send(res, 500, { message: err.sqlMessage || err.message || 'Could not log event' })
  }
}

// ── POST /api/employee/package-pickup-arrival (arrival only; not picked up yet) ─
if (method === 'POST' && pathname === '/api/employee/package-pickup-arrival') {
  const user = authenticate(req, res); if (!user) return
  if (!requireEmployee(user, res)) return
  const body = await getBody(req)
  const tracking_number = String(body.tracking_number || '').trim()
  const recipient_id = Number(body.recipient_id)
  const post_office_id = Number(body.post_office_id)
  const arrival_time = body.arrival_time

  if (!tracking_number) return send(res, 400, { message: 'tracking_number is required' })
  if (!Number.isFinite(recipient_id)) return send(res, 400, { message: 'recipient_id is required' })
  if (!Number.isFinite(post_office_id)) return send(res, 400, { message: 'post_office_id is required' })

  try {
    const [[sh]] = await pool.query(
      `SELECT s.Shipment_ID, s.Arrival_Time_Stamp
       FROM shipment_package sp
       INNER JOIN shipment s ON s.Shipment_ID = sp.Shipment_ID
       WHERE sp.Tracking_Number = ?
       ORDER BY sp.Shipment_ID DESC
       LIMIT 1`,
      [tracking_number]
    )

    const resolvedArrival = resolveArrivalForPickup(sh?.Arrival_Time_Stamp, arrival_time) || dateToMysqlDateTime(new Date())

    await pool.query(
      `INSERT INTO package_pickup (Tracking_Number, Recipient_ID, Post_Office_ID, Arrival_Time, Is_picked_Up)
       VALUES (?, ?, ?, ?, '0')
       ON DUPLICATE KEY UPDATE
         Recipient_ID = VALUES(Recipient_ID),
         Post_Office_ID = VALUES(Post_Office_ID),
         Arrival_Time = COALESCE(package_pickup.Arrival_Time, VALUES(Arrival_Time)),
         Is_picked_Up = COALESCE(package_pickup.Is_picked_Up, '0')`,
      [tracking_number, recipient_id, post_office_id, resolvedArrival]
    )

    const lateFeeAtConfirm = pickupLateFeeFromArrivalAndPickup(resolvedArrival, new Date())
    const [[parties]] = await pool.query(
      `SELECT
         CONCAT(cs.First_Name, ' ', cs.Last_Name) AS Sender_Name,
         CONCAT(cr.First_Name, ' ', cr.Last_Name) AS Recipient_Name
       FROM package p
       LEFT JOIN customer cs ON cs.Customer_ID = p.Sender_ID
       LEFT JOIN customer cr ON cr.Customer_ID = p.Recipient_ID
       WHERE p.Tracking_Number = ?
       LIMIT 1`,
      [tracking_number]
    )

    return send(res, 200, {
      ok: true,
      tracking_number,
      arrival_time: resolvedArrival,
      shipment_id: sh?.Shipment_ID ?? null,
      late_fee_amount: lateFeeAtConfirm,
      late_fee_triggered: lateFeeAtConfirm > 0,
      sender_name: parties?.Sender_Name ?? null,
      recipient_name: parties?.Recipient_Name ?? null,
    })
  } catch (err) {
    console.error(err)
    return send(res, 500, { message: err.sqlMessage || err.message || 'Could not record pickup arrival' })
  }
}

// ── GET /api/employee/post-offices (dropdown) ───────────────────────────────
if (method === 'GET' && pathname === '/api/employee/post-offices') {
  const user = authenticate(req, res); if (!user) return
  if (!requireEmployee(user, res)) return
  try {
    const [rows] = await pool.query(
      `SELECT
         po.Post_Office_ID,
         a.House_Number,
         a.Street,
         a.City,
         a.State,
         a.Zip_Code,
         NULLIF(TRIM(CONCAT(COALESCE(a.Street, ''), ', ', COALESCE(a.City, ''), ', ', COALESCE(a.State, ''))), '') AS Street_Label
       FROM post_office po
       JOIN address a ON a.Address_ID = po.Address_ID
       ORDER BY a.State ASC, a.City ASC, a.Street ASC`
    )
    return send(res, 200, rows)
  } catch (err) {
    console.error(err)
    return send(res, 500, { message: err.sqlMessage || err.message || 'Could not load post offices' })
  }
}

// ── GET /api/employee/packages-at-office (pickup dashboard) ─────────────────
if (method === 'GET' && pathname === '/api/employee/packages-at-office') {
  const user = authenticate(req, res); if (!user) return
  if (!requireEmployee(user, res)) return
  try {
    const [rows] = await pool.query(
      `SELECT
         pkg.Tracking_Number,
         pkg.Package_Type_Code,
         pkg.Weight,
         pkg.Recipient_ID,
         CONCAT(r.First_Name, ' ', r.Last_Name) AS Recipient_Name,
         sc.Status_Name,
         pp.Arrival_Time AS Pickup_Arrival_Time,
         MAX(sh.Arrival_Time_Stamp) AS Shipment_Arrival_Stamp
       FROM package pkg
       INNER JOIN package d ON d.Tracking_Number = pkg.Tracking_Number
       INNER JOIN status_code sc ON sc.Status_Code = d.Status_Code
       LEFT JOIN customer r ON r.Customer_ID = pkg.Recipient_ID
       LEFT JOIN package_pickup pp ON pp.Tracking_Number = pkg.Tracking_Number
       LEFT JOIN shipment_package sp ON sp.Tracking_Number = pkg.Tracking_Number
       LEFT JOIN shipment sh ON sh.Shipment_ID = sp.Shipment_ID
       WHERE (
         LOWER(TRIM(REPLACE(REPLACE(REPLACE(IFNULL(sc.Status_Name, ''), '-', ' '), '_', ' '), '  ', ' '))) = 'at office'
         OR REPLACE(LOWER(TRIM(IFNULL(sc.Status_Name, ''))), ' ', '') LIKE '%atoffice%'
       )
         AND (pp.Is_picked_Up IS NULL OR TRIM(IFNULL(pp.Is_picked_Up, '0')) = '0')
       GROUP BY
         pkg.Tracking_Number,
         pkg.Package_Type_Code,
         pkg.Weight,
         pkg.Recipient_ID,
         Recipient_Name,
         sc.Status_Name,
         pp.Arrival_Time
       ORDER BY pkg.Tracking_Number ASC`
    )
    return send(res, 200, rows)
  } catch (err) {
    console.error(err)
    return send(res, 500, { message: err.sqlMessage || err.message || 'Could not load at-office packages' })
  }
}

// ── POST /api/employee/package-pickup (complete pickup) ─────────────────────
if (method === 'POST' && pathname === '/api/employee/package-pickup') {
  const user = authenticate(req, res); if (!user) return
  if (!requireEmployee(user, res)) return
  const body = await getBody(req)
  const tracking_number = String(body.tracking_number || '').trim()
  const recipient_id = Number(body.recipient_id)
  const post_office_id = Number(body.post_office_id)
  const arrival_time = body.arrival_time
  const pickup_time = body.pickup_time

  if (!tracking_number) return send(res, 400, { message: 'tracking_number is required' })
  if (!Number.isFinite(recipient_id)) return send(res, 400, { message: 'recipient_id is required' })
  if (!Number.isFinite(post_office_id)) return send(res, 400, { message: 'post_office_id is required' })
  if (!pickup_time) return send(res, 400, { message: 'pickup_time is required' })

  try {
    const [[sh]] = await pool.query(
      `SELECT s.Shipment_ID, s.Arrival_Time_Stamp
       FROM shipment_package sp
       INNER JOIN shipment s ON s.Shipment_ID = sp.Shipment_ID
       WHERE sp.Tracking_Number = ?
       ORDER BY sp.Shipment_ID DESC
       LIMIT 1`,
      [tracking_number]
    )

    const resolvedArrival =
      resolveArrivalForPickup(sh?.Arrival_Time_Stamp, arrival_time) || dateToMysqlDateTime(new Date())
    const resolvedPickup = toMysqlDateTime(pickup_time) || dateToMysqlDateTime(new Date())

    const [[ppExisting]] = await pool.query(
      `SELECT Arrival_Time FROM package_pickup WHERE Tracking_Number = ? LIMIT 1`,
      [tracking_number]
    )
    const arrivalForFee =
      ppExisting?.Arrival_Time != null
        ? ppExisting.Arrival_Time
        : resolvedArrival
    const lateFeeAmount = pickupLateFeeFromArrivalAndPickup(arrivalForFee, resolvedPickup)

    await pool.query(
      `INSERT INTO package_pickup (Tracking_Number, Recipient_ID, Post_Office_ID, Arrival_Time, Pickup_Time, Is_picked_Up, Late_Fee_Amount)
       VALUES (?, ?, ?, ?, ?, '1', ?)
       ON DUPLICATE KEY UPDATE
         Recipient_ID = VALUES(Recipient_ID),
         Post_Office_ID = VALUES(Post_Office_ID),
         Arrival_Time = COALESCE(package_pickup.Arrival_Time, VALUES(Arrival_Time)),
         Pickup_Time = VALUES(Pickup_Time),
         Is_picked_Up = '1',
         Late_Fee_Amount = VALUES(Late_Fee_Amount)`,
      [tracking_number, recipient_id, post_office_id, resolvedArrival, resolvedPickup, lateFeeAmount]
    )

    // Best-effort: if the DB has a "Picked Up" status code, set it on delivery + latest shipment.
    const [[pickedUpRow]] = await pool.query(
      `SELECT Status_Code
       FROM status_code
       WHERE REPLACE(LOWER(TRIM(IFNULL(Status_Name, ''))), ' ', '') LIKE '%pickedup%'
       LIMIT 1`
    )
    const pickedUpCode = pickedUpRow?.Status_Code ?? null

    let status_updated = false
    if (pickedUpCode != null) {
      await pool.query(
        `UPDATE package
        SET Status_Code = ?
        WHERE Tracking_Number = ?`,
        [pickedUpCode, tracking_number]
      )

      if (sh?.Shipment_ID != null) {
        await pool.query(
          `UPDATE shipment
          SET Status_Code = ?
          WHERE Shipment_ID = ?`,
          [pickedUpCode, sh.Shipment_ID]
        )
      }

  status_updated = true
}

    const [[partiesPickup]] = await pool.query(
      `SELECT
         CONCAT(cs.First_Name, ' ', cs.Last_Name) AS Sender_Name,
         CONCAT(cr.First_Name, ' ', cr.Last_Name) AS Recipient_Name
       FROM package p
       LEFT JOIN customer cs ON cs.Customer_ID = p.Sender_ID
       LEFT JOIN customer cr ON cr.Customer_ID = p.Recipient_ID
       WHERE p.Tracking_Number = ?
       LIMIT 1`,
      [tracking_number]
    )

    return send(res, 200, {
      ok: true,
      tracking_number,
      arrival_time: resolvedArrival,
      pickup_time: resolvedPickup,
      late_fee_amount: lateFeeAmount,
      late_fee_triggered: lateFeeAmount > 0,
      sender_name: partiesPickup?.Sender_Name ?? null,
      recipient_name: partiesPickup?.Recipient_Name ?? null,
      shipment_id: sh?.Shipment_ID ?? null,
      status_updated,
    })
  } catch (err) {
    console.error(err)
    return send(res, 500, { message: err.sqlMessage || err.message || 'Could not complete pickup' })
  }
}

// ── GET /api/reports/zone-stats ───────────────────────────────────────────
if (method === 'GET' && pathname === '/api/reports/zone-stats') {
  const user = authenticate(req, res)
  if (!user) return
  if (!requireAdmin(user, res)) return

  const { date_from, date_to } = query
  const conditions = []
  const params = []

  if (date_from) { conditions.push('pkg.Date_Created >= ?'); params.push(date_from) }
  if (date_to)   { conditions.push('pkg.Date_Created <= ?'); params.push(date_to + ' 23:59:59') }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  try {
    const [rows] = await pool.query(
      `SELECT
        pkg.Zone,
        COUNT(*) AS Total_Packages,
        COALESCE(SUM(pay.Payment_Amount), 0) AS Total_Revenue,
        COALESCE(AVG(pay.Payment_Amount), 0) AS Avg_Price,
        COALESCE(AVG(pkg.Weight), 0) AS Avg_Weight,
        COUNT(CASE WHEN pkg.Oversize = 1 THEN 1 END) AS Oversize_Count
      FROM package pkg
      LEFT JOIN payment pay ON pay.Tracking_Number = pkg.Tracking_Number
      ${whereClause}
      GROUP BY pkg.Zone
      ORDER BY pkg.Zone ASC`,
      params
    )
    return send(res, 200, { zones: rows })
  } catch (err) {
    console.error(err)
    return send(res, 500, { message: err.message || 'Server error' })
  }
}

// ── GET /api/reports/departments (filter dropdown) ────────────────────────
if (method === 'GET' && pathname === '/api/reports/departments') {
  const user = authenticate(req, res)
  if (!user) return
  if (!requireAdmin(user, res)) return
  try {
    const [rows] = await pool.query('SELECT Department_ID, Department_Name FROM department ORDER BY Department_Name ASC')
    return send(res, 200, rows)
  } catch (err) {
    return send(res, 500, { message: 'Server error' })
  }
}

// ── GET /api/reports/post-offices (filter dropdown) ───────────────────────
if (method === 'GET' && pathname === '/api/reports/post-offices') {
  const user = authenticate(req, res)
  if (!user) return
  if (!requireEmployee(user, res)) return
  try {
    const [rows] = await pool.query(`SELECT po.Post_Office_ID, a.City, a.State
      FROM post_office po
      JOIN address a ON po.Address_ID = a.Address_ID
      ORDER BY a.State ASC, a.City ASC;`)
    return send(res, 200, rows)
  } catch (err) {
    return send(res, 500, { message: 'Server error' })
  }
}

// ── GET /api/packages/full

if (method === 'GET' && pathname === '/api/packages/full') {
  const user = authenticate(req, res)
  if (!user) return
  if (!requireEmployee(user, res)) return

  const { zone, post_office_id, package_type, status } = query

  try {
    const conditions = []
    const params = []

    if (zone)           { conditions.push('pkg.Zone = ?');           params.push(Number(zone)) }
    if (package_type)   { conditions.push('pkg.Package_Type_Code = ?');   params.push(package_type) }
    if (status)         { conditions.push('pkg.Status_Code = ?');  params.push(Number(status)) }
    if (post_office_id) { conditions.push('po.Post_Office_ID = ?');       params.push(Number(post_office_id)) }

    const whereClause = conditions.length ? `AND ${conditions.join(' AND ')}` : ''

    const [rows] = await pool.query(
      `SELECT
        pkg.Tracking_Number,
        pkg.Package_Type_Code,
        pkg.Weight,
        pkg.Zone,
        pay.Payment_Amount AS Price,
        pkg.Date_Created,
        pkg.Oversize,
        pkg.Requires_Signature,
        pkg.Date_Updated,
        pkg.Dim_X, pkg.Dim_Y, pkg.Dim_Z,

        -- Sender info
        pkg.Sender_ID,
        CONCAT(s.First_Name, ' ', s.Last_Name) AS Sender_Name,
        s.Email_Address AS Sender_Email,

        -- Recipient info
        pkg.Recipient_ID,
        CONCAT(r.First_Name, ' ', r.Last_Name) AS Recipient_Name,
        r.Email_Address AS Recipient_Email,

        -- Delivery info
        -- Delivery info
          pkg.Status_Code,
          d.Delivery_Status_Code,
          d.Delivered_Date,
          d.Signature_Required,
          sc.Status_Name,
          sc.Is_Final_Status,

        -- Shipment info (Now joined from Address table)
        addr_f.City AS From_City,
        addr_f.State AS From_State,
        addr_t.City AS To_City,
        addr_t.State AS To_State,

        -- Post Office info (Now joined from Address table)
        addr_po.City AS Office_City,
        po.Post_Office_ID,

        -- Employee who handled it
        CONCAT(e.First_Name, ' ', e.Last_Name) AS Handled_By
      FROM package pkg
      LEFT JOIN Payment pay ON pay.Tracking_Number =  pkg.Tracking_Number
      LEFT JOIN customer s  ON s.Customer_ID  = pkg.Sender_ID
      LEFT JOIN customer r  ON r.Customer_ID  = pkg.Recipient_ID
      LEFT JOIN delivery d  ON d.Tracking_Number = pkg.Tracking_Number
      LEFT JOIN status_code sc ON sc.Status_Code = d.Delivery_Status_Code
      LEFT JOIN shipment_package sp ON sp.Tracking_Number = pkg.Tracking_Number
      LEFT JOIN shipment sh ON sh.Shipment_ID = sp.Shipment_ID
      -- Joins for the new Address table
      LEFT JOIN Address addr_f ON sh.From_Address_ID = addr_f.Address_ID
      LEFT JOIN Address addr_t ON sh.To_Address_ID = addr_t.Address_ID
      LEFT JOIN employee e  ON e.Employee_ID  = sh.Employee_ID
      LEFT JOIN post_office po ON po.Post_Office_ID = e.Post_Office_ID
      LEFT JOIN Address addr_po ON po.Address_ID = addr_po.Address_ID
      WHERE 1=1 ${whereClause}
      ORDER BY pkg.Tracking_Number ASC`,
      params
    )
    return send(res, 200, rows)
  } catch (err) {
    console.error(err)
    return send(res, 500, { message: err.message || 'Server error' })
  }
}


  // ── GET /api/status-codes ────────────────────────────────────────────────
  if (method === 'GET' && pathname === '/api/status-codes') {
    const user = authenticate(req, res)
    if (!user) return
    if (!requireEmployee(user, res)) return
    try {
      const [rows] = await pool.query(
        `SELECT Status_Code, Status_Name, Is_Final_Status FROM status_code ORDER BY Status_Code ASC`
      )
      return send(res, 200, rows)
    } catch (err) {
      console.error(err)
      return send(res, 500, { message: 'Database error' })
    }
  }

  // ── GET /api/inventory (employee+admin) ──────────────────────────────────
  if (method === 'GET' && pathname === '/api/inventory') {
    const user = authenticate(req, res)
    if (!user) return
    if (!requireEmployee(user, res)) return

    inventoryDB.getAllInventory(pool, (err, results) => {
      if (err) return send(res, 500, { error: 'Database error' })
      return send(res, 200, results)
    })
    return
  }

  // ── POST /api/tickets (PUBLIC submit) ────────────────────────────────────
  if (method === 'POST' && pathname === '/api/tickets') {
    const user = authenticate(req, res)
    if (!user) return
    if (user?.type !== 'customer' || user.customer_id == null) {
      return send(res, 403, { message: 'Customer access required' })
    }

    const { Tracking_Number, Issue_Type, Description } = await getBody(req)
    const issueTypeNum = Number(Issue_Type)
    if (!Tracking_Number || Issue_Type === undefined || !Description) {
      return send(res, 400, { message: 'Missing required fields' })
    }
    if (!Number.isInteger(issueTypeNum) || issueTypeNum < 1 || issueTypeNum > 4) {
      return send(res, 400, { message: 'Invalid issue type' })
    }
    
    try {
      const [ownedPackage] = await pool.query(
        `SELECT Tracking_Number
         FROM package
         WHERE Tracking_Number = ? AND (Sender_ID = ? OR Recipient_ID = ?)
         LIMIT 1`,
        [Tracking_Number, user.customer_id, user.customer_id]
      )

      if (!ownedPackage.length) {
        return send(res, 403, { message: 'You can only submit tickets for your own packages' })
      }

      const [EmpRow] = await employeeDB.employeeByTickets(pool)
      const assignedEmpId = EmpRow?.Employee_ID

      if (!assignedEmpId) {
        return send(res, 500, { message: 'No available employee to assign' })
      }
      await pool.query(
        `INSERT INTO support_ticket (User_ID, Package_ID, Issue_Type, Description, Ticket_Status_Code, Assigned_Employee_ID)
        VALUES (?, ?, ?, ?, 0, ?)`,
        [user.customer_id, Tracking_Number, issueTypeNum, Description, assignedEmpId]
      )
      return send(res, 201, { message: 'Ticket submitted successfully' })
    } catch (err) {
      console.error('POST /api/tickets error:', err)
      return send(res, 500, { error: err.message || 'Failed to create ticket' })
    }
  }

  
  // ── GET /api/customers (employee+admin) ──────────────────────────────────
  if (method === 'GET' && pathname === '/api/customers') {
    const user = authenticate(req, res)
    if (!user) return
    if (!requireEmployee(user, res)) return

    customerDB.getAllCustomers(pool, (err, results) => {
      if (err) return send(res, 500, { error: err.message })
      return send(res, 200, results)
    })
    return
  }

  // ── GET /api/customers/:id/packages (employee+admin) ─────────────────────
  {
    const m = matchPath('/api/customers/:id/packages', pathname)
    // console.log("at customer/packages")
    if (method === 'GET' && m.matched) {
      const user = authenticate(req, res)
      if (!user) return
      if (!requireEmployee(user, res)) return

      customerDB.getCustomerPackages(pool, m.params.id, (err, results) => {
        if (err) return send(res, 500, { error: err.message })
        return send(res, 200, results)
      })
      return
    }
  }

  // ── GET /api/shipments (employee+admin) ──────────────────────────────────
  if (method === 'GET' && pathname === '/api/shipments') {
    const user = authenticate(req, res)
    if (!user) return
    if (!requireEmployee(user, res)) return

    try {
      const results = await shipmentDB.allShipments(pool)
      return send(res, 200, results)
    } catch (err) {
      return send(res, 500, { error: err.message })
    }
    return
  }

  // ── GET /api/shipment/:id/packages (employee+admin) ─────────────────────
  {
    const m = matchPath('/api/shipment/:id/packages', pathname)
    // console.log("at customer/packages")
    if (method === 'GET' && m.matched) {
      const user = authenticate(req, res)
      if (!user) return
      if (!requireEmployee(user, res)) return

      try {
        const results = await shipmentDB.packageByShipment(pool, m.params.id)
        return send(res, 200, results)
      } catch (err) {
        return send(res, 500, { error: err.message })
      }
      return
    }
  }

  // ── GET /api/packages/:tracking_number/tracking (employee+admin) ─────────
  {
    const m = matchPath('/api/packages/:tracking_number/tracking', pathname)
    if (method === 'GET' && m.matched) {
      const user = authenticate(req, res)
      if (!user) return
      // if (!requireEmployee(user, res)) return

      packageTrackDB.getPackageTracking(pool, m.params.tracking_number, (err, results) => {
        if (err) return send(res, 500, { error: 'Database error', details: err.message })
        return send(res, 200, results)
      })
      return
    }
  }

  // ── GET /api/customer/lookup (employee+admin) ────────────────────────────
  if (method === 'GET' && pathname === '/api/customer/lookup') {
    const user = authenticate(req, res)
    if (!user) return
    if (!requireEmployee(user, res)) return

    const email = (query.email || '').trim().toLowerCase()
    if (!email) return send(res, 400, { message: 'Email is required' })

    try {
      const [rows] = await pool.query(
        `SELECT c.Customer_ID, c.First_Name, c.Last_Name, c.Email_Address,
                c.Phone_Number, a.House_Number, a.Street, a.Apt_Number,
                a.City, a.State, a.Zip_Code,
                a.Zip_Code
         FROM customer c
         JOIN address a ON c.Address_ID = a.Address_ID
         WHERE c.Email_Address = ? LIMIT 1`,
        [email]
      )
      if (!rows.length) return send(res, 404, { message: 'Customer not found' })
      return send(res, 200, { customer: rows[0] })
    } catch (err) {
      console.error(err)
      return send(res, 500, { message: 'Server error' })
    }
  }

  // ========================================
  // ticket data report
  // ========================================
  

  // ── GET /api/employee/tickets_comp (employee+admin) ──────────────────────
  if (method === 'GET' && pathname === '/api/employee/tickets_comp') {
    const user = authenticate(req, res)
    if (!user) return
    if (!requireEmployee(user, res)) return
    try {
      const results = await employeeDB.getEmployeesRatios(pool)
      return send(res, 200, results)
    } catch (err) {
      return send(res, 500, { error: err.message })
    }
  }

  // ── GET /api/employee/:employee_id/tickets (employee+admin) ──────────────
  // {
    const m = matchPath('/api/employee/:employee_id/tickets', pathname)
    if (method === 'GET' && m.matched) {
      const user = authenticate(req, res)
      if (!user) return
      if (!requireEmployee(user, res)) return
      try {
        const results = await employeeDB.getTicketsByEmployee(pool, m.params.employee_id)
        return send(res, 200, results)
      } catch (err) {
        return send(res, 500, { error: err.message })
      }
    }
  // }


  // ── GET /api/employee/weeklyTickets ─────────────────────────────────────
  if (method === 'GET' && pathname === '/api/employee/weeklyTickets') {
    const user = authenticate(req, res)
    if (!user) return
    if (!requireEmployee(user, res)) return
    try {
      const results = await employeeDB.getWeeklyStatus(pool)
      return send(res, 200, results)
    } catch (err) {
      return send(res, 500, { error: err.message })
    }
    
  }
 
  // ── GET /api/employee/net-tickets ────────────────────────────────────────
  if (method === 'GET' && pathname === '/api/employee/net-tickets') {
    const user = authenticate(req, res)
    if (!user) return
    if (!requireEmployee(user, res)) return
    try {
      const results = await employeeDB.getNetAverage(pool)
      return send(res, 200, results)
    } catch (err) {
      return send(res, 500, { error: err.message })
    }
  }
 
  // ── GET /api/employee/week-net-tickets ───────────────────────────────────
  if (method === 'GET' && pathname === '/api/employee/week-net-tickets') {
    const user = authenticate(req, res)
    if (!user) return
    if (!requireEmployee(user, res)) return
    try {
      const results = await employeeDB.netTicketsWeek(pool)
      return send(res, 200, results)
    } catch (err) {
      return send(res, 500, { error: err.message })
    }
  }
 
  // ── GET /api/employee/tickets-by-issue ───────────────────────────────────
  if (method === 'GET' && pathname === '/api/employee/tickets-by-issue') {
    const user = authenticate(req, res)
    if (!user) return
    if (!requireEmployee(user, res)) return
    try {
      const results = await employeeDB.ticketByIssue(pool)
      return send(res, 200, results)
    } catch (err) {
      return send(res, 500, { error: err.message })
    }
  }

  // ── GET /api/support-tickets (employee+admin) ────────────────────────────
  if (method === 'GET' && pathname === '/api/support-tickets') {
    const user = authenticate(req, res)
    if (!user) return
    if (!requireEmployee(user, res)) return
    try {
      const [rows] = await pool.query(
        `SELECT
           Ticket_ID,
           User_ID,
           Package_ID,
           Assigned_Employee_ID,
           Issue_Type,
           Description,
           Resolution_Note,
           Ticket_Status_Code
         FROM support_ticket
         ORDER BY Ticket_ID DESC`
      )
      return send(res, 200, rows)
    } catch (err) {
      console.error('GET /api/support-tickets error:', err)
      return send(res, 500, { error: 'Failed to fetch tickets' })
    }
  }

  // ── PUT /api/support-tickets/:id (employee+admin) ────────────────────────
  {
    const m = matchPath('/api/support-tickets/:id', pathname)
    if (method === 'PUT' && m.matched) {
      const user = authenticate(req, res)
      if (!user) return
      if (!requireEmployee(user, res)) return

      const body = await getBody(req)
      const { Ticket_Status_Code, Resolution_Note } = body || {}

      try {
        await pool.query(
          `UPDATE Support_Ticket
           SET Ticket_Status_Code = ?,
               Resolution_Note    = ?
           WHERE Ticket_ID = ?`,
          [Ticket_Status_Code, Resolution_Note ?? null, m.params.id]
        )
        return send(res, 200, { success: true })
      } catch (err) {
        console.error('PUT /api/support-tickets/:id error:', err)
        return send(res, 500, { error: 'Failed to update ticket' })
      }
    }
  }

    // ── POST /api/support-tickets ────────────────────────────────────────────
  if (method === 'POST' && pathname === '/api/support-tickets') {
    const { User_ID, Package_ID, Assigned_Employee_ID, Issue_Type, Description } = await getBody(req)
    if (!User_ID || !Package_ID || !Assigned_Employee_ID || Issue_Type === undefined || !Description) {
      return send(res, 400, { message: 'Missing required fields' })
    }
    try {
      await pool.query(
        `INSERT INTO support_ticket (User_ID, Package_ID, Assigned_Employee_ID, Issue_Type, Description, Ticket_Status_Code)
        VALUES (?, ?, ?, ?, ?, 0)`,
        [User_ID, Package_ID, Assigned_Employee_ID, Issue_Type, Description]
      )
      return send(res, 201, { message: 'Ticket submitted successfully' })
    } catch (err) {
      console.error('POST /api/support-tickets error:', err)
      return send(res, 500, { error: err.message || 'Failed to create ticket' })
    }
  }

  if (method === 'GET' && pathname === '/api/employees') {
    try {
      const [rows] = await pool.query(
        `SELECT Employee_ID, First_Name, Last_Name FROM employee WHERE Is_Active = 1`
      )
      return send(res, 200, rows)
    } catch (err) {
      return send(res, 500, { error: err.message })
    }
  }

  // ========================================
  // Revinue-Report
  // ========================================
  if(method === 'GET' && pathname === '/api/report/fee-breakdown') {
    const user = authenticate(req, res)
    if (!user) return
    if (!requireAdmin(user, res)) return
    revenueReportDB.getFeeBreakdown(pool, query, (err,results) => {
      if(err) return send(res,500, {error: err.message})
      return send(res, 200, results)
    })
    return
  }

  if(method === 'GET' && pathname === '/api/report/packages') {
    const user = authenticate(req, res)
    if (!user) return
    if (!requireAdmin(user, res)) return
    revenueReportDB.getReportPackages(pool,query, (err,results) => {
      if(err) return send(res,500, {error:err.message })
        return send(res, 200, results)
    })
    return
  }

  if(method === 'GET' && pathname === '/api/report/payments') {
    const user = authenticate(req, res)
    if (!user) return
    if (!requireAdmin(user, res)) return
    revenueReportDB.getReportPayments(pool,query, (err,results) => {
      if(err) return send(res,500, {error: err.message })
        return send(res,200,results)
    })
    return
  }

  if (method === 'GET' && pathname === '/api/report/excess-fees') {
    const user = authenticate(req, res)
    if (!user) return
    if (!requireAdmin(user, res)) return
    revenueReportDB.getExcessFees(pool,query,(err,results) => {
      if(err) return send(res,500, {error: err.message})
        return send(res, 200, results)
    })
    return
  }

  if(method === 'GET' && pathname === '/api/report/revenue-by-month') {
    const user = authenticate(req, res)
    if (!user) return
    if (!requireAdmin(user, res)) return
    revenueReportDB.getRevenueByMonth(pool, (err,results) => {
      if(err) return send(res, 500, {error: err.message})
        return send(res,200,results)
    })
    return
  }
  //end  rev report calls

  if (method === 'GET' && pathname.startsWith('/api/packages/lost/')) {
    const user = authenticate(req, res)
    if (!user) return

    const customerId = pathname.split('/').pop()

    try {
      const results = await lostNotifsDB.getLostPackagesByCustomer(pool, customerId)
      return send(res, 200, results)
    } catch (err) {
      return send(res, 500, { error: err.message })
    }
  }

  if (method === 'PATCH' && pathname.includes('/api/packages/lost/') && pathname.endsWith('/dismiss')) {
    const user = authenticate(req, res)
    if (!user) return

    const parts = pathname.split('/')
    const trackingNumber = parts[parts.length - 2]

    try {
      const result = await lostNotifsDB.dismissLostPackage(pool, trackingNumber)

      if (result.affectedRows === 0) {
        return send(res, 404, { error: 'Package not found or already dismissed' })
      }

      return send(res, 200, { success: true })
    } catch (err) {
      return send(res, 500, { error: err.message })
    }
  }

  // PATCH /api/customers/:id is_Active flip
  {
    const m = matchPath('/api/customers/:id', pathname)
    if (method === 'PATCH' && m.matched) {
      const user = authenticate(req, res)
      if (!user) return
      if (!requireEmployee(user, res)) return

      const customerId = m.params.id
      const body = await getBody(req)
      const { is_Active } = body

      customerDB.updateCustomerStatus(pool, customerId, is_Active, (err, result) => {
        if (err) {
          console.error(err)
          return send(res, 500, { error: 'Failed to update customer status' })
        }
        return send(res, 200, { message: 'Status updated successfully' })
      })
      return
    }
  }

  // GET /api/employee/packages-at-office
  if(method === 'GET' && pathname === '/api/employee/packages-at-office') {
    const user = authenticate(req,res);
    if(!user) return;
    if(!requireEmployee(user,res)) return;

    try{
      const rows = await packagesDB.getPackagesAtOffice(pool);
      return send(res,200,rows);
    }catch (err){
      console.log(err);
      return send(res,500,{message:'Failed to load packages: ' + err.message})
    }
  }

  // POST /api/employee/package-pickup-arrival
  if (method === 'POST' && pathname === '/api/employee/package-pickup-arrival') {
    const user = authenticate(req, res)
    if (!user) return
    if (!requireEmployee(user, res)) return

    const b = await getBody(req)
    const trackingNumber = normalizeTrackingNumber(b.tracking_number)
    const recipientId = Number(b.recipient_id)
    const postOfficeId = Number(b.post_office_id)

    if (!trackingNumber || !Number.isFinite(recipientId) || !Number.isFinite(postOfficeId)) {
      return send(res, 400, { message: 'tracking_number, recipient_id, and post_office_id are required' })
    }

    const conn = await pool.getConnection()
    try {
      await conn.beginTransaction()

      const [[pkg]] = await conn.query(
        `SELECT Tracking_Number, Recipient_ID FROM package WHERE Tracking_Number = ? LIMIT 1`,
        [trackingNumber]
      )
      if (!pkg) {
        await conn.rollback()
        return send(res, 404, { message: 'Package not found' })
      }
      if (Number(pkg.Recipient_ID) !== recipientId) {
        await conn.rollback()
        return send(res, 400, { message: 'recipient_id does not match package recipient' })
      }

      const [[po]] = await conn.query(
        `SELECT Post_Office_ID FROM post_office WHERE Post_Office_ID = ? LIMIT 1`,
        [postOfficeId]
      )
      if (!po) {
        await conn.rollback()
        return send(res, 404, { message: 'Post office not found' })
      }

      const [[ship]] = await conn.query(
        `SELECT s.Arrival_Time_Stamp
         FROM shipment_package sp
         JOIN shipment s ON s.Shipment_ID = sp.Shipment_ID
         WHERE sp.Tracking_Number = ?
         ORDER BY s.Shipment_ID DESC
         LIMIT 1`,
        [trackingNumber]
      )

      const arrival = resolveArrivalForPickup(ship?.Arrival_Time_Stamp ?? null, b.arrival_time)
      if (!arrival) {
        await conn.rollback()
        return send(res, 400, { message: 'Arrival time is required when shipment has no office arrival timestamp' })
      }

      await conn.query(
        `INSERT INTO package_pickup (Tracking_Number, Recipient_ID, Post_Office_ID, Arrival_Time, Pickup_Time, Is_picked_Up, Late_Fee_Amount)
         VALUES (?, ?, ?, ?, NULL, '0', 0.00)
         ON DUPLICATE KEY UPDATE
           Recipient_ID = VALUES(Recipient_ID),
           Post_Office_ID = VALUES(Post_Office_ID),
           Arrival_Time = COALESCE(VALUES(Arrival_Time), package_pickup.Arrival_Time)`,
        [trackingNumber, recipientId, postOfficeId, arrival]
      )

      await conn.commit()
      return send(res, 200, { message: 'Arrival recorded', tracking_number: trackingNumber, arrival_time: arrival })
    } catch (err) {
      await conn.rollback()
      console.error(err)
      return send(res, 500, { message: err.message || 'Failed to record arrival' })
    } finally {
      conn.release()
    }
  }

  // POST /api/employee/package-pickup
  if (method === 'POST' && pathname === '/api/employee/package-pickup') {
    const user = authenticate(req, res)
    if (!user) return
    if (!requireEmployee(user, res)) return

    const b = await getBody(req)
    const trackingNumber = normalizeTrackingNumber(b.tracking_number)
    const recipientId = Number(b.recipient_id)
    const postOfficeId = Number(b.post_office_id)
    const pickupTime = toMysqlDateTime(b.pickup_time)

    if (!trackingNumber || !Number.isFinite(recipientId) || !Number.isFinite(postOfficeId) || !pickupTime) {
      return send(res, 400, { message: 'tracking_number, recipient_id, post_office_id, and pickup_time are required' })
    }

    const conn = await pool.getConnection()
    try {
      await conn.beginTransaction()

      const [[pkg]] = await conn.query(
        `SELECT Tracking_Number, Recipient_ID FROM package WHERE Tracking_Number = ? LIMIT 1`,
        [trackingNumber]
      )
      if (!pkg) {
        await conn.rollback()
        return send(res, 404, { message: 'Package not found' })
      }
      if (Number(pkg.Recipient_ID) !== recipientId) {
        await conn.rollback()
        return send(res, 400, { message: 'recipient_id does not match package recipient' })
      }

      const [[ship]] = await conn.query(
        `SELECT s.Arrival_Time_Stamp
         FROM shipment_package sp
         JOIN shipment s ON s.Shipment_ID = sp.Shipment_ID
         WHERE sp.Tracking_Number = ?
         ORDER BY s.Shipment_ID DESC
         LIMIT 1`,
        [trackingNumber]
      )

      const arrival = resolveArrivalForPickup(ship?.Arrival_Time_Stamp ?? null, b.arrival_time)
      if (!arrival) {
        await conn.rollback()
        return send(res, 400, { message: 'Arrival time is required when shipment has no office arrival timestamp' })
      }

      await conn.query(
        `INSERT INTO package_pickup (Tracking_Number, Recipient_ID, Post_Office_ID, Arrival_Time, Pickup_Time, Is_picked_Up, Late_Fee_Amount)
         VALUES (?, ?, ?, ?, ?, '1',
           CASE
             WHEN DATEDIFF(DATE(?), DATE(?)) > 20 THEN 20.00
             WHEN DATEDIFF(DATE(?), DATE(?)) > 10 THEN 10.00
             ELSE 0.00
           END)
         ON DUPLICATE KEY UPDATE
           Recipient_ID = VALUES(Recipient_ID),
           Post_Office_ID = VALUES(Post_Office_ID),
           Arrival_Time = COALESCE(VALUES(Arrival_Time), package_pickup.Arrival_Time),
           Pickup_Time = VALUES(Pickup_Time),
           Is_picked_Up = '1',
           Late_Fee_Amount = CASE
             WHEN DATEDIFF(DATE(VALUES(Pickup_Time)), DATE(COALESCE(VALUES(Arrival_Time), package_pickup.Arrival_Time))) > 20 THEN 20.00
             WHEN DATEDIFF(DATE(VALUES(Pickup_Time)), DATE(COALESCE(VALUES(Arrival_Time), package_pickup.Arrival_Time))) > 10 THEN 10.00
             ELSE 0.00
           END`,
        [
          trackingNumber,
          recipientId,
          postOfficeId,
          arrival,
          pickupTime,
          pickupTime,
          arrival,
          pickupTime,
          arrival,
        ]
      )

      const [[delivered]] = await conn.query(
        `SELECT Status_Code FROM status_code WHERE Status_Name = 'Delivered' LIMIT 1`
      )
      if (delivered?.Status_Code != null) {
        const deliveredCode = Number(delivered.Status_Code)
        await conn.query(`UPDATE package SET Status_Code = ? WHERE Tracking_Number = ?`, [deliveredCode, trackingNumber])
        // await conn.query(`UPDATE delivery SET Delivery_Status_Code = ? WHERE Tracking_Number = ?`, [deliveredCode, trackingNumber])
        await conn.query(
          `UPDATE shipment s
           JOIN shipment_package sp ON sp.Shipment_ID = s.Shipment_ID
           SET s.Status_Code = ?
           WHERE sp.Tracking_Number = ?`,
          [deliveredCode, trackingNumber]
        )
      }

      await conn.commit()
      return send(res, 200, { message: 'Pickup recorded', tracking_number: trackingNumber })
    } catch (err) {
      await conn.rollback()
      console.error(err)
      return send(res, 500, { message: err.message || 'Failed to complete pickup' })
    } finally {
      conn.release()
    }
  }

  // ── GET /api/operations/post-offices ─────────────────────────────────────
  if (method === 'GET' && pathname === '/api/operations/post-offices') {
    const user = authenticate(req, res)
    if (!user) return
    if (!requireAdmin(user, res)) return
    operationsDB.getPostOffices(pool, query, (err, results) => {
      if (err) return send(res, 500, { error: err.message })
      return send(res, 200, results)
    })
    return
  }
  
  // ── GET /api/operations/departments ──────────────────────────────────────
  if (method === 'GET' && pathname === '/api/operations/departments') {
    const user = authenticate(req, res)
    if (!user) return
    if (!requireAdmin(user, res)) return
    operationsDB.getDepartments(pool, (err, results) => {
      if (err) return send(res, 500, { error: err.message })
      return send(res, 200, results)
    })
    return
  }
  
  // ── GET /api/operations/revenue ───────────────────────────────────────────
  if (method === 'GET' && pathname === '/api/operations/revenue') {
    const user = authenticate(req, res)
    if (!user) return
    if (!requireAdmin(user, res)) return
    operationsDB.getRevenueData(pool, query, (err, results) => {
      if (err) return send(res, 500, { error: err.message })
      return send(res, 200, results)
    })
    return
  }
  
  // ── GET /api/operations/revenue/stats ────────────────────────────────────
  if (method === 'GET' && pathname === '/api/operations/revenue/stats') {
    const user = authenticate(req, res)
    if (!user) return
    if (!requireAdmin(user, res)) return
    operationsDB.getRevenueStats(pool, query, (err, results) => {
      if (err) return send(res, 500, { error: err.message })
      return send(res, 200, results)
    })
    return
  }
  
  // ── GET /api/operations/employees ─────────────────────────────────────────
  if (method === 'GET' && pathname === '/api/operations/employees') {
    const user = authenticate(req, res)
    if (!user) return
    if (!requireAdmin(user, res)) return
    operationsDB.getEmployeePerformance(pool, query, (err, results) => {
      if (err) return send(res, 500, { error: err.message })
      return send(res, 200, results)
    })
    return
  }
  
  // ── GET /api/operations/employees/stats ──────────────────────────────────
  if (method === 'GET' && pathname === '/api/operations/employees/stats') {
    const user = authenticate(req, res)
    if (!user) return
    if (!requireAdmin(user, res)) return
    operationsDB.getEmployeeStats(pool, query, (err, results) => {
      if (err) return send(res, 500, { error: err.message })
      return send(res, 200, results)
    })
    return
  }
// ── OPERATIONS HUB ROUTES ─────────────────────────────────────────────────
// Add near top of server.js:
// const operationsDB = require('./db/operations')

// ── GET /api/operations/post-offices ─────────────────────────────────────
if (method === 'GET' && pathname === '/api/operations/post-offices') {
  const user = authenticate(req, res)
  if (!user) return
  if (!requireAdmin(user, res)) return
  operationsDB.getPostOffices(pool, query, (err, results) => {
    if (err) return send(res, 500, { error: err.message })
    return send(res, 200, results)
  })
  return
}

// ── GET /api/operations/departments ──────────────────────────────────────
if (method === 'GET' && pathname === '/api/operations/departments') {
  const user = authenticate(req, res)
  if (!user) return
  if (!requireAdmin(user, res)) return
  operationsDB.getDepartments(pool, (err, results) => {
    if (err) return send(res, 500, { error: err.message })
    return send(res, 200, results)
  })
  return
}

// ── GET /api/operations/revenue ───────────────────────────────────────────
if (method === 'GET' && pathname === '/api/operations/revenue') {
  const user = authenticate(req, res)
  if (!user) return
  if (!requireAdmin(user, res)) return
  operationsDB.getRevenueData(pool, query, (err, results) => {
    if (err) return send(res, 500, { error: err.message })
    return send(res, 200, results)
  })
  return
}

// ── GET /api/operations/revenue/stats ────────────────────────────────────
if (method === 'GET' && pathname === '/api/operations/revenue/stats') {
  const user = authenticate(req, res)
  if (!user) return
  if (!requireAdmin(user, res)) return
  operationsDB.getRevenueStats(pool, query, (err, results) => {
    if (err) return send(res, 500, { error: err.message })
    return send(res, 200, results)
  })
  return
}

// ── GET /api/operations/office-satisfaction ───────────────────────────────
if (method === 'GET' && pathname === '/api/operations/office-satisfaction') {
  const user = authenticate(req, res)
  if (!user) return
  if (!requireAdmin(user, res)) return
  operationsDB.getOfficeSatisfaction(pool, query, (err, results) => {
    if (err) return send(res, 500, { error: err.message })
    return send(res, 200, results)
  })
  return
}

// ── GET /api/operations/office-trend ─────────────────────────────────────
if (method === 'GET' && pathname === '/api/operations/office-trend') {
  const user = authenticate(req, res)
  if (!user) return
  if (!requireAdmin(user, res)) return
  operationsDB.getOfficeTrend(pool, query, (err, results) => {
    if (err) return send(res, 500, { error: err.message })
    return send(res, 200, results)
  })
  return
}

// ── GET /api/operations/office-employees ─────────────────────────────────
if (method === 'GET' && pathname === '/api/operations/office-employees') {
  const user = authenticate(req, res)
  if (!user) return
  if (!requireAdmin(user, res)) return
  operationsDB.getOfficeEmployees(pool, query, (err, results) => {
    if (err) return send(res, 500, { error: err.message })
    return send(res, 200, results)
  })
  return
}

if (method === 'GET' && pathname === '/api/operations/office-raw') {
  const user = authenticate(req, res)
  if (!user) return
  if (!requireAdmin(user, res)) return
  operationsDB.getOfficeRawData(pool, query, (err, results) => {
    if (err) return send(res, 500, { error: err.message })
    return send(res, 200, results)
  })
  return
}

  // Default
  return send(res, 404, { message: 'Not found' })
}


// ── Start ─────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000
console.log('Connecting to Database:', process.env.MYSQL_DATABASE)
console.log("POOL CONFIG HOST =", process.env.MYSQLHOST)
http.createServer(router).listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`))
// console.log('[api] admin routes: GET /api/admin/employees, PATCH /api/admin/employees/:employeeId/deactivate')
// http.createServer(router).listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`))
// console.log('Connecting to Database:', process.env.MYSQL_DATABASE)