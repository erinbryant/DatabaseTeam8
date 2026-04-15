import { useState, useEffect } from "react";
//import './css/home.css'
//import './css/employee_home.css'
import "./css/packages.css";
import skyline from "../assets/houston-skyline.jpeg";
import ColumnChart from "../components/column_chart";
import PieChart from "../components/pie_chart";
import React from 'react'
import { authFetch } from '../authFetch'

import { Link, useNavigate } from 'react-router-dom';
//import { netTicketsWeek } from "../../backend/db/employees";
const STATUS_MAP = {
  0: { label: "Open", color: "#dc2626", bg: "#fef2f2" },
  1: { label: "Pending", color: "#d97706", bg: "#fffbeb" },
  2: { label: "Closed", color: "#16a34a", bg: "#f0fdf4" },
};

const statusOptions = [
  { value: 0, label: "Open" },
  { value: 1, label: "Pending" },
  { value: 2, label: "Closed" },
];

function getStatusBadgeClass(status) {
  // const s = (status || '').toLowerCase()
  if (status === 0) return 'open'
  if (status === 1) return 'pending'
  if (status === 2) return 'closed'
  
  return 'status-default'
 }



const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function TicketsReport() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const userType = localStorage.getItem('userType');
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('token'))
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [sortValue, setSortValue] = useState("");
  // const [expanded, setExpanded] = useState(null);
  
  const [openDropdowns, setOpenDropdowns] = useState({});

  const [employeeTickets, setEmployeeTickets] = useState({});
  const[weeklyData, setWeeklyData] = useState([]);
  const[netTickets, setNetTickets] = useState([]);
  const[weekNetTickets, setWeekNetTickets] = useState([]);
  const[byIssue, setByIssue] = useState([]);

  const navigate = useNavigate();




useEffect(() => {
  // console.log("Fetching from:", `${API_BASE}/api/employee/weeklyTickets`)
  authFetch(`${API_BASE}/api/employee/weeklyTickets`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load weekly status");
      return res.json();
    })
    .then((data) => {
      const formatted = data.map(row => {
        const yw = String(row.week); 
        const year = parseInt(yw.slice(0, 4));
        const week = parseInt(yw.slice(4));

        const jan1 = new Date(year, 0, 1);
        const weekStart = new Date(jan1);
        weekStart.setDate(jan1.getDate() + (week - 1) * 7);

        const label = weekStart.toLocaleDateString('en-GB'); 
        return { ...row, week: label };
      });
      setWeeklyData(formatted);
      setLoading(false);
  })
    .catch((err) => {
      setError(err.message);
      setLoading(false);
    });
}, []);

useEffect(() => {
    // console.log("Fetching from:", `${API_BASE}/api/employee/net-tickets`);
    authFetch(`${API_BASE}/api/employee/net-tickets`,{
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((res) => {
        //  console.log("Response status:", res.status, res.ok);
        if (!res.ok) throw new Error("Failed to load employees");
        return res.json();
      })
      .then((data) => {
        // console.log("Data received:", data);
        setNetTickets({
            resolved: data[0]?.complete ?? 'N/A',
            unresolved: data[0]?.incomplete ?? 'N/A'
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

useEffect(() => {
    // console.log("Fetching from:", `${API_BASE}/api/employee/week-net-tickets`);
    authFetch(`${API_BASE}/api/employee/week-net-tickets`,{
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((res) => {
        //  console.log("Response status:", res.status, res.ok);
        if (!res.ok) throw new Error("Failed to load employees");
        return res.json();
      })
      .then((data) => {
        // console.log("Data received:", data);
        setWeekNetTickets({
           resolved: data[0]?.complete ?? 'N/A',
          unresolved: data[0]?.incomplete ?? 'N/A'
        });
        setLoading(false);
      })
      .catch((err) => {
        // console.error("Fetch error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // console.log("Fetching from:", `${API_BASE}/api/employee/tickets-by-issue`);
    authFetch(`${API_BASE}/api/employee/tickets-by-issue`,{
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
        .then((res) => {
        //  console.log("Response status:", res.status, res.ok);
        if (!res.ok) throw new Error("Failed to load employees");
        return res.json();
      })
      .then((data) => {
        // console.log("Data received:", data);
        setByIssue(data);
        setLoading(false);
      })
      .catch((err) => {
        // console.error("Fetch error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);


  useEffect(() => {
    // console.log("Fetching from:", `${API_BASE}/api/employee/tickets_comp`);
    authFetch(`${API_BASE}/api/employee/tickets_comp`,{
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((res) => {
        //  console.log("Response status:", res.status, res.ok);
        if (!res.ok) throw new Error("Failed to load employees");
        return res.json();
      })
      .then((data) => {
        // console.log("Data received:", data);
        setEmployees(data);
        setLoading(false);
      })
      .catch((err) => {
        // console.error("Fetch error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  

  

  // console.log("employees[0]:", JSON.stringify(employees[0]));
  let filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    return (
      (e.E_Full_Name || "").toLowerCase().includes(q) ||
      (e.M_Full_Name ||"").toLowerCase().includes(q) ||
      (e.Department_Name || "").toLowerCase().includes(q) ||
      (e.Role_Name || "").toLowerCase().includes(q)
    );
  });

    const totalResolved = filtered.reduce((sum, emp) => 
    sum + (emp.Ticket_Counts?.['2'] || 0), 0);

    const totalUnresolved = filtered.reduce((sum, emp) => 
    sum + (emp.Ticket_Counts?.['0'] || emp.Ticket_Counts?.['1']|| 0), 0);

    if (sortValue === "employee_name_asc")  filtered = [...filtered].sort((a, b) => a.E_Full_Name.localeCompare(b.E_Full_Name));
    if (sortValue === "employee_name_desc") filtered = [...filtered].sort((a, b) => b.E_Full_Name.localeCompare(a.E_Full_Name));
    if (sortValue === "supervisor_name_asc") { filtered = [...filtered].sort((a, b) => {
        if (!a.M_Full_Name) return 1;   // a is null → goes after b
        if (!b.M_Full_Name) return -1;  // b is null → a comes first
        return a.M_Full_Name.localeCompare(b.M_Full_Name);
        });
    }
    if (sortValue === "supervisor_name_desc"){ filtered = [...filtered].sort((a, b) => {
        if (!a.M_Full_Name) return 1;
        if (!b.M_Full_Name) return -1;
        return b.M_Full_Name.localeCompare(a.M_Full_Name);
        });
    }

    
function toggleDropdown(employeeId, type) {
    setOpenDropdowns(prev => {
        const resolvedKey = `${employeeId}-resolved`;
        const unresolvedKey = `${employeeId}-unresolved`;
        const clickedKey = `${employeeId}-${type}`;
        const isCurrentlyOpen = prev[clickedKey];

        return {
            ...prev,
            [resolvedKey]: false,
            [unresolvedKey]: false,
            [clickedKey]: !isCurrentlyOpen  // toggle the clicked one (close if already open)
        };
    });

   
    if (!employeeTickets[employeeId]) {
        authFetch(`${API_BASE}/api/employee/${employeeId}/tickets`)
            .then(res => res.json())
            .then(data => setEmployeeTickets(prev => ({ ...prev, [employeeId]: data })))
            .catch(() => setEmployeeTickets(prev => ({ ...prev, [employeeId]: [] })));
    }
}

function handleLogout(e) {
    e.preventDefault()
    localStorage.removeItem('token'); localStorage.removeItem('user'); localStorage.removeItem('userType')
    navigate('/')
  }
  
  return (
    <div className={`packages-page ${userType === 'employee' ? 'employee-home' : ''}`}>
      <header className="site-header">
        <div className="header-inner">
          <Link className="logo" to="/"> National Postal Service</Link>
          <nav className="top-nav">
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/employee_home') }}>Employee Home</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/price_calculator') }}>Calculator</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/package_tracking') }}>Track a Package</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/profile') }}>Profile</a>
            <a href="#" onClick={handleLogout}>Logout</a>
          </nav>
            
        </div>
      </header>

      <main>
        {/* <div className="inventory-hero">
          <img src={skyline} alt="" />
        </div> */}


        <div className="page-content">
          <h2>Support Ticket Report</h2>

          {error && (
            <div className="error-banner">
              <span>{error}</span>
              <button onClick={() => setError(null)}>✕</button>
            </div>
          )}

          <div>
            <ColumnChart
            title="Weekly Ticket Status"
            subtitle="Grouped by resolution type"
            xKey="week"
            columns={[
              { key: "Resolved_Sum",   label: "Resolved" },
              { key: "Pending_Sum",    label: "Pending" },
              { key: "Unresolved_Sum", label: "Unresolved" },
            ]}
            data={weeklyData}
          />
          </div>
          <div className="pie-chart-container">
            <div className="pie-chart-box">
              <PieChart
                title="Monthly Tickets By Issue"
                slices={[
                  { key: "failed transaction",   label: "Failed Transaction" },
                  { key: "payment issue",    label: "Payment Issue" },
                  { key: "delivery issue", label: "Delivery Issue" },
                  {key: "other", label: "Other"}
                ]}
                data={byIssue}
              />
            </div>

            {/* Stats box on the right */}
            <div className="pie-chart-stats-box">
              <div className="pie-chart__stat-large">
                <div className="pie-chart__stat-label">Net Average Tickets Resolved per Week (resolved/unresolved)</div>
                <div className="pie-chart__stat-num">{netTickets.resolved}/{netTickets.unresolved}</div>
              </div>
              <div className="pie-chart__stat-large">
                <div className="pie-chart__stat-label">Net This Week (resolved/unresolved)</div>
                <div className="pie-chart__stat-num">{weekNetTickets.resolved}/{weekNetTickets.unresolved}</div>
              </div>
            </div>
          </div>

          

          {!loading && (
            <div className="stats-row">
              <div className="stat-card">
                <span className="stat-num">{filtered.length}</span>
                <span className="stat-label">Employees</span>
              </div>
              <div className="stat-card">
                <span className="stat-num delivered">{totalResolved}</span>
                <span className="stat-label">Resolved Tickets</span>
              </div>
              <div className="stat-card">
                <span className="stat-num pending">{totalUnresolved}</span>
                <span className="stat-label">Unresolved Tickets</span>
              </div>
            </div>
          )}

          <div className="controls-bar">
            <input
              type="text"
              className="search-input"
              placeholder="Search name, department, or role."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="filter-select" value={sortValue} onChange={(e) => setSortValue(e.target.value)}>
              <option value="">Sort: Default</option>
              <option value="employee_name_asc">Name (Employee A → Z)</option>
              <option value="employee_name_desc">Name (Employee Z → A)</option>
               <option value="supervisor_name_asc">Name (Supervisor A → Z)</option>
              <option value="supervisor_name_desc">Name (Supervisor Z → A)</option>

            </select>
            
          </div>

          {loading ? (
            <p className="state-msg">Loading employees...</p>
          ) : filtered.length === 0 ? (
            <p className="state-msg">No employees match your search.</p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Supervisor</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Hours</th>
                    <th>Resolved Tickets</th>
                    <th>Unresolved Tickets</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <React.Fragment key={c.Employee_ID}>
                      <tr key={c.Employee_ID}>
                        <td><code>{c.Employee_ID}</code></td>
                        <td>{c.E_Full_Name}</td>
                        <td>{c.M_Full_Name}</td>
                        <td>{c.Role_Name}</td>
                        <td>{c.Department_Name}</td>
                        <td>{c.Hours_Worked}</td>
                        <td>{c.Ticket_Counts?.['2'] || 0}</td>
                        <td>{(c.Ticket_Counts?.['0'] || 0) + (c.Ticket_Counts?.['1'] || 0)}</td>
                        
                        <td>
                            <div style={{ display: "flex", gap: "6px" }}>
                                <button
                                    className="button"
                                    style={{ padding: "5px 12px", fontSize: "0.8rem", marginTop: 0 }}
                                    onClick={() => toggleDropdown(c.Employee_ID, 'resolved')}
                                    >
                                    {openDropdowns[`${c.Employee_ID}-resolved`] ? "▲ Hide Resolved" : "▼ Show Resolved"}
                                </button>

                                <button
                                    className="button"
                                    style={{ padding: "5px 12px", fontSize: "0.8rem", marginTop: 0 }}
                                    onClick={() => toggleDropdown(c.Employee_ID, 'unresolved')}
                                    >
                                    {openDropdowns[`${c.Employee_ID}-unresolved`] ? "▲ Hide Unresolved" : "▼ Show Unresolved"}
                                </button>
                            </div>
                        </td> 
                      </tr>

                        {(openDropdowns[`${c.Employee_ID}-resolved`] || openDropdowns[`${c.Employee_ID}-unresolved`]) && (
                            <tr key={`${c.Employee_ID}-detail`} className="detail-row">
                            <td colSpan={9}>
      
                            {/* Resolved Tickets Table */}
                            {openDropdowns[`${c.Employee_ID}-resolved`] && (
                               
                                <div style={{ marginBottom: '10px' }}>
                                <strong>Resolved Tickets</strong>
                                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "6px" }}>
                                    <thead>
                                    <tr>
                                    <th>ID</th>
                                    <th>User ID</th>
                                    <th>Package ID</th>
                                    <th>Issue Type</th>
                                    <th>Date Issued</th>
                                    <th>Date Resolved</th>
                                    <th>Status</th>
                                    <th>Resolution Note</th>
                                </tr>
                                </thead>
                                <tbody>
                                {(employeeTickets[c.Employee_ID] || [])
                                    .filter(t => t.Ticket_Status_Code == 2)
                                    .map(t => {
                                     const ticketStatus = STATUS_MAP[t.Ticket_Status_Code] || STATUS_MAP[0];
                                    return(
                                    <tr key={t.Ticket_ID}>
                                        <td><code>{t.Ticket_ID}</code></td>
                                        <td>{t.User_ID || "—"}</td>
                                        <td>{t.Package_ID || "—"}</td>
                                        <td>{t.Name || "—"}</td>
                                        <td>{t.Date_Created ? new Date(t.Date_Created).toLocaleDateString() : "—"}</td>
                                        <td>{t.Date_Updated ? new Date(t.Date_Updated).toLocaleDateString() : "—"}</td>
                                        
                                        <td>
                                          <span className={`status-badge ${getStatusBadgeClass(t.Ticket_Status_Code)}`}>
                                            {ticketStatus.label}
                                          </span>
                                        </td>
                                        <td>{t.Resolution_Note || "—"}</td>
                                        
                                    </tr>
                                    );
                                  })
                                }
                                {!(employeeTickets[c.Employee_ID] || []).some(t => t.Ticket_Status_Code == 2) && (
                                    <tr><td colSpan={7} style={{ textAlign: "center" }}>—</td></tr>
                                )}
                                </tbody>
                            </table>
                            </div>
                        )}

                        {/* Unresolved Tickets Table */}
                        {openDropdowns[`${c.Employee_ID}-unresolved`] && (
                            <div>
                            <strong>Unresolved Tickets</strong>
                            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "6px" }}>
                                <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>User ID</th>
                                    <th>Package ID</th>
                                    <th>Issue Type</th>
                                    <th>Date Issued</th>
                                    <th>Date Updated</th>
                                    <th>Status</th>
                                </tr>
                                </thead>
                                <tbody>
                                {(employeeTickets[c.Employee_ID] || [])
                                    .filter(t => t.Ticket_Status_Code == 0 || t.Ticket_Status_Code == 1)
                                    .map(t => {
                                      const ticketStatus = STATUS_MAP[t.Ticket_Status_Code] || STATUS_MAP[0];
                                        return(
                                    
                                    <tr key={t.Ticket_ID}>
                                        <td><code>{t.Ticket_ID}</code></td>
                                        <td>{t.User_ID || "—"}</td>
                                        <td>{t.Package_ID || "—"}</td>
                                        <td>{t.Name || "—"}</td>
                                        <td>{t.Date_Created ? new Date(t.Date_Created).toLocaleDateString() : "—"}</td>
                                        <td>{t.Date_Updated ? new Date(t.Date_Updated).toLocaleDateString() : "—"}</td>
                                        
                                        <td>
                                          <span className={`status-badge ${getStatusBadgeClass(t.Ticket_Status_Code)}`}>
                                            {ticketStatus.label}
                                          </span>
                                        </td>
                                        
                                    </tr>
                                    );
                                    })
                                }
                                  {!(employeeTickets[c.Employee_ID] || []).some(t => t.Ticket_Status_Code == 0 || t.Ticket_Status_Code == 1) && (
                                    <tr><td colSpan={8} style={{ textAlign: "center" }}>—</td></tr>
                                )}
                                </tbody>
                            </table>
                            </div>
                        )}

                        </td>
                    </tr>
                    )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <span>© {new Date().getFullYear()} National Postal Service</span>
          <span className="footer-links">
          </span>
        </div>
      </footer>
    </div>
  );
}
