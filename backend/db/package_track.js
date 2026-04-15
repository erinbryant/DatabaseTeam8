const getPackageTracking = (pool, tracking_number, callback) => {
  pool.query(
    `SELECT
      s.Shipment_ID,
      'Shipment' AS Instance_Type,
      s.Status_Code,
      sc.Status_Name,
      sc.Is_Final_Status,
      CONCAT(
        s.From_House_Number, ' ', s.From_Street,
        IF(s.From_Apt_Number IS NOT NULL, CONCAT(' Apt ', s.From_Apt_Number), ''),
        ', ', s.From_City, ', ', s.From_State, ' ',
         s.From_Zip_First3, s.From_Zip_Last2,
        IF(s.From_Zip_Plus4 IS NOT NULL, CONCAT('-', s.From_Zip_Plus4), '')
      ) AS From_Full_Address,
       CONCAT(
        s.To_House_Number, ' ', s.To_Street,
        IF(s.To_Apt_Number IS NOT NULL, CONCAT(' Apt ', s.To_Apt_Number), ''),
        ', ', s.To_City, ', ', s.To_State, ' ',
         s.To_Zip_First3, s.To_Zip_Last2,
        IF(s.To_Zip_Plus4 IS NOT NULL, CONCAT('-', s.To_Zip_Plus4), '')
      ) AS To_Full_Address,
      s.Departure_Time_Stamp,
      s.Arrival_Time_Stamp,
      NULL AS Delivered_Date,
      NULL AS Signature_Received
    FROM shipment_package sp
    JOIN shipment s     ON sp.Shipment_ID = s.Shipment_ID
    JOIN status_code sc ON s.Status_Code = sc.Status_Code
    WHERE sp.Tracking_Number = ?

    UNION ALL

    SELECT
      d.Delivery_ID AS Shipment_ID,
      'Delivery' AS Instance_Type,
      d.Delivery_Status_Code,
      sc.Status_Name,
      sc.Is_Final_Status,
      NULL AS From_Full_Address,
      NULL AS To_Full_Address,
      NULL AS Departure_Time_Stamp,
      NULL AS Arrival_Time_Stamp,
      d.Delivered_Date,
      d.Signature_Received
    FROM delivery d
    JOIN status_code sc ON d.Delivery_Status_Code = sc.Status_Code
    WHERE d.Tracking_Number = ?

    ORDER BY Departure_Time_Stamp`,
    [tracking_number, tracking_number]
  )
  .then(([rows]) => callback(null, rows))
  .catch((err) => callback(err, null))
}

module.exports = { getPackageTracking }