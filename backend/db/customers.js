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
  const dbStatus = isActive ? 0 : 1;

  pool.query(
    'UPDATE customer SET is_Active = ? WHERE Customer_ID = ?',
    [dbStatus, customerID]
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
    sex,
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
  if (!zip_code) missing.push('zip_code')

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

  const addressId = await resolveAddress(pool, {
    house_number,
    street,
    city,
    state,
    zip_code,
    apt_number,
    country,
  })

  const normalizedSex = String(sex || 'U').trim().toUpperCase()
  const safeSex = ['M', 'F', 'O', 'U'].includes(normalizedSex) ? normalizedSex : 'U'

  const enrichedBody = {
    first_name: first_name.trim().slice(0, 30),
    middle_name: middle_name || null,
    last_name: last_name.trim().slice(0, 30),
    email: email.trim().toLowerCase().slice(0, 255),
    phone_number: phone_number || null,
    sex: safeSex,
  }

  const { customerId, existed } = await resolveCustomer(pool, enrichedBody, hash, addressId, password)

  if (existed) {
    const err = new Error('Customer already registered')
    err.status = 400
    throw err
  }

  const user = {
    Customer_ID: customerId,
    First_Name: enrichedBody.first_name,
    Middle_Name: enrichedBody.middle_name,
    Last_Name: enrichedBody.last_name,
    Email_Address: enrichedBody.email,
    Phone_Number: enrichedBody.phone_number,
    Sex: enrichedBody.sex,
    Address_ID: addressId,
    is_Active: 0,
  }

  return { customer_id: customerId, user }
}

async function getCustomerByEmail(pool, email) {
  if (!email?.trim()) return null
  const [rows] = await pool.query(`
    SELECT
      *
    FROM customer
    WHERE LOWER(Email_Address) = ? AND is_Active = 0
  `, [email.trim().toLowerCase()])
  
  return rows[0] || null
}

const EMPLOYEE_CREATED_CUSTOMER_PASSWORD = 'customer123'

async function resolveAddress(conn, { house_number, street, city, state, zip_code, apt_number, country }) {
  const [addrRows] = await conn.query(
    `SELECT Address_ID FROM address
     WHERE House_Number = ? AND Street = ? AND City = ? AND State = ?
       AND Zip_Code = ?
       AND (Apt_Number <=> ?)
     LIMIT 1`,
    [
      house_number,
      street,
      city,
      state,
      String(zip_code).replace(/\D/g, '').slice(0, 5),
      apt_number || null
    ]
  )

  if (addrRows.length) {
    return addrRows[0].Address_ID  // ← already exists, return early
  }

  const [addrRes] = await conn.query(
    `INSERT INTO address 
     (House_Number, Street, City, State, Zip_Code, Apt_Number, Country)
     VALUES (?,?,?,?,?,?,?)`,
    [
      String(house_number).slice(0, 10),
      String(street).slice(0, 100),
      String(city).slice(0, 100),
      String(state).slice(0, 50),
      String(zip_code).replace(/\D/g, '').slice(0, 5),
      apt_number || null,
      (country || 'USA').toString().slice(0, 50),
    ]
  )

  if (!addrRes.insertId) {
    throw new Error("Address insert failed — no insertId returned")
  }

  return addrRes.insertId
}

async function resolveCustomer(conn, body, hash, addressId, initialPassword) {
  // 1. Check if customer already exists
  const [existing] = await conn.query(
    `SELECT Customer_ID
     FROM customer
     WHERE First_Name = ?
       AND Last_Name = ?
       AND Address_ID = ?
     LIMIT 1`,
    [
      String(body.first_name).trim(),
      String(body.last_name).trim(),
      addressId
    ]
  );

  if (existing.length > 0) {
    return {
      customerId: existing[0].Customer_ID,
      initialPassword: null, // already exists, so no new password
      existed: true
    };
  }

  // 2. Otherwise insert new customer
  const [result] = await conn.query(
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
  );

  return {
    customerId: result.insertId,
    initialPassword,
    existed: false
  };
}


async function createCustomerMinimal(pool, body) {
  const initialPassword = EMPLOYEE_CREATED_CUSTOMER_PASSWORD
  const hash = await bcrypt.hash(initialPassword, 10)

  const addressId = await resolveAddress(conn, body);
  
  // const addressId = addrResult.insertId

  const { customerId, existed } = await resolveCustomer(
    conn,
    body,
    hash,
    addressId,
    initialPassword
  );

  return {
    customerId,
    initialPassword: existed ? null : initialPassword
};
}

module.exports = {
  getAllCustomers,
  getCustomerByID,
  getCustomerPackages,
  registerCustomer,
  getCustomerByEmail,
  createCustomerMinimal,
  updateCustomerStatus,
   resolveAddress,
}