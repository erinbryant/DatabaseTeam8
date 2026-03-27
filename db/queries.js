export function getAllPackages(db, callback) {
  db.query('SELECT * FROM package', callback)
}

export function getAllCustomers(db, callback){
  db.query('SELECT * FROM customer', callback)
}