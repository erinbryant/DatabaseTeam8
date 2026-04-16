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
      addr.City                  AS city,
      addr.State                 AS state,
      CONCAT(addr.House_Number, ' ', addr.Street) AS office_address
    FROM product pr
    JOIN store s        ON pr.Store_ID      = s.Store_ID
    JOIN post_office po ON s.Post_Office_ID = po.Post_Office_ID
    JOIN address addr ON po.Address_ID = addr.Address_ID
    ORDER BY addr.City, pr.Product_name
  `)
    .then(([results]) => callback(null, results))
    .catch((err) => callback(err, null))
}

// Employee-only: update quantity for a product at a given store
// function updateInventoryQuantity(pool, { upc, store_id, quantity }, callback) {
//   pool
//     .query(
//       `
//       UPDATE product
//       SET Quantity = ?
//       WHERE Universal_Product_Code = ? AND Store_ID = ?
//       `,
//       [quantity, upc, store_id]
//     )
//     .then(([result]) => callback(null, result))
//     .catch((err) => callback(err, null))
// }

module.exports = { getAllInventory, 
  // updateInventoryQuantity 
}