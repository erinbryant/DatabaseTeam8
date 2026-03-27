import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../components/Auth.css';
 
const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone_number: '',
    house_number: '',
    street: '',
    city: '',
    state: '',
    zip_first3: '',
    zip_last2: '',
    birth_day: '',
    birth_month: '',
    birth_year: '',
    sex: '',
  });
 
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      const response = await fetch('http://localhost:5000/api/customer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name:   formData.first_name,
          last_name:    formData.last_name,
          email:        formData.email,
          password:     formData.password,
          phone_number: formData.phone_number,
          house_number: formData.house_number,
          street:       formData.street,
          city:         formData.city,
          state:        formData.state,
          zip_first3:   formData.zip_first3,
          zip_last2:    formData.zip_last2,
          birth_day:    formData.birth_day,
          birth_month:  formData.birth_month,
          birth_year:   formData.birth_year,
          sex:          formData.sex,
        })
      });
 
      const data = await response.json();
 
      if (!response.ok) {
        setError(data.message || 'Registration failed');
        return;
      }
 
      localStorage.setItem('token', data.token);
      navigate('/customer_home');
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
        <h2>📬 Create A Post Office 8 Account</h2>
        <p className="subtitle">Post Office 8 Registration</p>
 
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
 
          {/* Name */}
          <div className="form-row">
            <div className="form-group">
              <label>First Name *</label>
              <input type="text" name="first_name" value={formData.first_name}
                onChange={handleChange} required placeholder="John" />
            </div>
            <div className="form-group">
              <label>Last Name *</label>
              <input type="text" name="last_name" value={formData.last_name}
                onChange={handleChange} required placeholder="Doe" />
            </div>
          </div>
 
          {/* Email + Phone */}
          <div className="form-row">
            <div className="form-group">
              <label>Email *</label>
              <input type="email" name="email" value={formData.email}
                onChange={handleChange} required placeholder="john@example.com" />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" name="phone_number" value={formData.phone_number}
                onChange={handleChange} placeholder="713-555-0101" />
            </div>
          </div>
 
          {/* Address */}
          <div className="form-row">
            <div className="form-group">
              <label>House Number *</label>
              <input type="text" name="house_number" value={formData.house_number}
                onChange={handleChange} required placeholder="123" />
            </div>
            <div className="form-group">
              <label>Street *</label>
              <input type="text" name="street" value={formData.street}
                onChange={handleChange} required placeholder="Main St" />
            </div>
          </div>
 
          <div className="form-row">
            <div className="form-group">
              <label>City *</label>
              <input type="text" name="city" value={formData.city}
                onChange={handleChange} required placeholder="Houston" />
            </div>
            <div className="form-group">
              <label>State *</label>
              <input type="text" name="state" value={formData.state}
                onChange={handleChange} required placeholder="TX" maxLength={2} />
            </div>
          </div>
 
          <div className="form-row">
            <div className="form-group">
              <label>Zip (First 3) *</label>
              <input type="text" name="zip_first3" value={formData.zip_first3}
                onChange={handleChange} required placeholder="770" maxLength={3} />
            </div>
            <div className="form-group">
              <label>Zip (Last 2) *</label>
              <input type="text" name="zip_last2" value={formData.zip_last2}
                onChange={handleChange} required placeholder="01" maxLength={2} />
            </div>
          </div>
 
          {/* Password */}
          <div className="form-row">
            <div className="form-group">
              <label>Password *</label>
              <input type="password" name="password" value={formData.password}
                onChange={handleChange} required placeholder="Enter a strong password" />
            </div>
            <div className="form-group">
              <label>Confirm Password *</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword}
                onChange={handleChange} required placeholder="Confirm your password" />
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
 