async function allShipments(pool){
    
    const [results] = await pool.query(
    `
    SELECT
        s.Shipment_ID,
        s.Employee_ID,
        CONCAT(
            fa.House_Number, ' ', fa.Street,
            IF(fa.Apt_Number IS NOT NULL, CONCAT(' Apt ', fa.Apt_Number), ''),
            ', ', fa.City, ', ', fa.State, ' ', fa.Zip_Code
        ) AS From_Full_Address,
        CONCAT(
            ta.House_Number, ' ', ta.Street,
            IF(ta.Apt_Number IS NOT NULL, CONCAT(' Apt ', ta.Apt_Number), ''),
            ', ', ta.City, ', ', ta.State, ' ', ta.Zip_Code
        ) AS To_Full_Address,
         s.Departure_Time_Stamp,
         s.Arrival_Time_Stamp,
         s.Status_Code
    FROM shipment s
    JOIN address fa ON fa.Address_ID = s.From_Address_ID
    JOIN address ta ON ta.Address_ID = s.To_Address_ID
    ORDER BY s.Shipment_ID
    `
  );
  return results;
}
async function packageByShipment(pool, Shipment_ID){
    const[results] = await pool.query(
        `SELECT
            p.Tracking_Number
        FROM shipment_package p
        WHERE p.Shipment_ID = ?
        `,
        [Shipment_ID]
    );
    return results;
}

async function cascadeStatus(pool,Shipment_Id){
    const[results] = await pool.quert(
        `UPDATE Delivery
        SET Status_Code =`
    )
}
module.exports = {
  allShipments,
  packageByShipment
}