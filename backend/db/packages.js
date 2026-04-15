// db/packages.js
// All package-related database queries

function getAllPackages(pool, callback) {
  pool.query(`
    SELECT
      p.Tracking_Number,
      p.Weight,
      p.Dim_X, p.Dim_Y, p.Dim_Z,
      p.Zone,
      -- p.Price was removed from schema, removed here to stop error
      p.Oversize,
      p.Requires_Signature,
      -- p.Date_Created was removed; using Date_Updated as a fallback
      p.Date_Updated,
      p.Package_Type_Code,
      pt.Type_Name,
      pt.Description AS Type_Description,

      p.Sender_ID,
      CONCAT(cs.First_Name, ' ', cs.Last_Name) AS Sender_Name,
      -- Pulling from the NEW Address table via Customer
      addr_s.Street AS Sender_Street,
      addr_s.City AS Sender_City,
      addr_s.State AS Sender_State,
      addr_s.Zip_Code AS Sender_Zip,

      p.Recipient_ID,
      CONCAT(cr.First_Name, ' ', cr.Last_Name) AS Recipient_Name,
      -- Pulling from the NEW Address table via Recipient
      addr_r.Street AS Recipient_Street,
      addr_r.City AS Recipient_City,
      addr_r.State AS Recipient_State,
      addr_r.Zip_Code AS Recipient_Zip,

      sc.Status_Name,
      d.Delivery_Status_Code,
      sc.Is_Final_Status,
      d.Delivered_Date,
      d.Signature_Required,
      d.Signature_Received

    FROM package p
    JOIN package_type pt  ON p.Package_Type_Code = pt.Package_Type_Code
    JOIN customer cs      ON p.Sender_ID         = cs.Customer_ID
    -- Join the Address table for the Sender
    LEFT JOIN Address addr_s ON cs.Address_ID    = addr_s.Address_ID
    LEFT JOIN customer cr ON p.Recipient_ID      = cr.Customer_ID
    -- Join the Address table for the Recipient
    LEFT JOIN Address addr_r ON cr.Address_ID    = addr_r.Address_ID
    LEFT JOIN delivery d  ON p.Tracking_Number   = d.Tracking_Number
    LEFT JOIN status_code sc ON d.Delivery_Status_Code = sc.Status_Code
    ORDER BY p.Date_Updated DESC
  `)
  .then(([results]) => callback(null, results))
  .catch(err => callback(err, null))
}

// function getPackageByTracking(pool, trackingNumber, callback) {
//   pool.query(`
//     SELECT
//       p.*,
//       pt.Type_Name, pt.Description AS Type_Description,
//       CONCAT(cs.First_Name,' ',cs.Last_Name) AS Sender_Name,
//       CONCAT(cr.First_Name,' ',cr.Last_Name) AS Recipient_Name,
//       sc.Status_Name, sc.Is_Final_Status,
//       d.Delivered_Date, d.Signature_Required, d.Signature_Received
//     FROM package p
//     JOIN package_type pt  ON p.Package_Type_Code = pt.Package_Type_Code
//     JOIN customer cs      ON p.Sender_ID         = cs.Customer_ID
//     LEFT JOIN customer cr ON p.Recipient_ID       = cr.Customer_ID
//     LEFT JOIN delivery d  ON p.Tracking_Number    = d.Tracking_Number
//     LEFT JOIN status_code sc ON d.Delivery_Status_Code = sc.Status_Code
//     WHERE p.Tracking_Number = ?
//   `, [trackingNumber])
//   .then(([results]) => callback(null, results[0] || null))
//   .catch(err => callback(err, null))
// }

function getPackagesForCustomer(pool, customerID, callback) {
  pool.query(`
    SELECT
      p.Tracking_Number,
      p.Weight,
      p.Dim_X, p.Dim_Y, p.Dim_Z,
      p.Zone,
      p.Price,
      p.Oversize,
      p.Requires_Signature,
      p.Date_Created,
      p.Date_Updated,
      p.Package_Type_Code,
      pt.Type_Name,
      pt.Description  AS Type_Description,

      p.Sender_ID,
      CONCAT(cs.First_Name, ' ', cs.Last_Name)  AS Sender_Name,
      p.Recipient_ID,
      CONCAT(cr.First_Name, ' ', cr.Last_Name)  AS Recipient_Name,

      sc.Status_Name,
      sc.Is_Final_Status,
      d.Delivered_Date,
      d.Signature_Required,
      d.Signature_Received,
      CASE
        WHEN p.Sender_ID = ? THEN 'Sending'
        WHEN p.Recipient_ID = ? THEN 'Receiving'
      END AS role,

      pp.Arrival_Time AS Pickup_Arrival_Time,
      CASE
        WHEN pp.Tracking_Number IS NULL THEN NULL
        WHEN pp.Is_picked_Up IS NOT NULL AND pp.Is_picked_Up <> '0' THEN COALESCE(pp.Late_Fee_Amount, 0)
        WHEN pp.Arrival_Time IS NULL THEN NULL
        WHEN NOT (
          LOWER(TRIM(REPLACE(REPLACE(REPLACE(IFNULL(sc.Status_Name, ''), '-', ' '), '_', ' '), '  ', ' '))) = 'at office'
          OR REPLACE(LOWER(TRIM(IFNULL(sc.Status_Name, ''))), ' ', '') LIKE '%atoffice%'
        ) THEN NULL
        WHEN DATEDIFF(CURDATE(), DATE(pp.Arrival_Time)) > 20 THEN 20.00
        WHEN DATEDIFF(CURDATE(), DATE(pp.Arrival_Time)) > 10 THEN 10.00
        ELSE 0.00
      END AS Late_Fee_Due,
      CASE
        WHEN pp.Tracking_Number IS NULL OR pp.Arrival_Time IS NULL THEN NULL
        WHEN pp.Is_picked_Up IS NOT NULL AND pp.Is_picked_Up <> '0' THEN NULL
        WHEN NOT (
          LOWER(TRIM(REPLACE(REPLACE(REPLACE(IFNULL(sc.Status_Name, ''), '-', ' '), '_', ' '), '  ', ' '))) = 'at office'
          OR REPLACE(LOWER(TRIM(IFNULL(sc.Status_Name, ''))), ' ', '') LIKE '%atoffice%'
        ) THEN NULL
        ELSE DATEDIFF(CURDATE(), DATE(pp.Arrival_Time))
      END AS Days_At_Post_Office

    FROM package p
    JOIN package_type pt  ON p.Package_Type_Code = pt.Package_Type_Code
    JOIN customer cs      ON p.Sender_ID         = cs.Customer_ID
    LEFT JOIN customer cr ON p.Recipient_ID       = cr.Customer_ID
    LEFT JOIN delivery d  ON p.Tracking_Number    = d.Tracking_Number
    LEFT JOIN status_code sc ON d.Delivery_Status_Code = sc.Status_Code
    LEFT JOIN package_pickup pp ON pp.Tracking_Number = p.Tracking_Number AND pp.Recipient_ID = ?
    WHERE p.Sender_ID = ? OR p.Recipient_ID = ?
    ORDER BY p.Date_Created DESC
  `, [customerID, customerID, customerID, customerID, customerID])
  .then(([results]) => callback(null, results))
  .catch(err => callback(err, null))
}

module.exports = {
  getAllPackages,
  // getPackageByTracking,
  getPackagesForCustomer,
}
