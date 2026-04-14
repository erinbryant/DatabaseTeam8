async function allShipments(pool){
    
    const [results] = await pool.query(
    `
    SELECT
        Shipment_ID,
        Employee_ID,
        CONCAT(
            From_House_Number, ' ', From_Street,
            IF(From_Apt_Number IS NOT NULL, CONCAT(' Apt ', From_Apt_Number), ''),
            ', ', From_City, ', ', From_State, ' ',
            From_Zip_First3, From_Zip_Last2,
            IF(From_Zip_Plus4 IS NOT NULL, CONCAT('-', From_Zip_Plus4), '')
        ) AS From_Full_Address,
        CONCAT(
            To_House_Number, ' ', To_Street,
            IF(To_Apt_Number IS NOT NULL, CONCAT(' Apt ', To_Apt_Number), ''),
            ', ', To_City, ', ', To_State, ' ',
            To_Zip_First3, To_Zip_Last2,
            IF(To_Zip_Plus4 IS NOT NULL, CONCAT('-', To_Zip_Plus4), '')
        ) AS To_Full_Address,
         Departure_Time_Stamp,
         Arrival_Time_Stamp,
         Status_Code
    From Shipment
    ORDER BY Shipment_ID
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