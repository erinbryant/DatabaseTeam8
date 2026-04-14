const path = require('path')
const express = require('express')
const cors    = require('cors')
const mysql   = require('mysql2/promise')
const bcrypt  = require('bcryptjs')
const jwt     = require('jsonwebtoken')
require('dotenv').config({ path: path.join(__dirname, '.env') })

const packagesDB  = require('./db/packages')
const inventoryDB = require('./db/inventory')
const customerDB = require('./db/customers')
const priceDB = require('./db/package_type')

const app = express()
app.use(cors())
app.use(express.json())

// ── DB pool ───────────────────────────────────────────────────────────────
const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               process.env.DB_PORT     || 3306,
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || 'MBobanza#2205',
  database:           process.env.DB_NAME     || 'post_officedb',
  waitForConnections: true,
  connectionLimit:    10,
})

pool.getConnection()
  .then(c => { console.log('✅ MySQL connected'); c.release() })
  .catch(e => console.error('❌ MySQL connection failed:', e))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'postoffice-api', has_price: true })
})

// ── Auth middleware ───────────────────────────────────────────────────────
const authenticate = (req, res, next) => {
  const token = (req.headers['authorization'] || '').split(' ')[1]
  if (!token) return res.status(401).json({ message: 'No token provided' })
  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' })
    req.user = decoded
    next()
  })
}

const requireEmployee = (req, res, next) => {
  if (req.user?.type !== 'employee' || req.user?.employee_id == null) {
    return res.status(403).json({ message: 'Employee access required' })
  }
  next()
}

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

function getPricePromise(pool, excessFeeTypeName, packageTypeName, weight, zone) {
  return new Promise((resolve, reject) => {
    const w = Number(weight)
    const z = Number(zone)
    priceDB.getPrice(pool, excessFeeTypeName || null, packageTypeName, w, z, (err, results) => {
      if (err) return reject(err)
      if (!results?.length) {
        const e = new Error('No matching price for weight, zone, and package type')
        e.status = 400
        return reject(e)
      }
      resolve(Number(results[0].Tot_Price))
    })
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

// ── Admin/Manager authorization middleware ─────────────────────────────────
const requireAdmin = (req, res, next) => {
  // Check if user role is Manager or Admin (role_id 4 or 5)
  // Adjust role_ids based on your database
  if (![4, 5].includes(req.user.role_id)) {
    return res.status(403).json({ message: 'Access denied. Manager/Admin role required.' })
  }
  next()
}

// ════════════════════════════════════════════════════════════════════════════
//  AUTH ROUTES
// ════════════════════════════════════════════════════════════════════════════

// Employee Login (EXISTING)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password required' })

  try {
    const [rows] = await pool.query(
      `SELECT e.*, r.Role_Name, d.Department_Name
       FROM Employee e
       JOIN Role r       ON e.Role_ID       = r.Role_ID
       JOIN Department d ON e.Department_ID = d.Department_ID
       WHERE e.Email_Address = ?`,
      [email]
    )
    if (!rows.length)
      return res.status(401).json({ message: 'Invalid credentials' })

    const emp = rows[0]
    const valid = await bcrypt.compare(password, emp.Password_Hash)
    if (!valid)
      return res.status(401).json({ message: 'Invalid credentials' })

    const token = jwt.sign(
      { employee_id: emp.Employee_ID, email: emp.Email_Address, role_id: emp.Role_ID, type: 'employee' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    )

    const { Password_Hash, ...safe } = emp
    res.json({ message: 'Login successful', token, user: safe })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Customer Login
app.post('/api/auth/customer-login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password required' })

  try {
    const [rows] = await pool.query(
      'SELECT * FROM Customer WHERE Email_Address = ?',
      [email]
    )
    if (!rows.length)
      return res.status(401).json({ message: 'Invalid credentials' })

    const customer = rows[0]
    const valid = await bcrypt.compare(password, customer.Password_Hash)
    if (!valid)
      return res.status(401).json({ message: 'Invalid credentials' })

    const token = jwt.sign(
      { customer_id: customer.Customer_ID, email: customer.Email_Address, type: 'customer' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    )

    const { Password_Hash, ...safe } = customer
    res.json({ message: 'Login successful', token, user: safe })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Customer registration (full profile; see customers.registerCustomer)
app.post('/api/customer/register', async (req, res) => {
  console.log('Register request payload', {
    email: req.body?.email,
    first_name: req.body?.first_name,
    last_name: req.body?.last_name,
    phone_number: req.body?.phone_number,
    city: req.body?.city,
    state: req.body?.state,
    zip_first3: req.body?.zip_first3,
    zip_last2: req.body?.zip_last2,
    birth_day: req.body?.birth_day,
    birth_month: req.body?.birth_month,
    birth_year: req.body?.birth_year,
    sex: req.body?.sex,
  })

  try {
    const { customer_id, user } = await customerDB.registerCustomer(pool, req.body)

    const token = jwt.sign(
      { customer_id, email: user.Email_Address, type: 'customer' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    )

<<<<<<< Updated upstream
    res.status(201).json({
      message: 'Customer registered successfully',
      token,
      user,
=======
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

    const { Phone_Number } = await getBody(req)
    try {
      await pool.query(
        'UPDATE employee SET Phone_Number = ? WHERE Employee_ID = ?',
        [Phone_Number, user.employee_id]
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
>>>>>>> Stashed changes
    })
  } catch (err) {
    if (err.status === 400 || err.code === 'VALIDATION' || err.code === 'DUPLICATE_EMAIL') {
      return res.status(err.status || 400).json({ message: err.message })
    }
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email already registered' })
    }
    if (err.code === 'ER_BAD_FIELD_ERROR' || /Unknown column/i.test(String(err.message))) {
      console.error(err)
      return res.status(500).json({
        message:
          'Database schema is missing Customer columns (Birth_Day, Birth_Month, Birth_Year, Sex). Run backend/db/migrations/001_add_customer_demographics.sql',
      })
    }
    console.error(err)
    res.status(500).json({ message: err.message || 'Server error' })
  }
})

// Admin/Manager Register New Employee (NEW ENDPOINT)
app.post('/api/auth/admin-register', authenticate, requireAdmin, async (req, res) => {
  const { name, email, department, position, phoneNumber, workAddress, hireDate } = req.body

  // Validation
  if (!name || !email || !department || !position || !phoneNumber || !workAddress || !hireDate) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  try {
    // Check if email already exists
    const [exists] = await pool.query(
      'SELECT Employee_ID FROM Employee WHERE Email_Address = ?',
      [email]
    )
    if (exists.length) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-10) + 'Temp1!'
    const hash = await bcrypt.hash(tempPassword, 10)

    // Map department and position to IDs (adjust based on your database)
    const departmentMap = {
      'Mail Sorting': 1,
      'Customer Service': 2,
      'Delivery': 3,
      'Management': 4,
      'Finance': 5,
      'IT Support': 6
    }

    const positionMap = {
      'Clerk': 1,
      'Supervisor': 2,
      'Manager': 3,
      'Director': 4,
      'Staff': 5
    }

    const department_id = departmentMap[department] || 1
    const role_id = positionMap[position] || 1

    // Parse hire date and extract name
    const [firstName, ...lastNameParts] = name.split(' ')
    const lastName = lastNameParts.join(' ') || 'Employee'

    // Insert new employee
    const [result] = await pool.query(
      `INSERT INTO Employee
         (Post_Office_ID, Role_ID, Department_ID, First_Name, Last_Name,
          Birth_Day, Birth_Month, Birth_Year, Password_Hash, Email_Address,
          Phone_Number, Sex, Salary, Hours_Worked)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,0)`,
      [1, role_id, department_id, firstName, lastName, 1, 1, 2000, hash, email, phoneNumber, 'M', 0]
    )

    // TODO: Send email to employee with temporary password
    // You can integrate a service like SendGrid, Nodemailer, etc.
    console.log(`[TODO] Send email to ${email} with temporary password: ${tempPassword}`)

    const token = jwt.sign(
      { employee_id: result.insertId, email, role_id, type: 'employee' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    )

    res.status(201).json({
      message: 'Employee registered successfully',
      employee_id: result.insertId,
      email,
      note: 'Temporary password sent to employee email'
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// Get employee profile
app.get('/api/auth/profile', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.Employee_ID, e.First_Name, e.Middle_Name, e.Last_Name,
              e.Email_Address, e.Phone_Number, e.Salary, e.Hours_Worked,
              e.Supervisor_ID,
              CONCAT(s.First_Name, ' ', s.Last_Name) AS Supervisor,
              r.Role_Name, d.Department_Name,
              po.City AS Office_City, po.State AS Office_State
       FROM Employee e
       JOIN Role r         ON e.Role_ID        = r.Role_ID
       JOIN Department d   ON e.Department_ID  = d.Department_ID
       JOIN Post_Office po ON e.Post_Office_ID = po.Post_Office_ID
       LEFT JOIN Employee s ON e.Supervisor_ID = s.Employee_ID
       WHERE e.Employee_ID = ?`,
      [req.user.employee_id]
    )
    if (!rows.length)
      return res.status(404).json({ message: 'Employee not found' })
    res.json({ user: rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update employee profile
app.put('/api/auth/profile', authenticate, async (req, res) => {
  const { Email_Address, Phone_Number } = req.body
  try {
    await pool.query(
      'UPDATE Employee SET Phone_Number = ?, Email_Address = ? WHERE Employee_ID = ?',
      [Phone_Number, Email_Address, req.user.employee_id]
    )
    const [rows] = await pool.query(
      `SELECT e.Employee_ID, e.First_Name, e.Middle_Name, e.Last_Name,
              e.Email_Address, e.Phone_Number, e.Salary, e.Hours_Worked,
              e.Supervisor_ID,
              CONCAT(s.First_Name, ' ', s.Last_Name) AS Supervisor,
              r.Role_Name, d.Department_Name,
              po.City AS Office_City, po.State AS Office_State
       FROM Employee e
       JOIN Role r         ON e.Role_ID        = r.Role_ID
       JOIN Department d   ON e.Department_ID  = d.Department_ID
       JOIN Post_Office po ON e.Post_Office_ID = po.Post_Office_ID
       LEFT JOIN Employee s ON e.Supervisor_ID = s.Employee_ID
       WHERE e.Employee_ID = ?`,
      [req.user.employee_id]
    )
    res.json({ message: 'Profile updated successfully', user: rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Change employee password
app.post('/api/auth/change-password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword)
    return res.status(400).json({ message: 'Both passwords are required' })
  if (newPassword.length < 6)
    return res.status(400).json({ message: 'New password must be at least 6 characters' })
  try {
    const [rows] = await pool.query(
      'SELECT Password_Hash FROM Employee WHERE Employee_ID = ?',
      [req.user.employee_id]
    )
    if (!rows.length) return res.status(404).json({ message: 'Employee not found' })
    const valid = await bcrypt.compare(currentPassword, rows[0].Password_Hash)
    if (!valid) return res.status(401).json({ message: 'Current password is incorrect' })
    const newHash = await bcrypt.hash(newPassword, 10)
    await pool.query(
      'UPDATE Employee SET Password_Hash = ? WHERE Employee_ID = ?',
      [newHash, req.user.employee_id]
    )
    res.json({ message: 'Password changed successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Customer profile
app.get('/api/customer/profile', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT Customer_ID, First_Name, Last_Name, Email_Address,
              Phone_Number, House_Number, Street, City, State,
              Zip_First3, Zip_Last2
       FROM Customer WHERE Customer_ID = ?`,
      [req.user.customer_id]
    )
    if (!rows.length)
      return res.status(404).json({ message: 'Customer not found' })
    res.json({ user: rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update customer profile
app.put('/api/customer/profile', authenticate, async (req, res) => {
  const { Email_Address, Phone_Number, House_Number, Street, City, State, Zip_First3, Zip_Last2 } = req.body
  try {
    await pool.query(
      `UPDATE Customer 
       SET Email_Address = ?, Phone_Number = ?,
           House_Number = ?, Street = ?, City = ?, State = ?,
           Zip_First3 = ?, Zip_Last2 = ?
       WHERE Customer_ID = ?`,
      [Email_Address, Phone_Number, House_Number, Street, City, State, Zip_First3, Zip_Last2, req.user.customer_id]
    )
    const [rows] = await pool.query(
      `SELECT Customer_ID, First_Name, Last_Name, Email_Address,
              Phone_Number, House_Number, Street, City, State,
              Zip_First3, Zip_Last2
       FROM Customer WHERE Customer_ID = ?`,
      [req.user.customer_id]
    )
    res.json({ message: 'Profile updated successfully', user: rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// ════════════════════════════════════════════════════════════════════════════
//  PACKAGES ROUTES
// ════════════════════════════════════════════════════════════════════════════

app.get('/api/packages', async (req, res) => {
  packagesDB.getAllPackages(pool, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' })
    res.json(results)
  })
})

// Track package by tracking number
app.get('/api/packages/track/:trackingNumber', async (req, res) => {
  console.log('Received tracking request for:', req.params.trackingNumber)
  const trackingNumber = (req.params.trackingNumber || '').trim()
  if (!trackingNumber) {
    return res.status(400).json({ error: 'trackingNumber is required' })
  }

  packagesDB.getPackageByTracking(pool, trackingNumber, (err, result) => {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({ error: 'Database error' })
    }
    if (!result) return res.status(404).json({ error: 'Package not found' })
    res.json(result)
  })
})

// Compatibility endpoint for existing query-style frontend calls
app.get('/qry_track_package', async (req, res) => {
  const trackingNumber = (req.query.tracking_number || req.query.trackingNumber || '').trim()
  if (!trackingNumber) {
    return res.status(400).json({ error: 'tracking_number query parameter is required' })
  }

  packagesDB.getPackageByTracking(pool, trackingNumber, (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' })
    if (!result) return res.status(404).json({ error: 'Package not found' })
    res.json(result)
  })
})

// Shipping price (package_pricing + optional excess_fee); matches price_calculator.jsx
app.get('/api/price', async (req, res) => {
  const { package_type, weight, zone, excess_fee } = req.query
  const pt = normalizePackageTypeName(package_type)
  if (
    !pt ||
    weight === undefined ||
    weight === '' ||
    zone === undefined ||
    zone === ''
  ) {
    return res.status(400).json({ error: 'package_type, weight, and zone are required' })
  }
  const w = Number(weight)
  const z = Number(zone)
  if (!Number.isFinite(w) || w <= 0 || w > 70) {
    return res.status(400).json({ error: 'Weight must be greater than 0 and at most 70 lbs' })
  }
  if (!Number.isInteger(z) || z < 1 || z > 9) {
    return res.status(400).json({ error: 'Zone must be a whole number from 1 to 9' })
  }
  try {
    const tot = await getPricePromise(pool, excess_fee || null, pt, weight, zone)
    res.json({ Tot_Price: tot })
  } catch (err) {
    if (err.status === 400) return res.status(400).json({ error: err.message })
    console.error(err)
    res.status(500).json({ error: err.message || 'Could not calculate price' })
  }
})

// Customer: packages where they are sender or recipient (for "My packages")
app.get('/api/customer/my-packages', authenticate, async (req, res) => {
  if (req.user?.type !== 'customer' || req.user.customer_id == null) {
    return res.status(403).json({ message: 'Customer access required' })
  }
  packagesDB.getPackagesForCustomer(pool, req.user.customer_id, (err, results) => {
    if (err) {
      console.error(err)
      return res.status(500).json({ error: 'Database error' })
    }
    res.json(results)
  })
})

// Employee: create paid package (Package, Shipment, Shipment_Package, Delivery, Payment)
app.post('/api/employee/packages', authenticate, requireEmployee, async (req, res) => {
  const b = req.body || {}
  const {
    sender_email,
    sender_first_name,
    sender_last_name,
    sender_house_number,
    sender_street,
    sender_city,
    sender_state,
    sender_zip_first3,
    sender_zip_last2,
    sender_apt_number,
    sender_country,
    sender_phone,
    recipient_email,
    recipient_first_name,
    recipient_last_name,
    recipient_house_number,
    recipient_street,
    recipient_city,
    recipient_state,
    recipient_zip_first3,
    recipient_zip_last2,
    recipient_apt_number,
    recipient_country,
    recipient_phone,
    package_type,
    weight,
    zone,
    excess_fee,
    dim_x,
    dim_y,
    dim_z,
    store_id,
  } = b

  const pt = normalizePackageTypeName(package_type)
  const typeCode = TYPE_NAME_TO_CODE[pt]
  if (!typeCode) {
    return res.status(400).json({ message: 'Invalid package_type' })
  }

  const w = Number(weight)
  const z = Number(zone)
  if (Number.isNaN(w) || Number.isNaN(z)) {
    return res.status(400).json({ message: 'weight and zone must be numbers' })
  }

  const dx = dim_x != null && dim_x !== '' ? Number(dim_x) : 12
  const dy = dim_y != null && dim_y !== '' ? Number(dim_y) : 10
  const dz = dim_z != null && dim_z !== '' ? Number(dim_z) : 8
  if (!(dx > 0 && dy > 0 && dz > 0)) {
    return res.status(400).json({ message: 'Dimensions must be positive numbers' })
  }

  const excessName = excess_fee && String(excess_fee).trim() ? String(excess_fee).trim() : null
  const sigRequired = excessName === 'Signature Required'

  let priceAmount
  try {
    priceAmount = await getPricePromise(pool, excessName, pt, w, z)
  } catch (err) {
    const code = err.status === 400 ? 400 : 500
    return res.status(code).json({ message: err.message || 'Pricing failed' })
  }

  const senderEmail = (sender_email || '').trim().toLowerCase()
  if (!senderEmail || !sender_first_name?.trim() || !sender_last_name?.trim()) {
    return res.status(400).json({ message: 'Sender email, first name, and last name are required' })
  }
  if (!sender_house_number || !sender_street || !sender_city || !sender_state || !sender_zip_first3 || !sender_zip_last2) {
    return res.status(400).json({ message: 'Sender address fields are required' })
  }

  let recipientEmail = (recipient_email || '').trim().toLowerCase()
  if (!recipient_first_name?.trim() || !recipient_last_name?.trim()) {
    return res.status(400).json({ message: 'Recipient first and last name are required' })
  }
  if (!recipient_house_number || !recipient_street || !recipient_city || !recipient_state || !recipient_zip_first3 || !recipient_zip_last2) {
    return res.status(400).json({ message: 'Recipient address fields are required' })
  }
  if (!recipientEmail) {
    recipientEmail = `recipient.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@pkg.internal`
  }
  if (recipientEmail === senderEmail) {
    return res.status(400).json({ message: 'Sender and recipient must be different people (different emails)' })
  }

  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    let senderId = (await customerDB.getCustomerByEmail(conn, senderEmail))?.Customer_ID
    if (!senderId) {
      senderId = await customerDB.createCustomerMinimal(conn, {
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
    }

    let recipientId = (await customerDB.getCustomerByEmail(conn, recipientEmail))?.Customer_ID
    if (!recipientId) {
      recipientId = await customerDB.createCustomerMinimal(conn, {
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
    }

    if (senderId === recipientId) {
      await conn.rollback()
      return res.status(400).json({ message: 'Sender and recipient must be different customers' })
    }

    const tracking = await nextTrackingNumber(conn)
    const oversize = typeCode === 'OVR' ? 1 : 0
    const sid = store_id != null ? Number(store_id) : 1

    await conn.query(
      `INSERT INTO package (
        Tracking_Number, Sender_ID, Recipient_ID,
        Dim_X, Dim_Y, Dim_Z,
        Package_Type_Code, Weight, Zone, Oversize, Requires_Signature, Price
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
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
        priceAmount,
      ]
    )

    const [[pending]] = await conn.query(
      `SELECT Status_Code FROM status_code WHERE Status_Name = 'Pending' LIMIT 1`
    )
    if (!pending) {
      throw new Error('Missing Pending status in status_code')
    }
    const pendingCode = pending.Status_Code

    await conn.query(
      `INSERT INTO delivery (Tracking_Number, Delivered_Date, Signature_Required, Signature_Received, Delivery_Status_Code, Delivered_By)
       VALUES (?, NULL, ?, NULL, ?, NULL)`,
      [tracking, sigRequired ? 1 : 0, pendingCode]
    )

    const [shipRes] = await conn.query(
      `INSERT INTO shipment (
        Status_Code, Employee_ID,
        From_Apt_Number, From_House_Number, From_Street, From_City, From_State, From_Zip_First3, From_Zip_Last2, From_Zip_Plus4, From_Country,
        To_Apt_Number, To_House_Number, To_Street, To_City, To_State, To_Zip_First3, To_Zip_Last2, To_Zip_Plus4, To_Country,
        Departure_Time_Stamp, Arrival_Time_Stamp
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NULL,NULL)`,
      [
        pendingCode,
        req.user.employee_id,
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
    await conn.query(
      `INSERT INTO shipment_package (Shipment_ID, Tracking_Number) VALUES (?,?)`,
      [shipmentId, tracking]
    )

    await conn.query(
      `INSERT INTO payment (Customer_ID, Store_ID, Items, Payment_Type, Payment_Amount, Payment_Status)
       VALUES (?,?,?,?,?, 'completed')`,
      [senderId, sid, 1, 1, priceAmount]
    )

    await conn.commit()
    res.status(201).json({
      tracking_number: tracking,
      price: priceAmount,
      sender_id: senderId,
      recipient_id: recipientId,
    })
  } catch (err) {
    await conn.rollback()
    console.error(err)
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Duplicate email or tracking conflict; try again' })
    }
    res.status(500).json({ message: err.message || 'Could not create package' })
  } finally {
    conn.release()
  }
})

app.get('/api/status-codes', authenticate, requireEmployee, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT Status_Code, Status_Name, Is_Final_Status FROM status_code ORDER BY Status_Code ASC`
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Database error' })
  }
})

app.patch('/api/employee/packages/:trackingNumber/status', authenticate, requireEmployee, async (req, res) => {
  const trackingNumber = (req.params.trackingNumber || '').trim()
  const { status_code } = req.body || {}
  if (!trackingNumber) return res.status(400).json({ message: 'trackingNumber required' })
  if (status_code === undefined || status_code === null) {
    return res.status(400).json({ message: 'status_code is required' })
  }
  const code = Number(status_code)
  if (Number.isNaN(code)) return res.status(400).json({ message: 'status_code must be a number' })

  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const [[d]] = await conn.query(
      `SELECT Delivery_ID FROM delivery WHERE Tracking_Number = ?`,
      [trackingNumber]
    )
    if (!d) {
      await conn.rollback()
      return res.status(404).json({ message: 'Delivery record not found for this package' })
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
      await conn.query(`UPDATE shipment SET Status_Code = ? WHERE Shipment_ID = ?`, [code, sp[0].Shipment_ID])
    }

    await conn.commit()
    res.json({ ok: true, tracking_number: trackingNumber, status_code: code })
  } catch (err) {
    await conn.rollback()
    console.error(err)
    res.status(500).json({ message: err.message || 'Update failed' })
  } finally {
    conn.release()
  }
})

// ════════════════════════════════════════════════════════════════════════════
//  INVENTORY ROUTES
// ════════════════════════════════════════════════════════════════════════════

app.get('/api/inventory', async (req, res) => {
  inventoryDB.getAllInventory(pool, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' })
    res.json(results)
  })
})

// Handle support ticket submission
app.post('/api/tickets', (req, res) => {
  const { name, email, transactionId, category, description, submittedAt } = req.body;

  // Validate required fields
  if (!name || !email || !transactionId || !category || !description) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // TODO: Save to database here
  console.log('New support ticket:', {
    name,
    email,
    transactionId,
    category,
    description,
    submittedAt
  });

  // Send success response
  res.status(201).json({ message: 'Ticket submitted successfully' });
});
// ════════════════════════════════════════════════════════════════════════════
//  CUSTOMERS ROUTES
// ════════════════════════════════════════════════════════════════════════════
app.get('/api/customers', (req, res) => {
  customerDB.getAllCustomers(pool, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/customers/:id/packages', (req, res) => {
  customerDB.getCustomerPackages(pool, req.params.id, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ── Start ─────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`))
