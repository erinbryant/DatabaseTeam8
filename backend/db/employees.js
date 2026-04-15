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

async function getNetAverage(pool){
    const[results] = await pool.query(
        `SELECT
            SUM(IF(s.Ticket_Status_Code = 2, 1, 0))/ COUNT(DISTINCT WEEK(s.Date_Updated)) as complete,
            SUM(IF(s.Ticket_Status_Code = 0 OR s.Ticket_Status_Code = 1, 1, 0))/COUNT(DISTINCT WEEK(s.Date_Updated)) AS incomplete
        FROM support_ticket s;
            `
    )
    return results;
}
async function getWeeklyStatus(pool){
    const [results] = await pool.query(
        `SELECT
            YEARWEEK(CASE 
                WHEN s.Ticket_Status_Code = 0 THEN s.Date_Created
                ELSE s.Date_Updated
                END) AS week,
            SUM(IF(s.Ticket_Status_Code = 2, 1, 0)) as Resolved_Sum,
            SUM(IF(s.Ticket_Status_Code = 1, 1, 0)) as Pending_Sum,
            SUM(IF(s.Ticket_Status_Code = 0, 1, 0)) as Unresolved_Sum
        FROM support_ticket s
        GROUP BY(YEARWEEK(CASE 
                WHEN s.Ticket_Status_Code = 0 THEN s.Date_Created
                ELSE s.Date_Updated
                END))
        ORDER BY(YEARWEEK(CASE 
                WHEN s.Ticket_Status_Code = 0 THEN s.Date_Created
                ELSE s.Date_Updated
                END));
        `
    )
    return results;
 }

 async function netTicketsWeek(pool){
    const[results] = await pool.query(
        `SELECT
            SUM(IF(s.Ticket_Status_Code = 2, 1, 0)) as complete,
            SUM(IF(s.Ticket_Status_Code IN (0, 1), 1, 0)) AS incomplete
        FROM support_ticket s
        WHERE 
            WEEK(
                CASE 
                    WHEN s.Ticket_Status_Code = 0 THEN s.Date_Created
                    ELSE s.Date_Updated
                END
            ) = WEEK(CURDATE()); 
        `
    )
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
  const formatted = [
    results.reduce((acc, row) => {
      acc[row.Name] = row.total;
      return acc;
    }, {})
  ];

  return formatted;
}

async function employeeByTickets(pool) {
  const [results] = await pool.query(`
    SELECT
    e.Employee_ID,
    COUNT(s.Assigned_Employee_ID) AS ticket_count
    FROM employee e
    LEFT JOIN support_ticket s ON s.Assigned_Employee_ID = e.Employee_ID
    WHERE e.Role_ID !=2
    GROUP BY e.Employee_ID 
    ORDER BY ticket_count ASC
    LIMIT 1;
  `);
//   console.log
  return results
}

module.exports = {getEmployeesRatios,getTicketsByEmployee, getNetAverage, getWeeklyStatus,netTicketsWeek,ticketByIssue, employeeByTickets}