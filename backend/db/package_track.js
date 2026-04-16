const getPackageTracking = (pool, tracking_number, callback) => {
  pool.query(
    `SELECT
        s.Shipment_ID,
        NULL AS Delivery_ID,
        'Shipment' AS Instance_Type,
        s.Status_Code,
        sc.Status_Name,
        sc.Is_Final_Status,
        CONCAT(
            af.House_Number, ' ', af.Street,
            IF(af.Apt_Number IS NOT NULL, CONCAT(' Apt ', af.Apt_Number), ''),
            ', ', af.City, ', ', af.State, ' ',
            af.Zip_Code) AS From_Full_Address,
        CONCAT(
            at.House_Number, ' ', at.Street,
            IF(at.Apt_Number IS NOT NULL, CONCAT(' Apt ', at.Apt_Number), ''),
            ', ', at.City, ', ', at.State, ' ',
            at.Zip_Code) AS To_Full_Address,
        s.Departure_Time_Stamp,
        s.Arrival_Time_Stamp,
        NULL AS Delivered_Date,
        NULL AS Signature_Received
    FROM shipment_package sp
    JOIN shipment s ON sp.Shipment_ID = s.Shipment_ID
    JOIN status_code sc ON s.Status_Code = sc.Status_Code
    JOIN address af ON s.From_Address_ID = af.Address_ID
    JOIN address at ON s.To_Address_ID = at.Address_ID
    WHERE sp.Tracking_Number = ?

    UNION ALL

    SELECT
        NULL AS Shipment_ID,
        d.Delivery_ID,
        'Delivery' AS Instance_Type,
        p.Status_Code AS Status_Code,
        sc.Status_Name,
        sc.Is_Final_Status,
        NULL AS From_Full_Address,
        NULL AS To_Full_Address,
        NULL AS Departure_Time_Stamp,
        NULL AS Arrival_Time_Stamp,
        d.Delivered_Date,
        d.Signature_Received
    FROM delivery d
    JOIN package p ON p.Tracking_Number = d.Tracking_Number
    JOIN status_code sc ON sc.Status_Code = p.Status_Code
    WHERE d.Tracking_Number = ?

    ORDER BY
        CASE WHEN Instance_Type = 'Shipment' THEN 0 ELSE 1 END,
        Departure_Time_Stamp,
        Delivered_Date`,
    [tracking_number, tracking_number]
  )
    .then(([rows]) => callback(null, rows))
    .catch((err) => callback(err, null))
}

module.exports = { getPackageTracking }
