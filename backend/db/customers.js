const bcrypt = require('bcryptjs')

function getAllCustomers(pool, callback) {
  pool.query(`
    SELECT
      c.Customer_ID,
      c.is_Active,
      CONCAT(
        c.First_Name, ' ',
        IF(c.Middle_Name IS NOT NULL, CONCAT(c.Middle_Name, ' '), ''),
        c.Last_Name
      ) AS Full_Name,
      CONCAT(
        a.House_Number, ' ', a.Street,
        IF(a.Apt_Number IS NOT NULL, CONCAT(' Apt ', a.Apt_Number), ''),
        ', ', a.City, ', ', a.State, ' ', a.Zip_Code
      ) AS Full_Address,
      a.Country,
      c.Email_Address,
      c.Phone_Number
    FROM customer c
    INNER JOIN address a ON c.Address_ID = a.Address_ID
    ORDER BY c.Last_Name, c.First_Name ASC
  `)
  .then(([results]) => callback(null, results))
  .catch(err => callback(err, null))
}

function getCustomerPackages(pool, customerID, callback) {
  pool.query(`
    SELECT 
      Tracking_Number,
      Sender_ID,
      Recipient_ID,
      CASE 
        WHEN Sender_ID = ? THEN 'Sending'
        WHEN Recipient_ID = ? THEN 'Receiving'
      END AS Role
    FROM package
    WHERE Sender_ID = ? OR Recipient_ID = ?
  `, [customerID, customerID, customerID, customerID])
  .then(([results]) => callback(null, results))
  .catch(err => callback(err, null))
}

function getCustomerByID(pool, customerID, callback) {
  pool.query(`
    SELECT
      c.Customer_ID,
      c.is_Active,
      CONCAT(c.First_Name, ' ', COALESCE(CONCAT(c.Middle_Name, ' '), ''), c.Last_Name) AS Full_Name,
      CONCAT(
        a.House_Number, ' ', a.Street,
        COALESCE(CONCAT(' Apt ', a.Apt_Number), ''),
        ', ', a.City, ', ', a.State, ' ', a.Zip_Code
      ) AS Full_Address,
      a.Country,
      c.Email_Address,
      c.Phone_Number
    FROM customer c
    INNER JOIN address a ON c.Address_ID = a.Address_ID
    WHERE c.Customer_ID = ?
  `, [customerID])
  .then(([results]) => callback(null, results[0] || null))
  .catch(err => callback(err, null))
}

function updateCustomerStatus(pool, customerID, isActive, callback){
  pool.query(
    'UPDATE customer SET is_Active = ? WHERE Customer_ID = ?',
    [Number(isActive), customerID]
  )
  .then(([result]) => {
    if(result.affectedRows === 0) {
      return callback(new Error('Customer not found'), null);
    }
    callback(null, result);
  })
  .catch(err => callback(err,null));
}

async function registerCustomer(pool, rawBody) {
  const body = { ...rawBody }
  delete body.customer_id
  delete body.Customer_ID

  const {
    first_name,
    middle_name,
    last_name,
    email,
    password,
    phone_number,
    apt_number,
    house_number,
    street,
    city,
    state,
    zip_code,
    country,
  } = body

  const missing = []
  if (!first_name?.trim()) missing.push('first_name')
  if (!last_name?.trim()) missing.push('last_name')
  if (!email?.trim()) missing.push('email')
  if (!password) missing.push('password')
  if (!house_number?.toString().trim()) missing.push('house_number')
  if (!street?.trim()) missing.push('street')
  if (!city?.trim()) missing.push('city')
  if (!state?.toString().trim()) missing.push('state')
  if (!zip_code?.toString().trim()) missing.push('zip_code')

  if (missing.length) {
    const err = new Error(`Missing required fields: ${missing.join(', ')}`)
    err.status = 400
    throw err
  }

  const [exists] = await pool.query(
    'SELECT Customer_ID FROM customer WHERE Email_Address = ?',
    [email.trim().toLowerCase()]
  )
  if (exists.length) {
    const err = new Error('Email already registered')
    err.status = 400
    throw err
  }

  const hash = await bcrypt.hash(password, 10)

  const [addrResult] = await pool.query(
    `INSERT INTO address (Apt_Number, House_Number, Street, City, State, Zip_Code, Country) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      apt_number || null,
      String(house_number).trim(),
      street.trim(),
      city.trim(),
      state.trim(),
      String(zip_code).trim().slice(0, 5),
      country || 'USA'
    ]
  )
  const addressId = addrResult.insertId

  const [result] = await pool.query(
    `INSERT INTO customer (
      First_Name, Middle_Name, Last_Name,
      Password_Hash, Email_Address, Phone_Number,
      Address_ID, is_Active
    ) VALUES (?,?,?,?,?,?,?,0)`,
    [
      first_name.trim().slice(0, 30),
      middle_name || null,
      last_name.trim().slice(0, 30),
      hash,
      email.trim().toLowerCase().slice(0, 255),
      phone_number || null,
      addressId
    ]
  )

  const customerId = result.insertId
  const [rows] = await pool.query(
    'SELECT Customer_ID, Email_Address, First_Name, Last_Name FROM customer WHERE Customer_ID = ?',
    [customerId]
  );

  return { 
    customer_id: customerId,
    user:rows[0]
  };
}

async function getCustomerByEmail(pool, email) {
  if (!email?.trim()) return null
  const [rows] = await pool.query(`
    SELECT 
      c.*, 
      a.House_Number, a.Street, a.City, a.State, a.Zip_Code, a.Country
    FROM customer c
    INNER JOIN address a ON c.Address_ID = a.Address_ID
    WHERE LOWER(c.Email_Address) = ? AND c.is_Active = 0
  `, [email.trim().toLowerCase()])
  
  return rows[0] || null
}

const EMPLOYEE_CREATED_CUSTOMER_PASSWORD = 'customer123'

async function createCustomerMinimal(pool, body) {
  const initialPassword = EMPLOYEE_CREATED_CUSTOMER_PASSWORD
  const hash = await bcrypt.hash(initialPassword, 10)

  const [addrResult] = await pool.query(
    `INSERT INTO address (Apt_Number, House_Number, Street, City, State, Zip_Code, Country) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      body.apt_number || null,
      String(body.house_number).trim(),
      body.street.trim(),
      body.city.trim(),
      body.state.trim(),
      String(body.zip_code || body.zip_first3).trim().slice(0, 5),
      body.country || 'USA'
    ]
  )
  
  const addressId = addrResult.insertId

  const [result] = await pool.query(
    `INSERT INTO customer (
      First_Name, Middle_Name, Last_Name,
      Password_Hash, Email_Address, Phone_Number,
      Address_ID
    ) VALUES (?,?,?,?,?,?,?)`,
    [
      String(body.first_name).trim(),
      null,
      String(body.last_name).trim(),
      hash,
      String(body.email).trim().toLowerCase(),
      body.phone_number || null,
      addressId
    ]
  )
  return { customerId: result.insertId, initialPassword }
}

module.exports = {
  getAllCustomers,
  getCustomerByID,
  getCustomerPackages,
  registerCustomer,
  getCustomerByEmail,
  createCustomerMinimal,
  updateCustomerStatus,
}