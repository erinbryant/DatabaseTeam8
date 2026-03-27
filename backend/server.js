
const express = require('express')
const cors    = require('cors')
const mysql   = require('mysql2/promise')
const bcrypt  = require('bcryptjs')
const jwt     = require('jsonwebtoken')
require('dotenv').config()

const packagesDB  = require('./db/packages')
const inventoryDB = require('./db/inventory')
const customerDB = require('./db/customers')

const app = express()
app.use(cors())
app.use(express.json())

// ── DB pool ───────────────────────────────────────────────────────────────
const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               process.env.DB_PORT     || 3306,
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'post_office_8', 
  waitForConnections: true,
  connectionLimit:    10,
})

pool.getConnection()
  .then(c => { console.log('✅ MySQL connected'); c.release() })
  .catch(e => console.error('❌ MySQL connection failed:', e))

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

// ── Admin/Manager authorization middleware ─────────────────────────────────
const requireAdmin = (req, res, next) => {
  // Check if user role is Manager or Director (role_id 3 or 4)
  // Adjust role_ids based on your database
  if (![3, 4].includes(req.user.role_id)) {
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

// Register - OLD ENDPOINT (DISABLED - For backward compatibility only)
// Customer Register
app.post('/api/customer/register', async (req, res) => {
  const { first_name, last_name, email, password, phone_number,
          house_number, street, city, state, zip_first3, zip_last2 } = req.body

  if (!first_name || !last_name || !email || !password)
    return res.status(400).json({ message: 'Missing required fields' })

  try {
    const [exists] = await pool.query(
      'SELECT Customer_ID FROM Customer WHERE Email_Address = ?', [email]
    )
    if (exists.length)
      return res.status(400).json({ message: 'Email already registered' })

    const hash = await bcrypt.hash(password, 10)
    await pool.query(
      `INSERT INTO Customer
         (First_Name, Last_Name, House_Number, Street, City, State,
          Zip_First3, Zip_Last2, Password_Hash, Email_Address, Phone_Number)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [first_name, last_name, house_number || '0', street || 'Unknown',
       city || 'Unknown', state || 'TX', zip_first3 || '000',
       zip_last2 || '00', hash, email, phone_number || null]
    )

    res.status(201).json({ message: 'Customer registered successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
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

// ── GET all support tickets ────────────────────────────────────────────────
app.get('/api/tickets', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT st.Ticket_ID,
             c.First_Name AS Customer_First, c.Last_Name AS Customer_Last,
             p.Tracking_Number,
             e.First_Name AS Employee_First, e.Last_Name AS Employee_Last,
             st.Issue_Type, st.Description, st.Resolution_Note, st.Ticket_Status_Code
      FROM Support_Ticket st
      JOIN Customer c ON st.User_ID = c.Customer_ID
      JOIN Employee e ON st.Assigned_Employee_ID = e.Employee_ID
      JOIN Package p ON st.Package_ID = p.Tracking_Number
      ORDER BY st.Ticket_ID DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error('Error fetching tickets:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
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
