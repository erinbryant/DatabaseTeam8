// db/packages.js
// All package-related database queries

function getAllPackages(pool, callback) {
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
      CONCAT(cs.House_Number, ' ', cs.Street)   AS Sender_Street,
      cs.City                                    AS Sender_City,
      cs.State                                   AS Sender_State,
      CONCAT(cs.Zip_First3, cs.Zip_Last2)        AS Sender_Zip,

      p.Recipient_ID,
      CONCAT(cr.First_Name, ' ', cr.Last_Name)  AS Recipient_Name,
      CONCAT(cr.House_Number, ' ', cr.Street)   AS Recipient_Street,
      cr.City                                    AS Recipient_City,
      cr.State                                   AS Recipient_State,
      CONCAT(cr.Zip_First3, cr.Zip_Last2)        AS Recipient_Zip,

      sc.Status_Name,
      sc.Is_Final_Status,
      d.Delivered_Date,
      d.Signature_Required,
      d.Signature_Received

    FROM package p
    JOIN package_type pt  ON p.Package_Type_Code = pt.Package_Type_Code
    JOIN customer cs      ON p.Sender_ID         = cs.Customer_ID
    LEFT JOIN customer cr ON p.Recipient_ID       = cr.Customer_ID
    LEFT JOIN delivery d  ON p.Tracking_Number    = d.Tracking_Number
    LEFT JOIN status_code sc ON d.Delivery_Status_Code = sc.Status_Code
    ORDER BY p.Date_Created DESC
  `)
  .then(([results]) => callback(null, results))
  .catch(err => callback(err, null))
}

function getPackageByTracking(pool, trackingNumber, callback) {
  pool.query(`
    SELECT
      p.*,
      pt.Type_Name, pt.Description AS Type_Description,
      CONCAT(cs.First_Name,' ',cs.Last_Name) AS Sender_Name,
      CONCAT(cr.First_Name,' ',cr.Last_Name) AS Recipient_Name,
      sc.Status_Name, sc.Is_Final_Status,
      d.Delivered_Date, d.Signature_Required, d.Signature_Received
    FROM package p
    JOIN package_type pt  ON p.Package_Type_Code = pt.Package_Type_Code
    JOIN customer cs      ON p.Sender_ID         = cs.Customer_ID
    LEFT JOIN customer cr ON p.Recipient_ID       = cr.Customer_ID
    LEFT JOIN delivery d  ON p.Tracking_Number    = d.Tracking_Number
    LEFT JOIN status_code sc ON d.Delivery_Status_Code = sc.Status_Code
    WHERE p.Tracking_Number = ?
  `, [trackingNumber])
  .then(([results]) => callback(null, results[0] || null))
  .catch(err => callback(err, null))
}

Function 

module.exports = { getAllPackages, getPackageByTracking }
