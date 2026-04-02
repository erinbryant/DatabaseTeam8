// db/inventory.js
// All inventory-related database queries

function getAllInventory(pool, callback) {
  pool.query(`
    SELECT
      pr.Universal_Product_Code  AS upc,
      pr.Product_name            AS product_name,
      pr.Price                   AS price,
      pr.Quantity                AS quantity,
      s.Store_ID                 AS store_id,
      po.Post_Office_ID          AS post_office_id,
      po.City                    AS city,
      po.State                   AS state,
      CONCAT(po.House_Number, ' ', po.Street) AS office_address
    FROM product pr
    JOIN store s        ON pr.Store_ID      = s.Store_ID
    JOIN post_office po ON s.Post_Office_ID = po.Post_Office_ID
    ORDER BY po.City, pr.Product_name
  `)
  .then(([results]) => callback(null, results))
  .catch(err => callback(err, null))
}

module.exports = { getAllInventory }
