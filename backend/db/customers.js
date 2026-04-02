const bcrypt = require('bcryptjs')

function getAllCustomers(pool, callback) {
  pool.query(`
    SELECT
      Customer_ID,
      CONCAT(
        First_Name, ' ',
        IF(Middle_Name IS NOT NULL, CONCAT(Middle_Name, ' '), ''),
        Last_Name
      ) AS Full_Name,
      CONCAT(
        House_Number, ' ', Street,
        IF(Apt_Number IS NOT NULL, CONCAT(' Apt ', Apt_Number), ''),
        ', ', City, ', ', State, ' ',
         Zip_First3, Zip_Last2,
        IF(Zip_Plus4 IS NOT NULL, CONCAT('-', Zip_Plus4), '')
      ) AS Full_Address,
      Country,
      Email_Address,
      Phone_Number
    FROM customer
    ORDER BY Last_Name, First_Name ASC
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
      END AS role
    FROM package
    WHERE Sender_ID = ? OR Recipient_ID = ?
  `, [customerID, customerID, customerID, customerID])
  .then(([results]) => callback(null, results))
  .catch(err => callback(err, null))
}

function getCustomerByID(pool, customerID, callback) {
  pool.query(`
    SELECT
      Customer_ID,
      CONCAT(First_Name, ' ', COALESCE(CONCAT(Middle_Name, ' '), ''), Last_Name) AS Full_Name,
      CONCAT(
        House_Number, ' ', Street,
        COALESCE(CONCAT(' Apt ', Apt_Number), ''),
        ', ', City, ', ', State, ' ',
        Zip_First3, '-', Zip_Last2,
        COALESCE(CONCAT('-', Zip_Plus4), '')
      ) AS Full_Address,
      Country,
      Email_Address,
      Phone_Number
    FROM customer
    WHERE Customer_ID = ?
  `, [customerID])
  .then(([results]) => callback(null, results[0] || null))
  .catch(err => callback(err, null))
}

/**
 * Register a new customer. Validates input; hashes password; inserts row.
 * Customer_ID is never sent by the client: MySQL assigns it via AUTO_INCREMENT on Customer.Customer_ID.
 * Expects DB columns: Birth_Day, Birth_Month, Birth_Year, Sex (see migrations/).
 */
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
    zip_first3,
    zip_last2,
    zip_plus4,
    country,
    birth_day,
    birth_month,
    birth_year,
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
  if (!zip_first3?.toString().trim()) missing.push('zip_first3')
  if (!zip_last2?.toString().trim()) missing.push('zip_last2')
  if (birth_day === undefined || birth_day === '') missing.push('birth_day')
  if (birth_month === undefined || birth_month === '') missing.push('birth_month')
  if (birth_year === undefined || birth_year === '') missing.push('birth_year')
  if (!sex?.toString().trim()) missing.push('sex')

  if (missing.length) {
    const err = new Error(`Missing required fields: ${missing.join(', ')}`)
    err.status = 400
    err.code = 'VALIDATION'
    throw err
  }

  const bd = parseInt(String(birth_day).trim(), 10)
  const bm = parseInt(String(birth_month).trim(), 10)
  const by = parseInt(String(birth_year).trim(), 10)
  const sexNorm = String(sex).trim().toUpperCase().charAt(0)

  if (Number.isNaN(bd) || bd < 1 || bd > 31) {
    const err = new Error('birth_day must be between 1 and 31')
    err.status = 400
    err.code = 'VALIDATION'
    throw err
  }
  if (Number.isNaN(bm) || bm < 1 || bm > 12) {
    const err = new Error('birth_month must be between 1 and 12')
    err.status = 400
    err.code = 'VALIDATION'
    throw err
  }
  if (Number.isNaN(by) || by < 1900 || by > new Date().getFullYear()) {
    const err = new Error('birth_year is invalid')
    err.status = 400
    err.code = 'VALIDATION'
    throw err
  }
  if (!['M', 'F', 'O', 'U'].includes(sexNorm)) {
    const err = new Error('sex must be M, F, O, or U')
    err.status = 400
    err.code = 'VALIDATION'
    throw err
  }

  const zip3 = String(zip_first3).replace(/\D/g, '').slice(0, 3)
  const zip2 = String(zip_last2).replace(/\D/g, '').slice(0, 2)
  if (zip3.length !== 3) {
    const err = new Error('zip_first3 must be exactly 3 digits')
    err.status = 400
    err.code = 'VALIDATION'
    throw err
  }
  if (zip2.length !== 2) {
    const err = new Error('zip_last2 must be exactly 2 digits')
    err.status = 400
    err.code = 'VALIDATION'
    throw err
  }

  const stateNorm = String(state).trim().slice(0, 50)
  if (stateNorm.length < 2) {
    const err = new Error('state is required')
    err.status = 400
    err.code = 'VALIDATION'
    throw err
  }

  if (password.length < 6) {
    const err = new Error('Password must be at least 6 characters')
    err.status = 400
    err.code = 'VALIDATION'
    throw err
  }

  const [exists] = await pool.query(
    'SELECT Customer_ID FROM customer WHERE Email_Address = ?',
    [email.trim().toLowerCase()]
  )
  if (exists.length) {
    const err = new Error('Email already registered')
    err.status = 400
    err.code = 'DUPLICATE_EMAIL'
    throw err
  }

  const hash = await bcrypt.hash(password, 10)

  const middleTrim = middle_name?.toString().trim()
  const middleVal = middleTrim ? middleTrim.slice(0, 30) : null

  const aptTrim = apt_number?.toString().trim()
  const aptVal = aptTrim ? aptTrim.slice(0, 10) : null

  const z4digits = zip_plus4 !== undefined && zip_plus4 !== null
    ? String(zip_plus4).replace(/\D/g, '')
    : ''
  let zipPlusVal = null
  if (z4digits.length === 0) {
    zipPlusVal = null
  } else if (z4digits.length === 4) {
    zipPlusVal = z4digits
  } else {
    const err = new Error('zip_plus4 must be exactly 4 digits or left empty')
    err.status = 400
    err.code = 'VALIDATION'
    throw err
  }

  const countryVal = (country?.toString().trim() || 'USA').slice(0, 50)

  const [result] = await pool.query(
    `INSERT INTO customer (
      First_Name, Middle_Name, Last_Name,
      Apt_Number, House_Number, Street, City, State,
      Zip_First3, Zip_Last2, Zip_Plus4,
      Country,
      Password_Hash, Email_Address, Phone_Number,
      Birth_Day, Birth_Month, Birth_Year, Sex
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      first_name.trim().slice(0, 30),
      middleVal,
      last_name.trim().slice(0, 30),
      aptVal,
      String(house_number).trim().slice(0, 10),
      street.trim().slice(0, 100),
      city.trim().slice(0, 100),
      stateNorm,
      zip3,
      zip2,
      zipPlusVal,
      countryVal,
      hash,
      email.trim().toLowerCase().slice(0, 255),
      phone_number ? String(phone_number).trim().slice(0, 20) : null,
      bd,
      bm,
      by,
      sexNorm,
    ]
  )

  const customerId = result.insertId
  const [rows] = await pool.query(
    `SELECT Customer_ID, First_Name, Middle_Name, Last_Name, Email_Address, Phone_Number,
            Apt_Number, House_Number, Street, City, State, Zip_First3, Zip_Last2, Zip_Plus4,
            Country,
            Birth_Day, Birth_Month, Birth_Year, Sex
     FROM customer WHERE Customer_ID = ?`,
    [customerId]
  )
  const user = rows[0]
  return { customer_id: customerId, user }
}

module.exports = {
  getAllCustomers,
  getCustomerByID,
  getCustomerPackages,
  registerCustomer,
}
