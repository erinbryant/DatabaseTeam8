import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminRegister from '../pages/AdminRegister';
import '../components/Auth.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('register');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  // Check if user is admin/manager
  const isManager = user.Role_Name === 'Manager' || user.Role_Name === 'Director';

  if (!token || !isManager) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>You must be logged in as a Manager or Director to access this page.</p>
        <button onClick={() => navigate('/login')}>Go to Login</button>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#2c3e50', color: 'white', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>📬 Manager Dashboard</h1>
          <div>
            <span>Welcome, {user.First_Name}!</span>
            <button 
              onClick={handleLogout}
              style={{ marginLeft: '20px', padding: '8px 16px', backgroundColor: '#e74c3c', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '4px' }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ maxWidth: '1200px', margin: '20px auto', display: 'flex', gap: '10px', borderBottom: '2px solid #ddd' }}>
        <button
          onClick={() => setActiveTab('register')}
          style={{
            padding: '12px 24px',
            backgroundColor: activeTab === 'register' ? '#3498db' : '#ecf0f1',
            color: activeTab === 'register' ? 'white' : '#2c3e50',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            borderRadius: '4px 4px 0 0'
          }}
        >
          Register New Employee
        </button>
        <button
          onClick={() => setActiveTab('employees')}
          style={{
            padding: '12px 24px',
            backgroundColor: activeTab === 'employees' ? '#3498db' : '#ecf0f1',
            color: activeTab === 'employees' ? 'white' : '#2c3e50',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            borderRadius: '4px 4px 0 0'
          }}
        >
          View Employees
        </button>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '20px auto' }}>
        {activeTab === 'register' && <AdminRegister />}
        {activeTab === 'employees' && <EmployeesList token={token} />}
      </div>
    </div>
  );
};

// Simple employees list component
const EmployeesList = ({ token }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      // You'll need to create this endpoint
      const response = await fetch('http://localhost:5000/api/employees', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setEmployees(data.employees || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
      <thead style={{ backgroundColor: '#34495e', color: 'white' }}>
        <tr>
          <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
          <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
          <th style={{ padding: '12px', textAlign: 'left' }}>Department</th>
          <th style={{ padding: '12px', textAlign: 'left' }}>Position</th>
        </tr>
      </thead>
      <tbody>
        {employees.map(emp => (
          <tr key={emp.Employee_ID} style={{ borderBottom: '1px solid #ddd' }}>
            <td style={{ padding: '12px' }}>{emp.First_Name} {emp.Last_Name}</td>
            <td style={{ padding: '12px' }}>{emp.Email_Address}</td>
            <td style={{ padding: '12px' }}>{emp.Department_Name}</td>
            <td style={{ padding: '12px' }}>{emp.Role_Name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AdminDashboard;
