function getAllCustomers(pool, callback) {
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
    FROM Customer
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
      END AS Role
    FROM Package
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
    FROM Customer
    WHERE Customer_ID = ?
  `, [customerID])
  .then(([results]) => callback(null, results[0] || null))
  .catch(err => callback(err, null))
}


module.exports = { getAllCustomers, getCustomerByID, getCustomerPackages }