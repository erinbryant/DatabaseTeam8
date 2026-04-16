import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/Auth.css';
import { authFetch } from '../authFetch'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    position: '',
    phoneNumber: '',
    hireDate: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const departments = ['Customer Service', 'Delivery', 'Management'];
  const positions = ['Clerk', 'Driver', 'Admin'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/employee_home');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    setLoading(true);

    try {
      const response = await authFetch(`${API_BASE}/api/auth/admin-register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          department: formData.department,
          position: formData.position,
          phoneNumber: formData.phoneNumber,
          hireDate: formData.hireDate
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Registration failed');
        return;
      }

      setSuccess(`Employee account created successfully! Temporary password sent to ${formData.email}`);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        department: '',
        position: '',
        phoneNumber: '',
        hireDate: ''
      });

      setTimeout(() => navigate('/employee_home'), 2000);
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Admin register error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>👤 Register New Employee</h2>
        <p className="subtitle">Management - Create Employee Account</p>

        <button type="button" onClick={handleBack} className="back-button register-back-button">
          Back
        </button>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="john@postoffice.com"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="hireDate">Birthday *</label>
              <input
                type="date"
                id="hireDate"
                name="hireDate"
                value={formData.hireDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="department">Department *</label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="form-select"
              >
                <option value="">Select department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="position">Position *</label>
              <select
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
                className="form-select"
              >
                <option value="">Select position</option>
                {positions.map((pos) => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number *</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                placeholder="(123) 456-7890"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Creating Account...' : 'Create Employee Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminRegister;
