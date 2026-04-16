//want employee First and Last name, id, and Role, 
// from support ticket sum up every support ticket resolved by employee, and support tickets still unresolved by employee
// from payment sum up total tickets completed, and total price sold out

async function getEmployeesRatios(pool){
   // console.log("getEmployeesRatios called");
    const employeeQ =
        `SELECT
            CONCAT(
            e.First_Name, ' ',
            IF(e.Middle_Name IS NOT NULL, CONCAT(e.Middle_Name, ' '), ''),
            e.Last_Name) AS E_Full_Name,      
            e.Employee_ID,
            r.Role_Name,
            d.Department_Name,
            e.Hours_Worked,
            CONCAT(
             m.First_Name, ' ',
            IF(m.Middle_Name IS NOT NULL, CONCAT(m.Middle_Name, ' '), ''),
            m.Last_Name) AS M_Full_Name


        From employee e
        LEFT JOIN employee m ON m.Employee_ID = e.Supervisor_ID
        JOIN role r ON r.Role_ID = e.Role_ID
        JOIN department d ON d.Department_ID = e.Department_ID
        WHERE r.Role_ID != 2
        `;

        const ticketQ =
        `SELECT
            s.Ticket_Status_Code,
            COUNT(*) AS Ticket_Count
         FROM support_ticket s
        WHERE s.Assigned_Employee_ID = ?
        GROUP BY s.Ticket_Status_Code`;
        const [employeeResults] = await pool.query(employeeQ);
    
        const ans = await Promise.all(employeeResults.map(async (emp) => {
            const [ticketResults] = await pool.query(ticketQ, [emp.Employee_ID]);
            //  console.log(`Employee ${emp.Employee_ID} tickets:`, ticketResults);
            const ticketCounts = ticketResults.reduce((acc, row) => {
                acc[row.Ticket_Status_Code] = row.Ticket_Count;
                    return acc;
            }, {});
            return { ...emp, Ticket_Counts: ticketCounts };  
        }));

    return ans;
}

async function getTicketsByEmployee(pool,employeeId){
    // console.log("get Tickets by employee called");
    const [results] = await pool.query(
        `SELECT
        s.Ticket_ID,
        s.User_ID,
        s.Package_ID,
        t.Name,
        s.Issue_Type,
        
        s.Date_Created,
        s.Date_Updated,
        s.Ticket_Status_Code,
        If(s.Resolution_Note IS NOT NULL, s.Resolution_Note, '') AS Resolution_Note
        

        FROM support_ticket s
        JOIN ticket_issue_type t ON t.Type_Id = s.Issue_Type
        WHERE s.Assigned_Employee_Id = ?
        ORDER BY s.Date_Created DESC`,
        [employeeId]
        
    );
    return results;
}

async function getNetAverage(pool) {
  const [results] = await pool.query(`
    SELECT
      SUM(s.Ticket_Status_Code = 2)
        / NULLIF(COUNT(DISTINCT WEEK(COALESCE(s.Date_Updated, s.Date_Created))), 0)
        AS complete,

      SUM(s.Ticket_Status_Code IN (0, 1))
        / NULLIF(COUNT(DISTINCT WEEK(COALESCE(s.Date_Updated, s.Date_Created))), 0)
        AS incomplete
    FROM support_ticket s;
  `);

  return results;
}

async function getWeeklyStatus(pool) {
  const [results] = await pool.query(`
    SELECT
      week,
      SUM(status = 2) AS Resolved_Sum,
      SUM(status = 1) AS Pending_Sum,
      SUM(status = 0) AS Unresolved_Sum
    FROM (
      SELECT
        YEARWEEK(COALESCE(
          CASE WHEN Ticket_Status_Code = 0 THEN Date_Created ELSE Date_Updated END
        )) AS week,
        Ticket_Status_Code AS status
      FROM support_ticket
    ) s
    GROUP BY week
    ORDER BY week;
  `);

  return results;
}

async function netTicketsWeek(pool) {
  const [results] = await pool.query(`
    SELECT
      SUM(Ticket_Status_Code = 2) AS complete,
      SUM(Ticket_Status_Code IN (0, 1)) AS incomplete
    FROM support_ticket
    WHERE WEEK(COALESCE(
      CASE WHEN Ticket_Status_Code = 0 THEN Date_Created ELSE Date_Updated END
    )) = WEEK(CURDATE());
  `);

  return results;
}

async function ticketByIssue(pool) {
  const [results] = await pool.query(`
    SELECT
      t.Name,
      COUNT(*) AS total
    FROM support_ticket s
    JOIN ticket_issue_type t ON t.Type_ID = s.Issue_Type
    WHERE s.Date_Created >= CURDATE() - INTERVAL 30 DAY
    GROUP BY t.Name;
  `);

  const formatted = results.reduce((acc, row) => {
    acc[row.Name] = row.total;
    return acc;
  }, {});

  return formatted;
}

async function employeeByTickets(pool) {
  const [results] = await pool.query(`
    SELECT
      e.Employee_ID,
      COUNT(s.Assigned_Employee_ID) AS ticket_count
    FROM employee e
    LEFT JOIN support_ticket s 
      ON s.Assigned_Employee_ID = e.Employee_ID
    WHERE e.Role_ID != 2
    GROUP BY e.Employee_ID
    ORDER BY ticket_count ASC
    LIMIT 1;
  `);

  return results;
}

// async function getNetAverage(pool){
//     const[results] = await pool.query(
//         `SELECT
//             SUM(IF(s.Ticket_Status_Code = 2, 1, 0))/ COUNT(DISTINCT WEEK(s.Date_Updated)) as complete,
//             SUM(IF(s.Ticket_Status_Code = 0 OR s.Ticket_Status_Code = 1, 1, 0))/COUNT(DISTINCT WEEK(s.Date_Updated)) AS incomplete
//         FROM support_ticket s;
//             `
//     )
//     return results;
// }
// async function getWeeklyStatus(pool){
//     const [results] = await pool.query(
//         `SELECT
//             YEARWEEK(CASE 
//                 WHEN s.Ticket_Status_Code = 0 THEN s.Date_Created
//                 ELSE s.Date_Updated
//                 END) AS week,
//             SUM(IF(s.Ticket_Status_Code = 2, 1, 0)) as Resolved_Sum,
//             SUM(IF(s.Ticket_Status_Code = 1, 1, 0)) as Pending_Sum,
//             SUM(IF(s.Ticket_Status_Code = 0, 1, 0)) as Unresolved_Sum
//         FROM support_ticket s
//         GROUP BY(YEARWEEK(CASE 
//                 WHEN s.Ticket_Status_Code = 0 THEN s.Date_Created
//                 ELSE s.Date_Updated
//                 END))
//         ORDER BY(YEARWEEK(CASE 
//                 WHEN s.Ticket_Status_Code = 0 THEN s.Date_Created
//                 ELSE s.Date_Updated
//                 END));
//         `
//     )
//     return results;
//  }

//  async function netTicketsWeek(pool){
//     const[results] = await pool.query(
//         `SELECT
//             SUM(IF(s.Ticket_Status_Code = 2, 1, 0)) as complete,
//             SUM(IF(s.Ticket_Status_Code IN (0, 1), 1, 0)) AS incomplete
//         FROM support_ticket s
//         WHERE 
//             WEEK(
//                 CASE 
//                     WHEN s.Ticket_Status_Code = 0 THEN s.Date_Created
//                     ELSE s.Date_Updated
//                 END
//             ) = WEEK(CURDATE()); 
//         `
//     )
//     return results;
//  }

//  async function ticketByIssue(pool) {
//   const [results] = await pool.query(`
//     SELECT
//       t.Name,
//       COUNT(*) AS total
//     FROM support_ticket s
//     JOIN ticket_issue_type t ON t.Type_ID = s.Issue_Type
//     WHERE s.Date_Created >= CURDATE() - INTERVAL 30 DAY
//     GROUP BY t.Name;
//   `);
//   const formatted = [
//     results.reduce((acc, row) => {
//       acc[row.Name] = row.total;
//       return acc;
//     }, {})
//   ];

//   return formatted;
// }

// async function employeeByTickets(pool) {
//   const [results] = await pool.query(`
//     SELECT
//     e.Employee_ID,
//     COUNT(s.Assigned_Employee_ID) AS ticket_count
//     FROM employee e
//     LEFT JOIN support_ticket s ON s.Assigned_Employee_ID = e.Employee_ID
//     WHERE e.Role_ID !=2
//     GROUP BY e.Employee_ID 
//     ORDER BY ticket_count ASC
//     LIMIT 1;
//   `);
// //   console.log
//   return results
// }

async function getTicketsReportTable(pool, { search, dateFrom, dateTo, status, issueType, page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit
  let sql = `
    SELECT
      s.Ticket_ID,
      s.User_ID,
      s.Package_ID,
      CONCAT(e.First_Name, ' ',
        IF(e.Middle_Name IS NOT NULL, CONCAT(e.Middle_Name, ' '), ''),
        e.Last_Name) AS Employee_Name,
      t.Name AS Issue_Type_Name,
      s.Ticket_Status_Code,
      s.Date_Created,
      s.Date_Updated,
      IF(s.Resolution_Note IS NOT NULL, s.Resolution_Note, '') AS Resolution_Note
    FROM support_ticket s
    LEFT JOIN employee e ON e.Employee_ID = s.Assigned_Employee_ID
    JOIN ticket_issue_type t ON t.Type_ID = s.Issue_Type
    WHERE 1=1`
  const params = []
  if (search) {
    sql += ` AND (CAST(s.Ticket_ID AS CHAR) LIKE ? OR e.First_Name LIKE ? OR e.Last_Name LIKE ?)`
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }
  if (dateFrom) { sql += ` AND s.Date_Created >= ?`; params.push(dateFrom) }
  if (dateTo)   { sql += ` AND s.Date_Created <= ?`; params.push(dateTo) }
  if (status !== undefined && status !== '') { sql += ` AND s.Ticket_Status_Code = ?`; params.push(Number(status)) }
  if (issueType) { sql += ` AND t.Name = ?`; params.push(issueType) }

  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM (${sql}) sub`, params)
  sql += ` ORDER BY s.Date_Created DESC LIMIT ? OFFSET ?`
  const [rows] = await pool.query(sql, [...params, limit, offset])
  return { data: rows, total, page, totalPages: Math.ceil(total / limit) }
}

async function getTicketsReportStats(pool, { search, dateFrom, dateTo, status, issueType } = {}) {
  const joinClause = `FROM support_ticket s LEFT JOIN employee e ON e.Employee_ID = s.Assigned_Employee_ID JOIN ticket_issue_type t ON t.Type_ID = s.Issue_Type`
  let where = `WHERE 1=1`
  const params = []
  if (search) {
    where += ` AND (CAST(s.Ticket_ID AS CHAR) LIKE ? OR e.First_Name LIKE ? OR e.Last_Name LIKE ?)`
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }
  if (dateFrom) { where += ` AND s.Date_Created >= ?`; params.push(dateFrom) }
  if (dateTo)   { where += ` AND s.Date_Created <= ?`; params.push(dateTo) }
  if (status !== undefined && status !== '') { where += ` AND s.Ticket_Status_Code = ?`; params.push(Number(status)) }
  if (issueType) { where += ` AND t.Name = ?`; params.push(issueType) }

  const [[summary]] = await pool.query(`
    SELECT
      COUNT(*) AS Total_Tickets,
      SUM(s.Ticket_Status_Code = 2) AS Resolved,
      SUM(s.Ticket_Status_Code = 1) AS Pending,
      SUM(s.Ticket_Status_Code = 0) AS Open,
      SUM(s.Ticket_Status_Code = 2) / NULLIF(COUNT(DISTINCT WEEK(COALESCE(s.Date_Updated, s.Date_Created))), 0) AS Avg_Resolved_Per_Week
    ${joinClause} ${where}
  `, params)

  const [byIssue] = await pool.query(`
    SELECT t.Name AS Issue_Type, COUNT(*) AS Count
    ${joinClause} ${where}
    GROUP BY t.Name ORDER BY Count DESC
  `, params)

  const [byStatus] = await pool.query(`
    SELECT s.Ticket_Status_Code AS Status_Code, COUNT(*) AS Count
    ${joinClause} ${where}
    GROUP BY s.Ticket_Status_Code ORDER BY s.Ticket_Status_Code
  `, params)

  return { summary, by_issue: byIssue, by_status: byStatus }
}

module.exports = {getEmployeesRatios,getTicketsByEmployee, getNetAverage, getWeeklyStatus,netTicketsWeek,ticketByIssue, employeeByTickets, getTicketsReportTable, getTicketsReportStats}