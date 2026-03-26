import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../components/Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    employeeId: '',
    department: '',
    position: '',
    phoneNumber: '',
    workAddress: '',
    hireDate: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const departments = ['Mail Sorting', 'Customer Service', 'Delivery', 'Management', 'Finance', 'IT Support'];
  const positions = ['Clerk', 'Supervisor', 'Manager', 'Director', 'Staff'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          employeeId: formData.employeeId,
          department: formData.department,
          position: formData.position,
          phoneNumber: formData.phoneNumber,
          workAddress: formData.workAddress,
          hireDate: formData.hireDate,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Registration failed');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      navigate('/profile');
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Register error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>📬 Create Employee Account</h2>
        <p className="subtitle">Post Office Database Registration</p>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

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
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="employeeId">Employee ID *</label>
              <input
                type="text"
                id="employeeId"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                required
                placeholder="EMP001"
              />
            </div>
            <div className="form-group">
              <label htmlFor="hireDate">Hire Date *</label>
              <input
                type="date"
                id="hireDate"
                name="hireDate"
                value={formData.hireDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
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
          </div>

          <div className="form-row">
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
            <div className="form-group">
              <label htmlFor="workAddress">Work Address *</label>
              <input
                type="text"
                id="workAddress"
                name="workAddress"
                value={formData.workAddress}
                onChange={handleChange}
                required
                placeholder="123 Main St, City, State"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter a strong password"
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="login-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;