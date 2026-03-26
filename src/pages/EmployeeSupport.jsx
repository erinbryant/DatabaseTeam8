import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./css/customer_home.css";   // reuse your existing styles
import "./css/EmployeeSupport.css"; // new styles below

export default function EmployeeSupport() {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('http://localhost:5000/api/tickets')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch tickets');
                return res.json();
            })
            .then(data => {
                setTickets(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    return (
        <div className="page-wrapper">
            <header className="navbar">
                <h1>National Postal Service</h1>
                <nav className="top-nav">
                    <a onClick={() => navigate('/employee_home')}>Home</a>
                    <a onClick={() => navigate('/employee/support')}>Support Tickets</a>
                    <a onClick={() => navigate('/')}>Logout</a>
                </nav>
            </header>

            <main className="support-main">
                <h2 className="support-title">Support Tickets</h2>

                {loading && <p className="status-msg">Loading tickets...</p>}
                {error   && <p className="status-msg error">Error: {error}</p>}

                {!loading && !error && tickets.length === 0 && (
                    <p className="status-msg">No tickets found.</p>
                )}

                {!loading && !error && tickets.length > 0 && (
                    <div className="table-wrapper">
                        <table className="ticket-table">
                            <thead>
                                <tr>
                                    <th>Ticket ID</th>
                                    <th>Customer</th>
                                    <th>Tracking #</th>
                                    <th>Assigned Employee</th>
                                    <th>Issue Type</th>
                                    <th>Description</th>
                                    <th>Resolution Note</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.map(ticket => (
                                    <tr key={ticket.Ticket_ID}>
                                        <td>{ticket.Ticket_ID}</td>
                                        <td>{ticket.Customer_First} {ticket.Customer_Last}</td>
                                        <td>{ticket.Tracking_Number}</td>
                                        <td>{ticket.Employee_First} {ticket.Employee_Last}</td>
                                        <td>{ticket.Issue_Type}</td>
                                        <td>{ticket.Description}</td>
                                        <td>{ticket.Resolution_Note || '—'}</td>
                                        <td>
                                            <span className={`badge status-${ticket.Ticket_Status_Code}`}>
                                                {ticket.Ticket_Status_Code === 0 ? 'Open'
                                                : ticket.Ticket_Status_Code === 1 ? 'Pending'
                                                : 'Closed'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            <footer>
                <p>© National Postal Service</p>
            </footer>
        </div>
    );
}