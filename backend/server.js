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
const packagePickupStorageJob = require('./db/package_pickup_storage_job')
const revenueReportDB = require('./db/revenue_report')
const { report } = require('process')
const shipmentDB = require('./db/shipments')

// ── DB pool ───────────────────────────────────────────────────────────────
const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
})

pool
  .getConnection()
  .then((c) => {
    console.log('✅ MySQL connected')
    c.release()
  })
  .catch((e) => console.error('❌ MySQL connection failed:', e))

if (
  process.env.DISABLE_PACKAGE_PICKUP_JOB !== '1' &&
  process.env.DISABLE_PACKAGE_PICKUP_JOB !== 'true'
) {
  const jobMs = Number(process.env.PACKAGE_PICKUP_JOB_MS)
  const runOnStartEnv = process.env.PACKAGE_PICKUP_JOB_RUN_ON_START
  packagePickupStorageJob.startPackagePickupStorageJob(pool, {
    intervalMs: Number.isFinite(jobMs) && jobMs > 0 ? jobMs : undefined,
    // Default: run once at startup so 30-day disposal applies without waiting for the first 24h tick.
    runOnStart: runOnStartEnv !== '0' && runOnStartEnv !== 'false',
  })
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
      const [rows] = await pool.query(
        `SELECT e.*, r.Role_Name, d.Department_Name
         FROM employee e
         JOIN role r       ON e.Role_ID       = r.Role_ID
         JOIN department d ON e.Department_ID = d.Department_ID
         WHERE e.Email_Address = ?`,
        [email]
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

  // ── POST /api/auth/customer-login ────────────────────────────────────────
  if (method === 'POST' && pathname === '/api/auth/customer-login') {
    const { email, password } = await getBody(req)
    if (!email || !password) return send(res, 400, { message: 'Email and password required' })
    try {
      const [rows] = await pool.query('SELECT * FROM customer WHERE Email_Address = ?', [email])
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

  // ── GET /api/admin/employees ─────────────────────────────────────────────
  if (method === 'GET' && pathname === '/api/admin/employees') {
    const user = authenticate(req, res)
    if (!user) return
    if (!requireAdmin(user, res)) return

    try {
      const [rows] = await pool.query(
        `SELECT e.Employee_ID, po.Street AS Post_Office_Street, d.Department_Name, r.Role_Name,
                e.First_Name, e.Last_Name, e.Email_Address, e.Sex, e.Phone_Number, e.Is_Active
         FROM employee e
         JOIN post_office po ON e.Post_Office_ID = po.Post_Office_ID
         JOIN department d   ON e.Department_ID  = d.Department_ID
         JOIN role r         ON e.Role_ID        = r.Role_ID
         WHERE e.Is_Active IN ('1', 1)
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
                po.City AS Office_City, po.State AS Office_State
         FROM employee e
         JOIN role r         ON e.Role_ID        = r.Role_ID
         JOIN department d   ON e.Department_ID  = d.Department_ID
         JOIN post_office po ON e.Post_Office_ID = po.Post_Office_ID
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
                po.City AS Office_City, po.State AS Office_State
         FROM employee e
         JOIN role r         ON e.Role_ID        = r.Role_ID
         JOIN department d   ON e.Department_ID  = d.Department_ID
         JOIN post_office po ON e.Post_Office_ID = po.Post_Office_ID
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
        `SELECT Customer_ID, First_Name, Last_Name, Email_Address,
                Phone_Number, House_Number, Street, City, State,
                Zip_First3, Zip_Last2
         FROM customer WHERE Customer_ID = ?`,
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
      Zip_First3,
      Zip_Last2,
    } = await getBody(req)

    try {
      await pool.query(
        `UPDATE customer SET Email_Address=?, Phone_Number=?, House_Number=?, Street=?, City=?, State=?, Zip_First3=?, Zip_Last2=? WHERE Customer_ID=?`,
        [
          Email_Address,
          Phone_Number,
          House_Number,
          Street,
          City,
          State,
          Zip_First3,
          Zip_Last2,
          user.customer_id,
        ]
      )

      const [rows] = await pool.query(
        `SELECT Customer_ID, First_Name, Last_Name, Email_Address,
                Phone_Number, House_Number, Street, City, State,
                Zip_First3, Zip_Last2
         FROM customer WHERE Customer_ID = ?`,
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

  /
  // ── GET /qry_track_package (PUBLIC tracking) ─────────────────────────────
  // if (method === 'GET' && pathname === '/qry_track_package') {
  //   const user = authenticate(req, res)
  //   if (!user) return

  //   const trackingNumber = (query.tracking_number || query.trackingNumber || '').trim()
  //   if (!trackingNumber) return send(res, 400, { error: 'tracking_number query parameter is required' })

  //   packagesDB.getPackageByTracking(pool, trackingNumber, (err, result) => {
  //     if (err) return send(res, 500, { error: 'Database error' })
  //     if (!result) return send(res, 404, { error: 'Package not found' })
  //     return send(res, 200, result)
  //   })
  //   return
  // }

  // ── GET /api/price (PUBLIC) ──────────────────────────────────────────────
  if (method === 'GET' && pathname === '/api/price') {
    const user = authenticate(req, res)
    if (!user) return

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

    try {
      await packagePickupStorageJob.runNodeDisposalSweep(pool)
    } catch (e) {
      console.error('[my-packages] disposal sweep:', e.message || e)
    }

    packagesDB.getPackagesForCustomer(pool, user.customer_id, (err, results) => {
      if (err) {
        console.error(err)
        return send(res, 500, { error: 'Database error' })
      }
      return send(res, 200, results)
    })
    return
  }

  // ── POST /api/employee/packages ──────────────────────────────────────────
  if (method === 'POST' && pathname === '/api/employee/packages') {
    const user = authenticate(req, res)
    if (!user) return
    if (!requireEmployee(user, res)) return

    const b = await getBody(req)
    const {
      sender_email, sender_first_name, sender_last_name,
      sender_house_number, sender_street, sender_city, 
      sender_state, sender_zip_first3, sender_zip_last2, sender_apt_number,sender_country,
      sender_phone,
      recipient_email, recipient_first_name, recipient_last_name,
      recipient_house_number, recipient_street, recipient_city,
      recipient_state, recipient_zip_first3, recipient_zip_last2, recipient_apt_number, recipient_country,
      recipient_phone,
      package_type,
      weight,
      zone,
      excess_fee,
      dim_x, dim_y,dim_z,
    } = b

    const pt = normalizePackageTypeName(package_type)
    const typeCode = TYPE_NAME_TO_CODE[pt]
    if (!typeCode) return send(res, 400, { message: 'Invalid package_type' })

    const w = Number(weight)
    const z = Number(zone)
    if (Number.isNaN(w) || Number.isNaN(z)) return send(res, 400, { message: 'weight and zone must be numbers' })

    const dx = dim_x != null && dim_x !== '' ? Number(dim_x) : 12
    const dy = dim_y != null && dim_y !== '' ? Number(dim_y) : 10
    const dz = dim_z != null && dim_z !== '' ? Number(dim_z) : 8
    if (!(dx > 0 && dy > 0 && dz > 0)) return send(res, 400, { message: 'Dimensions must be positive numbers' })

    const excessName = excess_fee && String(excess_fee).trim() ? String(excess_fee).trim() : null
    const sigRequired = excessName === 'Signature Required'

    let priceAmount
    try {
      priceAmount = await getPricePromise(pool, excessName, pt, w, z)
    } catch (err) {
      return send(res, err.status === 400 ? 400 : 500, { message: err.message || 'Pricing failed' })
    }

    const senderEmail = (sender_email || '').trim().toLowerCase()
    if (!senderEmail || !sender_first_name?.trim() || !sender_last_name?.trim()) {
      return send(res, 400, { message: 'Sender email, first name, and last name are required' })
    }
    if (!sender_house_number || !sender_street || !sender_city || !sender_state || !sender_zip_first3 || !sender_zip_last2) {
      return send(res, 400, { message: 'Sender address fields are required' })
    }

    let recipientEmail = (recipient_email || '').trim().toLowerCase()
    if (!recipient_first_name?.trim() || !recipient_last_name?.trim()) {
      return send(res, 400, { message: 'Recipient first and last name are required' })
    }
    if (!recipient_house_number || !recipient_street || !recipient_city || !recipient_state || !recipient_zip_first3 || !recipient_zip_last2) {
      return send(res, 400, { message: 'Recipient address fields are required' })
    }
    if (!recipientEmail) {
      recipientEmail = `recipient.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@pkg.internal`
    }
    if (recipientEmail === senderEmail) {
      return send(res, 400, { message: 'Sender and recipient must be different people (different emails)' })
    }

    const conn = await pool.getConnection()
    try {
      await conn.beginTransaction()

      let senderId = (await customerDB.getCustomerByEmail(conn, senderEmail))?.Customer_ID
      if (!senderId) {
        const created = await customerDB.createCustomerMinimal(conn, {
          first_name: sender_first_name,
          last_name: sender_last_name,
          email: senderEmail,
          house_number: sender_house_number,
          street: sender_street,
          city: sender_city,
          state: sender_state,
          zip_first3: sender_zip_first3,
          zip_last2: sender_zip_last2,
          apt_number: sender_apt_number,
          zip_plus4: b.sender_zip_plus4,
          country: sender_country,
          phone_number: sender_phone,
        })
        senderId = created.customerId
        // created.initialPassword exists but unused in this server
      }

      let recipientId = (await customerDB.getCustomerByEmail(conn, recipientEmail))?.Customer_ID
      if (!recipientId) {
        const created = await customerDB.createCustomerMinimal(conn, {
          first_name: recipient_first_name,
          last_name: recipient_last_name,
          email: recipientEmail,
          house_number: recipient_house_number,
          street: recipient_street,
          city: recipient_city,
          state: recipient_state,
          zip_first3: recipient_zip_first3,
          zip_last2: recipient_zip_last2,
          apt_number: recipient_apt_number,
          zip_plus4: b.recipient_zip_plus4,
          country: recipient_country,
          phone_number: recipient_phone,
        })
        recipientId = created.customerId
      }

      if (senderId === recipientId) {
        await conn.rollback()
        return send(res, 400, { message: 'Sender and recipient must be different customers' })
      }

      const tracking = await nextTrackingNumber(conn)
      const oversize = typeCode === 'OVR' ? 1 : 0

      const actingEmployeeId = Number(user.employee_id)
      if (!Number.isFinite(actingEmployeeId)) {
        await conn.rollback()
        return send(res, 401, { message: 'Invalid employee session' })
      }

      const [empRows] = await conn.query(
        `SELECT s.Store_ID FROM employee e
         JOIN post_office p ON e.Post_Office_ID = p.Post_Office_ID
         JOIN store s ON s.Post_Office_ID = p.Post_Office_ID
         WHERE e.Employee_ID = ?`,
        [actingEmployeeId]
      )
      if (!empRows.length) {
        await conn.rollback()
        return send(res, 404, { error: 'Employee or store not found' })
      }
      const sid = empRows[0].Store_ID

      const [payRes] = await conn.query(
        `INSERT INTO payment (Customer_ID, Store_ID, Items, Payment_Type, Payment_Amount, Payment_Status, Employee_ID)
         VALUES (?,?,?,?,?,'completed',?)`,
        [senderId, sid, 1, 1, priceAmount, actingEmployeeId]
      )
      const payId = payRes.insertId

      await conn.query(
        `INSERT INTO package (Tracking_Number, Sender_ID, Recipient_ID, Dim_X, Dim_Y, Dim_Z,
          Package_Type_Code, Weight, Zone, Oversize, Requires_Signature, Price, Payment_ID)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [tracking, senderId, recipientId, dx, dy, dz, typeCode, w, z, oversize, sigRequired ? 1 : 0, priceAmount, payId]
      )

      const [[pending]] = await conn.query(`SELECT Status_Code FROM status_code WHERE Status_Name = 'Pending' LIMIT 1`)
      if (!pending) throw new Error('Missing Pending status in status_code')
      const pendingCode = pending.Status_Code

      await conn.query(
        `INSERT INTO delivery (Tracking_Number, Delivered_Date, Signature_Required, Signature_Received, Delivery_Status_Code, Delivered_By)
         VALUES (?,NULL,?,NULL,?,NULL)`,
        [tracking, sigRequired ? 1 : 0, pendingCode]
      )

      const [shipRes] = await conn.query(
        `INSERT INTO shipment (Status_Code, Employee_ID,
          From_Apt_Number, From_House_Number, From_Street, From_City, From_State, From_Zip_First3, From_Zip_Last2, From_Zip_Plus4, From_Country,
          To_Apt_Number, To_House_Number, To_Street, To_City, To_State, To_Zip_First3, To_Zip_Last2, To_Zip_Plus4, To_Country,
          Departure_Time_Stamp, Arrival_Time_Stamp)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NULL,NULL)`,
        [
          pendingCode,
          actingEmployeeId,
          sender_apt_number || null,
          String(sender_house_number).slice(0, 10),
          String(sender_street).slice(0, 100),
          String(sender_city).slice(0, 100),
          String(sender_state).slice(0, 50),
          String(sender_zip_first3).replace(/\D/g, '').slice(0, 3),
          String(sender_zip_last2).replace(/\D/g, '').slice(0, 2),
          b.sender_zip_plus4 ? String(b.sender_zip_plus4).replace(/\D/g, '').slice(0, 4) : null,
          (sender_country || 'USA').toString().slice(0, 50),
          recipient_apt_number || null,
          String(recipient_house_number).slice(0, 10),
          String(recipient_street).slice(0, 100),
          String(recipient_city).slice(0, 100),
          String(recipient_state).slice(0, 50),
          String(recipient_zip_first3).replace(/\D/g, '').slice(0, 3),
          String(recipient_zip_last2).replace(/\D/g, '').slice(0, 2),
          b.recipient_zip_plus4 ? String(b.recipient_zip_plus4).replace(/\D/g, '').slice(0, 4) : null,
          (recipient_country || 'USA').toString().slice(0, 50),
        ]
      )

      const shipmentId = shipRes.insertId
      await conn.query(`INSERT INTO shipment_package (Shipment_ID, Tracking_Number) VALUES (?,?)`, [shipmentId, tracking])

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
      if (err.code === 'ER_DUP_ENTRY') {
        return send(res, 400, { message: 'Duplicate email or tracking conflict; try again' })
      }
      return send(res, 500, { message: err.message || 'Could not create package' })
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
        po.City AS Office_City,
        po.State AS Office_State,
        COUNT(DISTINCT s.Shipment_ID) AS Total_Shipments,
        COUNT(DISTINCT sp.Tracking_Number) AS Total_Packages,
        ROUND(COUNT(DISTINCT sp.Tracking_Number) / NULLIF(COUNT(DISTINCT s.Shipment_ID), 0), 1) AS Avg_Packages_Per_Shipment,
        (
          SELECT COALESCE(SUM(pkg2.Price), 0)
          FROM shipment s2
          JOIN shipment_package sp2 ON sp2.Shipment_ID = s2.Shipment_ID
          JOIN package pkg2 ON pkg2.Tracking_Number = sp2.Tracking_Number
          WHERE s2.Employee_ID = e.Employee_ID
        ) AS Total_Revenue,
        (
          SELECT COALESCE(AVG(pkg2.Price), 0)
          FROM shipment s2
          JOIN shipment_package sp2 ON sp2.Shipment_ID = s2.Shipment_ID
          JOIN package pkg2 ON pkg2.Tracking_Number = sp2.Tracking_Number
          WHERE s2.Employee_ID = e.Employee_ID
        ) AS Avg_Revenue_Per_Shipment,
        (
          SELECT ROUND(
            COUNT(CASE WHEN d2.Delivery_Status_Code = 4 THEN 1 END) * 100.0 /
            NULLIF(COUNT(*), 0), 1)
          FROM shipment s2
          JOIN shipment_package sp2 ON sp2.Shipment_ID = s2.Shipment_ID
          JOIN delivery d2 ON d2.Tracking_Number = sp2.Tracking_Number
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
      LEFT JOIN shipment s ON s.Employee_ID = e.Employee_ID
      LEFT JOIN shipment_package sp ON sp.Shipment_ID = s.Shipment_ID
      LEFT JOIN package pkg ON pkg.Tracking_Number = sp.Tracking_Number
      ${whereClause}
      GROUP BY e.Employee_ID, e.First_Name, e.Last_Name, e.Email_Address,
               r.Role_Name, d.Department_Name, po.City, po.State
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
    const user = authenticate(req, res)
    if (!user) return
    if (!requireEmployee(user, res)) return

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
        po.City,
        po.State,
        CONCAT(po.House_Number, ' ', po.Street, ', ', po.City, ', ', po.State) AS Full_Address,
        COUNT(DISTINCT s.Shipment_ID) AS Total_Shipments,
        COUNT(DISTINCT sp.Tracking_Number) AS Total_Packages,
        COALESCE(SUM(pkg.Price), 0) AS Total_Revenue,
        COALESCE(AVG(pkg.Price), 0) AS Avg_Package_Price,
        COUNT(DISTINCT e.Employee_ID) AS Total_Employees
      FROM post_office po
      LEFT JOIN employee e ON e.Post_Office_ID = po.Post_Office_ID
      LEFT JOIN shipment s ON s.Employee_ID = e.Employee_ID ${whereClause}
      LEFT JOIN shipment_package sp ON sp.Shipment_ID = s.Shipment_ID
      LEFT JOIN package pkg ON pkg.Tracking_Number = sp.Tracking_Number
      GROUP BY po.Post_Office_ID, po.City, po.State, po.House_Number, po.Street
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
        COALESCE(SUM(pkg.Price), 0) AS Total_Revenue,
        ROUND(
          COUNT(CASE WHEN del.Delivery_Status_Code = 4 THEN 1 END) * 100.0 /
          NULLIF(COUNT(DISTINCT sp.Tracking_Number), 0), 1
        ) AS Delivery_Success_Rate
      FROM department d
      LEFT JOIN employee e ON e.Department_ID = d.Department_ID
      LEFT JOIN shipment s ON s.Employee_ID = e.Employee_ID ${whereClause}
      LEFT JOIN shipment_package sp ON sp.Shipment_ID = s.Shipment_ID
      LEFT JOIN package pkg ON pkg.Tracking_Number = sp.Tracking_Number
      LEFT JOIN delivery del ON del.Tracking_Number = sp.Tracking_Number
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
        COALESCE(SUM(pkg.Price), 0) AS Total_Revenue,
        COALESCE(AVG(pkg.Price), 0) AS Avg_Price,
        COALESCE(AVG(pkg.Weight), 0) AS Avg_Weight,
        COUNT(CASE WHEN pkg.Oversize = 1 THEN 1 END) AS Oversize_Count
      FROM package pkg
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
    const [rows] = await pool.query('SELECT Post_Office_ID, City, State FROM post_office ORDER BY State, City ASC')
    return send(res, 200, rows)
  } catch (err) {
    return send(res, 500, { message: 'Server error' })
  }
}

// ── GET /api/packages/full ────────────────────────────────────────────────

if (method === 'GET' && pathname === '/api/packages/full') {
  const user = authenticate(req, res)
  if (!user) return
  if (!requireEmployee(user, res)) return

  const { zone, post_office_id, package_type, status } = query

  try {
    const conditions = []
    const params = []

    if (zone)           { conditions.push('pkg.Zone = ?');                params.push(Number(zone)) }
    if (package_type)   { conditions.push('pkg.Package_Type_Code = ?');   params.push(package_type) }
    if (status)         { conditions.push('d.Delivery_Status_Code = ?');  params.push(Number(status)) }
    if (post_office_id) { conditions.push('po.Post_Office_ID = ?');       params.push(Number(post_office_id)) }

    const whereClause = conditions.length ? `AND ${conditions.join(' AND ')}` : ''

    const [rows] = await pool.query(
      `SELECT
        pkg.Tracking_Number,
        pkg.Package_Type_Code,
        pkg.Weight,
        pkg.Zone,
        pkg.Price,
        pkg.Oversize,
        pkg.Requires_Signature,
        pkg.Date_Created,
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
        d.Delivery_Status_Code,
        d.Delivered_Date,
        d.Signature_Required,
        sc.Status_Name,
        sc.Is_Final_Status,
        -- Shipment / post office info
        sh.From_City,
        sh.From_State,
        sh.To_City,
        sh.To_State,
        po.City AS Office_City,
        po.Post_Office_ID,
        -- Employee who handled it
        CONCAT(e.First_Name, ' ', e.Last_Name) AS Handled_By
      FROM package pkg
      LEFT JOIN customer s  ON s.Customer_ID  = pkg.Sender_ID
      LEFT JOIN customer r  ON r.Customer_ID  = pkg.Recipient_ID
      LEFT JOIN delivery d  ON d.Tracking_Number = pkg.Tracking_Number
      LEFT JOIN status_code sc ON sc.Status_Code = d.Delivery_Status_Code
      LEFT JOIN shipment_package sp ON sp.Tracking_Number = pkg.Tracking_Number
      LEFT JOIN shipment sh ON sh.Shipment_ID = sp.Shipment_ID
      LEFT JOIN employee e  ON e.Employee_ID  = sh.Employee_ID
      LEFT JOIN post_office po ON po.Post_Office_ID = e.Post_Office_ID
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
    if (!Tracking_Number || Issue_Type === undefined || !Description) {
      return send(res, 400, { message: 'Missing required fields' })
    }
    
    try {
      const [EmpRow] = await employeeDB.employeeByTickets(pool)
      const assignedEmpId = EmpRow?.Employee_ID

      if (!assignedEmpId) {
        return send(res, 500, { message: 'No available employee to assign' })
      }
      await pool.query(
        `INSERT INTO support_ticket (User_ID, Package_ID, Issue_Type, Description, Ticket_Status_Code, Assigned_Employee_ID)
        VALUES (?, ?, ?, ?, 0, ?)`,
        [user.customer_id, Tracking_Number, Issue_Type, Description, assignedEmpId]
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
        `SELECT Customer_ID, First_Name, Last_Name, Email_Address,
                Phone_Number, House_Number, Street, Apt_Number,
                City, State, Zip_First3, Zip_Last2
         FROM customer WHERE Email_Address = ? LIMIT 1`,
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


  // Default
  return send(res, 404, { message: 'Not found' })
}


// ── Start ─────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000
console.log('[api] admin routes: GET /api/admin/employees, PATCH /api/admin/employees/:employeeId/deactivate')
http.createServer(router).listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`))
console.log('Connecting to Database:', process.env.MYSQL_DATABASE)