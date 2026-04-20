// db/operations.js
// All queries for the Operations Hub
// Admin only (Role_ID = 5)
// Azure MySQL strict only_full_group_by safe

// console.log('operations.js loaded - version 3')

// ── POST OFFICES ──────────────────────────────────────────────────────────
function getPostOffices(pool, { search } = {}, callback) {
  let sql = `
    SELECT
      po.Post_Office_ID,
      a.City,
      a.State,
      a.Zip_Code,
      CONCAT(a.City, ', ', a.State) AS Label
    FROM post_office po
    JOIN address a ON po.Address_ID = a.Address_ID
    WHERE 1=1
  `
  const params = []
  if (search) {
    sql += ` AND (a.City LIKE ? OR a.State LIKE ? OR a.Zip_Code LIKE ? OR CAST(po.Post_Office_ID AS CHAR) LIKE ?)`
    const s = `%${search}%`
    params.push(s, s, s, s)
  }
  sql += ` ORDER BY a.State, a.City LIMIT 50`
  pool.query(sql, params)
    .then(([results]) => callback(null, results))
    .catch(err => callback(err, null))
}

// ── DEPARTMENTS ───────────────────────────────────────────────────────────
function getDepartments(pool, callback) {
  pool.query(`SELECT Department_ID, Department_Name FROM department ORDER BY Department_Name ASC`)
    .then(([results]) => callback(null, results))
    .catch(err => callback(err, null))
}

// ── REVENUE: paginated table ──────────────────────────────────────────────
function getRevenueData(pool, {
  page = 1, limit = 20,
  amount_min, amount_max,
  date_from, date_to,
  weight_min, weight_max,
  zone_min, zone_max,
  package_type, employee_name,
  post_office_id
} = {}, callback) {

  const offset = (Number(page) - 1) * Number(limit)
  const cond = []
  const params = []

  if (amount_min   != null && amount_min   !== '') { cond.push('pay.Payment_Amount >= ?');   params.push(Number(amount_min)) }
  if (amount_max   != null && amount_max   !== '') { cond.push('pay.Payment_Amount <= ?');   params.push(Number(amount_max)) }
  if (date_from)                                   { cond.push('pay.Date_Created >= ?');     params.push(date_from) }
  if (date_to)                                     { cond.push('pay.Date_Created <= ?');     params.push(date_to + ' 23:59:59') }
  if (weight_min   != null && weight_min   !== '') { cond.push('pkg.Weight >= ?');           params.push(Number(weight_min)) }
  if (weight_max   != null && weight_max   !== '') { cond.push('pkg.Weight <= ?');           params.push(Number(weight_max)) }
  if (zone_min     != null && zone_min     !== '') { cond.push('pkg.Zone >= ?');             params.push(Number(zone_min)) }
  if (zone_max     != null && zone_max     !== '') { cond.push('pkg.Zone <= ?');             params.push(Number(zone_max)) }
  if (package_type)                                { cond.push('pkg.Package_Type_Code = ?'); params.push(package_type) }
  if (employee_name)                               { cond.push("CONCAT(emp.First_Name, ' ', emp.Last_Name) LIKE ?"); params.push(`%${employee_name}%`) }
  if (post_office_id && post_office_id !== '') { cond.push('emp.Post_Office_ID = ?'); params.push(Number(post_office_id)) }

  const where = cond.length ? `WHERE ${cond.join(' AND ')}` : ''

  const countSql = `
    SELECT COUNT(*) AS total
    FROM payment pay
    LEFT JOIN package pkg  ON pkg.Tracking_Number = pay.Tracking_Number
    LEFT JOIN employee emp ON emp.Employee_ID      = pay.Employee_ID
    ${where}
  `

  const dataSql = `
    SELECT
      pay.Payment_ID,
      pay.Payment_Amount,
      pay.Date_Created,
      pay.Tracking_Number,
      pkg.Package_Type_Code,
      pkg.Weight,
      pkg.Zone,
      CONCAT(c.First_Name,   ' ', c.Last_Name)  AS Customer_Name,
      CONCAT(emp.First_Name, ' ', emp.Last_Name) AS Employee_Name,
      a.City  AS Office_City,
      a.State AS Office_State
    FROM payment pay
    LEFT JOIN package pkg    ON pkg.Tracking_Number = pay.Tracking_Number
    LEFT JOIN customer c     ON c.Customer_ID       = pay.Customer_ID
    LEFT JOIN employee emp   ON emp.Employee_ID      = pay.Employee_ID
    LEFT JOIN post_office po ON po.Post_Office_ID   = emp.Post_Office_ID
    LEFT JOIN address a      ON a.Address_ID         = po.Address_ID
    ${where}
    ORDER BY pay.Date_Created DESC
    LIMIT ? OFFSET ?
  `

  Promise.all([
    pool.query(countSql, params),
    pool.query(dataSql,  [...params, Number(limit), offset]),
  ])
    .then(([[countRows], [dataRows]]) => callback(null, {
      data:       dataRows,
      total:      countRows[0].total,
      page:       Number(page),
      limit:      Number(limit),
      totalPages: Math.ceil(countRows[0].total / Number(limit)),
    }))
    .catch(err => callback(err, null))
}

// ── REVENUE: stats ────────────────────────────────────────────────────────
function getRevenueStats(pool, {
  amount_min, amount_max,
  date_from, date_to,
  weight_min, weight_max,
  zone_min, zone_max,
  package_type, employee_name,
  post_office_id
} = {}, callback) {

  const cond = []
  const params = []

  if (amount_min   != null && amount_min   !== '') { cond.push('pay.Payment_Amount >= ?');   params.push(Number(amount_min)) }
  if (amount_max   != null && amount_max   !== '') { cond.push('pay.Payment_Amount <= ?');   params.push(Number(amount_max)) }
  if (date_from)                                   { cond.push('pay.Date_Created >= ?');     params.push(date_from) }
  if (date_to)                                     { cond.push('pay.Date_Created <= ?');     params.push(date_to + ' 23:59:59') }
  if (weight_min   != null && weight_min   !== '') { cond.push('pkg.Weight >= ?');           params.push(Number(weight_min)) }
  if (weight_max   != null && weight_max   !== '') { cond.push('pkg.Weight <= ?');           params.push(Number(weight_max)) }
  if (zone_min     != null && zone_min     !== '') { cond.push('pkg.Zone >= ?');             params.push(Number(zone_min)) }
  if (zone_max     != null && zone_max     !== '') { cond.push('pkg.Zone <= ?');             params.push(Number(zone_max)) }
  if (package_type)                                { cond.push('pkg.Package_Type_Code = ?'); params.push(package_type) }
  if (employee_name)                               { cond.push("CONCAT(emp.First_Name, ' ', emp.Last_Name) LIKE ?"); params.push(`%${employee_name}%`) }
  if (post_office_id && post_office_id !== '') { cond.push('emp.Post_Office_ID = ?'); params.push(Number(post_office_id)) }

  const where = cond.length ? `WHERE ${cond.join(' AND ')}` : ''

  const statsSql = `
    SELECT
      COUNT(*)                             AS Total_Transactions,
      COALESCE(SUM(pay.Payment_Amount), 0) AS Total_Revenue,
      COALESCE(AVG(pay.Payment_Amount), 0) AS Avg_Per_Transaction,
      COALESCE(MAX(pay.Payment_Amount), 0) AS Max_Transaction,
      COALESCE(MIN(pay.Payment_Amount), 0) AS Min_Transaction
    FROM payment pay
    LEFT JOIN package pkg  ON pkg.Tracking_Number = pay.Tracking_Number
    LEFT JOIN employee emp ON emp.Employee_ID      = pay.Employee_ID
    ${where}
  `

  const monthlySql = `
    SELECT yr, mo, Month_Label, Month_Key, Transactions, Revenue FROM (
      SELECT
        YEAR(pay.Date_Created)                        AS yr,
        MONTH(pay.Date_Created)                       AS mo,
        DATE_FORMAT(pay.Date_Created, '%b %Y')        AS Month_Label,
        DATE_FORMAT(pay.Date_Created, '%Y-%m')        AS Month_Key,
        COUNT(*)                                      AS Transactions,
        SUM(pay.Payment_Amount)                       AS Revenue
      FROM payment pay
      LEFT JOIN package pkg  ON pkg.Tracking_Number = pay.Tracking_Number
      LEFT JOIN employee emp ON emp.Employee_ID      = pay.Employee_ID
      ${where}
      GROUP BY
        YEAR(pay.Date_Created),
        MONTH(pay.Date_Created),
        DATE_FORMAT(pay.Date_Created, '%b %Y'),
        DATE_FORMAT(pay.Date_Created, '%Y-%m')
      ORDER BY yr ASC, mo ASC
      LIMIT 12
    ) t
  `

  const quarterlySql = `
    SELECT yr, qtr, Quarter_Label, Transactions, Revenue FROM (
      SELECT
        YEAR(pay.Date_Created)    AS yr,
        QUARTER(pay.Date_Created) AS qtr,
        CONCAT('Q', QUARTER(pay.Date_Created), ' ', YEAR(pay.Date_Created)) AS Quarter_Label,
        COUNT(*)                  AS Transactions,
        SUM(pay.Payment_Amount)   AS Revenue
      FROM payment pay
      LEFT JOIN package pkg  ON pkg.Tracking_Number = pay.Tracking_Number
      LEFT JOIN employee emp ON emp.Employee_ID      = pay.Employee_ID
      ${where}
      GROUP BY
        YEAR(pay.Date_Created),
        QUARTER(pay.Date_Created),
        CONCAT('Q', QUARTER(pay.Date_Created), ' ', YEAR(pay.Date_Created))
      ORDER BY yr ASC, qtr ASC
    ) t
  `

  const byTypeSql = `
    SELECT
      COALESCE(pkg.Package_Type_Code, 'Unknown') AS Package_Type_Code,
      COUNT(*)                                   AS Transactions,
      SUM(pay.Payment_Amount)                    AS Revenue,
      AVG(pay.Payment_Amount)                    AS Avg_Revenue
    FROM payment pay
    LEFT JOIN package pkg  ON pkg.Tracking_Number = pay.Tracking_Number
    LEFT JOIN employee emp ON emp.Employee_ID      = pay.Employee_ID
    ${where}
    GROUP BY pkg.Package_Type_Code
    ORDER BY Revenue DESC
  `

  const byZoneSql = `
    SELECT
      pkg.Zone,
      COUNT(*)                AS Transactions,
      SUM(pay.Payment_Amount) AS Revenue,
      AVG(pay.Payment_Amount) AS Avg_Revenue
    FROM payment pay
    LEFT JOIN package pkg  ON pkg.Tracking_Number = pay.Tracking_Number
    LEFT JOIN employee emp ON emp.Employee_ID      = pay.Employee_ID
    ${where}
    GROUP BY pkg.Zone
    ORDER BY pkg.Zone ASC
  `

  Promise.all([
    pool.query(statsSql,     params),
    pool.query(monthlySql,   params),
    pool.query(quarterlySql, params),
    pool.query(byTypeSql,    params),
    pool.query(byZoneSql,    params),
  ])
    .then(([[statsRows], [monthlyRows], [quarterlyRows], [typeRows], [zoneRows]]) => {
      const last3 = monthlyRows.slice(-3)
      const avg3  = last3.length ? last3.reduce((s, r) => s + Number(r.Revenue || 0), 0) / last3.length : 0
      callback(null, {
        summary:                statsRows[0],
        monthly:                monthlyRows,
        quarterly:              quarterlyRows,
        by_package_type:        typeRows,
        by_zone:                zoneRows,
        projected_next_quarter: Math.round(avg3 * 3 * 100) / 100,
      })
    })
    .catch(err => callback(err, null))
}

// ── OFFICE SATISFACTION: summary table ───────────────────────────────────
function getOfficeSatisfaction(pool, {
  date_from, date_to,
  zone_min, zone_max,
  package_type,
  success_rate_min, success_rate_max,
  packages_min, packages_max,
  delivered_min, delivered_max,
} = {}, callback) {

  const pkgCond = ['1=1']
  const params  = []

  if (date_from)                                       { pkgCond.push('pkg.Date_Created >= ?');      params.push(date_from) }
  if (date_to)                                         { pkgCond.push('pkg.Date_Created <= ?');      params.push(date_to + ' 23:59:59') }
  if (zone_min    != null && zone_min    !== '')        { pkgCond.push('pkg.Zone >= ?');              params.push(Number(zone_min)) }
  if (zone_max    != null && zone_max    !== '')        { pkgCond.push('pkg.Zone <= ?');              params.push(Number(zone_max)) }
  if (package_type)                                    { pkgCond.push('pkg.Package_Type_Code = ?');  params.push(package_type) }

  const pkgWhere = pkgCond.join(' AND ')

  // HAVING filters
  const having = []
  const havingParams = []
  if (success_rate_min != null && success_rate_min !== '') { having.push('Success_Rate >= ?'); havingParams.push(Number(success_rate_min)) }
  if (success_rate_max != null && success_rate_max !== '') { having.push('Success_Rate <= ?'); havingParams.push(Number(success_rate_max)) }
  if (packages_min     != null && packages_min     !== '') { having.push('Total_Packages >= ?'); havingParams.push(Number(packages_min)) }
  if (packages_max     != null && packages_max     !== '') { having.push('Total_Packages <= ?'); havingParams.push(Number(packages_max)) }
  if (delivered_min    != null && delivered_min    !== '') { having.push('Delivered >= ?'); havingParams.push(Number(delivered_min)) }
  if (delivered_max    != null && delivered_max    !== '') { having.push('Delivered <= ?'); havingParams.push(Number(delivered_max)) }

  const havingClause = having.length ? `HAVING ${having.join(' AND ')}` : ''

  const sql = `
    SELECT
      po.Post_Office_ID,
      a.City,
      a.State,
      CONCAT(a.City, ', ', a.State) AS Office_Label,
      COUNT(DISTINCT e.Employee_ID)  AS Total_Employees,
      COUNT(DISTINCT CASE WHEN e.Role_ID = 1 THEN e.Employee_ID END) AS Clerks,
      COUNT(DISTINCT CASE WHEN e.Role_ID = 2 THEN e.Employee_ID END) AS Drivers,
      COUNT(DISTINCT sp.Tracking_Number) AS Total_Packages,
      COUNT(DISTINCT s.Shipment_ID)      AS Total_Shipments,
      COUNT(DISTINCT CASE WHEN sc.Status_Name = 'Delivered' AND sc.Is_Final_Status = 1
                          THEN sp.Tracking_Number END) AS Delivered,
      COUNT(DISTINCT CASE WHEN sc.Status_Name = 'Lost'
                          THEN sp.Tracking_Number END) AS Lost,
      COUNT(DISTINCT CASE WHEN sc.Status_Name = 'Returned'
                          THEN sp.Tracking_Number END) AS Returned,
      ROUND(
        COUNT(DISTINCT CASE WHEN sc.Status_Name = 'Delivered' AND sc.Is_Final_Status = 1
                            THEN sp.Tracking_Number END)
        * 100.0 / NULLIF(COUNT(DISTINCT sp.Tracking_Number), 0),
      1) AS Success_Rate,
      COALESCE(AVG(pay.Payment_Amount), 0) AS Avg_Revenue_Per_Package
    FROM post_office po
    JOIN address a ON a.Address_ID = po.Address_ID
    LEFT JOIN employee e ON e.Post_Office_ID = po.Post_Office_ID
    LEFT JOIN shipment s ON s.Employee_ID = e.Employee_ID
    LEFT JOIN shipment_package sp ON sp.Shipment_ID = s.Shipment_ID
    LEFT JOIN package pkg ON pkg.Tracking_Number = sp.Tracking_Number AND ${pkgWhere}
    LEFT JOIN status_code sc ON sc.Status_Code = pkg.Status_Code
    LEFT JOIN payment pay ON pay.Tracking_Number = pkg.Tracking_Number
    GROUP BY po.Post_Office_ID, a.City, a.State
    ${havingClause}
    ORDER BY Success_Rate DESC
  `

  pool.query(sql, [...params, ...havingParams])
    .then(([results]) => callback(null, results))
    .catch(err => callback(err, null))
}

// ── OFFICE SATISFACTION: quarterly trend per office ───────────────────────
function getOfficeTrend(pool, {
  date_from, date_to,
  zone_min, zone_max,
  package_type,
  office_ids, // comma separated list of Post_Office_IDs
} = {}, callback) {

  const pkgCond = ['1=1']
  const params  = []

  if (date_from)                            { pkgCond.push('pkg.Date_Created >= ?');     params.push(date_from) }
  if (date_to)                              { pkgCond.push('pkg.Date_Created <= ?');     params.push(date_to + ' 23:59:59') }
  if (zone_min  != null && zone_min  !== '') { pkgCond.push('pkg.Zone >= ?');            params.push(Number(zone_min)) }
  if (zone_max  != null && zone_max  !== '') { pkgCond.push('pkg.Zone <= ?');            params.push(Number(zone_max)) }
  if (package_type)                         { pkgCond.push('pkg.Package_Type_Code = ?'); params.push(package_type) }

  // Filter by selected offices
  let officeFilter = ''
  if (office_ids) {
    const ids = String(office_ids).split(',').map(Number).filter(n => !isNaN(n))
    if (ids.length) {
      officeFilter = `AND po.Post_Office_ID IN (${ids.map(() => '?').join(',')})`
      params.push(...ids)
    }
  }

  const pkgWhere = pkgCond.join(' AND ')

  const sql = `
    SELECT t.* FROM (
      SELECT
        po.Post_Office_ID,
        CONCAT(a.City, ', ', a.State)  AS Office_Label,
        YEAR(pkg.Date_Created)          AS yr,
        QUARTER(pkg.Date_Created)       AS qtr,
        CONCAT('Q', QUARTER(pkg.Date_Created), ' ', YEAR(pkg.Date_Created)) AS Quarter_Label,
        COUNT(DISTINCT sp.Tracking_Number) AS Total_Packages,
        COUNT(DISTINCT CASE WHEN sc.Status_Name = 'Delivered' AND sc.Is_Final_Status = 1
                            THEN sp.Tracking_Number END) AS Delivered,
        ROUND(
          COUNT(DISTINCT CASE WHEN sc.Status_Name = 'Delivered' AND sc.Is_Final_Status = 1
                              THEN sp.Tracking_Number END)
          * 100.0 / NULLIF(COUNT(DISTINCT sp.Tracking_Number), 0),
        1) AS Success_Rate
      FROM post_office po
      JOIN address a ON a.Address_ID = po.Address_ID
      LEFT JOIN employee e ON e.Post_Office_ID = po.Post_Office_ID
      LEFT JOIN shipment s ON s.Employee_ID = e.Employee_ID
      LEFT JOIN shipment_package sp ON sp.Shipment_ID = s.Shipment_ID
      LEFT JOIN package pkg ON pkg.Tracking_Number = sp.Tracking_Number AND ${pkgWhere}
      LEFT JOIN status_code sc ON sc.Status_Code = pkg.Status_Code
      WHERE pkg.Tracking_Number IS NOT NULL
      ${officeFilter}
      GROUP BY
        po.Post_Office_ID,
        a.City,
        a.State,
        YEAR(pkg.Date_Created),
        QUARTER(pkg.Date_Created),
        CONCAT('Q', QUARTER(pkg.Date_Created), ' ', YEAR(pkg.Date_Created))
      ORDER BY po.Post_Office_ID, yr ASC, qtr ASC
    ) t
  `

  pool.query(sql, params)
    .then(([results]) => callback(null, results))
    .catch(err => callback(err, null))
}

// ── OFFICE DRILL DOWN: employees at a specific office ────────────────────
function getOfficeEmployees(pool, { post_office_id, date_from, date_to } = {}, callback) {
  if (!post_office_id) return callback(new Error('post_office_id required'), null)

  const params = [Number(post_office_id)]
  const dateCond = []
  if (date_from) { dateCond.push('pkg.Date_Created >= ?'); params.push(date_from) }
  if (date_to)   { dateCond.push('pkg.Date_Created <= ?'); params.push(date_to + ' 23:59:59') }
  const dateWhere = dateCond.length ? `AND ${dateCond.join(' AND ')}` : ''

  const sql = `
    SELECT
      e.Employee_ID,
      CONCAT(e.First_Name, ' ', e.Last_Name) AS Employee_Name,
      e.Email_Address,
      r.Role_Name,
      d.Department_Name,
      COUNT(DISTINCT sp.Tracking_Number) AS Total_Packages,
      COUNT(DISTINCT s.Shipment_ID)      AS Total_Shipments,
      COUNT(DISTINCT CASE WHEN sc.Status_Name = 'Delivered' AND sc.Is_Final_Status = 1
                          THEN sp.Tracking_Number END) AS Delivered,
      ROUND(
        COUNT(DISTINCT CASE WHEN sc.Status_Name = 'Delivered' AND sc.Is_Final_Status = 1
                            THEN sp.Tracking_Number END)
        * 100.0 / NULLIF(COUNT(DISTINCT sp.Tracking_Number), 0),
      1) AS Success_Rate
    FROM employee e
    JOIN role r       ON r.Role_ID       = e.Role_ID
    JOIN department d ON d.Department_ID = e.Department_ID
    LEFT JOIN shipment s          ON s.Employee_ID      = e.Employee_ID
    LEFT JOIN shipment_package sp ON sp.Shipment_ID     = s.Shipment_ID
    LEFT JOIN package pkg         ON pkg.Tracking_Number = sp.Tracking_Number ${dateWhere}
    LEFT JOIN status_code sc      ON sc.Status_Code     = pkg.Status_Code
    WHERE e.Post_Office_ID = ?
    GROUP BY e.Employee_ID, e.First_Name, e.Last_Name, e.Email_Address, r.Role_Name, d.Department_Name
    ORDER BY Success_Rate DESC
  `

  pool.query(sql, params)
    .then(([results]) => callback(null, results))
    .catch(err => callback(err, null))
}

function getOfficeRawData(pool, {
  page = 1, limit = 20,
  date_from, date_to,
  zone_min, zone_max,
  package_type,
} = {}, callback) {

  const offset = (Number(page) - 1) * Number(limit)
  const cond = ['1=1']
  const params = []

  if (date_from)                             { cond.push('pkg.Date_Created >= ?');     params.push(date_from) }
  if (date_to)                               { cond.push('pkg.Date_Created <= ?');     params.push(date_to + ' 23:59:59') }
  if (zone_min != null && zone_min !== '')   { cond.push('pkg.Zone >= ?');             params.push(Number(zone_min)) }
  if (zone_max != null && zone_max !== '')   { cond.push('pkg.Zone <= ?');             params.push(Number(zone_max)) }
  if (package_type)                          { cond.push('pkg.Package_Type_Code = ?'); params.push(package_type) }

  const where = `WHERE ${cond.join(' AND ')}`

  const countSql = `
    SELECT COUNT(DISTINCT pkg.Tracking_Number) AS total
    FROM package pkg
    LEFT JOIN shipment_package sp ON sp.Tracking_Number = pkg.Tracking_Number
    LEFT JOIN shipment s          ON s.Shipment_ID      = sp.Shipment_ID
    LEFT JOIN employee e          ON e.Employee_ID      = s.Employee_ID
    LEFT JOIN post_office po      ON po.Post_Office_ID  = e.Post_Office_ID
    LEFT JOIN address a           ON a.Address_ID       = po.Address_ID
    LEFT JOIN status_code sc      ON sc.Status_Code     = pkg.Status_Code
    ${where}
  `

  const dataSql = `
    SELECT
      pkg.Tracking_Number,
      pkg.Package_Type_Code,
      pkg.Weight,
      pkg.Zone,
      pkg.Date_Created,
      sc.Status_Name,
      sc.Is_Final_Status,
      MAX(CONCAT(e.First_Name, ' ', e.Last_Name)) AS Employee_Name,
      MAX(r.Role_Name)                             AS Role_Name,
      MAX(CONCAT(a.City, ', ', a.State))           AS Office_Location,
      MAX(CONCAT(cs.First_Name, ' ', cs.Last_Name)) AS Sender_Name,
      MAX(CONCAT(cr.First_Name, ' ', cr.Last_Name)) AS Recipient_Name,
      MIN(s.Departure_Time_Stamp)                  AS Departure_Time_Stamp,
      MAX(s.Arrival_Time_Stamp)                    AS Arrival_Time_Stamp
    FROM package pkg
    LEFT JOIN shipment_package sp ON sp.Tracking_Number = pkg.Tracking_Number
    LEFT JOIN shipment s          ON s.Shipment_ID      = sp.Shipment_ID
    LEFT JOIN employee e          ON e.Employee_ID      = s.Employee_ID
    LEFT JOIN role r              ON r.Role_ID          = e.Role_ID
    LEFT JOIN post_office po      ON po.Post_Office_ID  = e.Post_Office_ID
    LEFT JOIN address a           ON a.Address_ID       = po.Address_ID
    LEFT JOIN status_code sc      ON sc.Status_Code     = pkg.Status_Code
    LEFT JOIN customer cs         ON cs.Customer_ID     = pkg.Sender_ID
    LEFT JOIN customer cr         ON cr.Customer_ID     = pkg.Recipient_ID
    ${where}
    GROUP BY
      pkg.Tracking_Number,
      pkg.Package_Type_Code,
      pkg.Weight,
      pkg.Zone,
      pkg.Date_Created,
      sc.Status_Name,
      sc.Is_Final_Status
    ORDER BY pkg.Date_Created DESC
    LIMIT ? OFFSET ?
  `

  Promise.all([
    pool.query(countSql, params),
    pool.query(dataSql, [...params, Number(limit), offset]),
  ])
    .then(([[countRows], [dataRows]]) => callback(null, {
      data:       dataRows,
      total:      countRows[0].total,
      page:       Number(page),
      limit:      Number(limit),
      totalPages: Math.ceil(countRows[0].total / Number(limit)),
    }))
    .catch(err => callback(err, null))
}

module.exports = {
  getPostOffices,
  getDepartments,
  getRevenueData,
  getRevenueStats,
  getOfficeSatisfaction,
  getOfficeTrend,
  getOfficeEmployees,
  getOfficeRawData,
}