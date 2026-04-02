import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './css/home.css'
import '../components/Auth.css'

const API_BASE = import.meta.env.VITE_API_URL || ''

const Login = () => {
  const [userType, setUserType] = useState(null); // 'employee' or 'customer'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  if (token) {
    navigate(userType === 'employee' ? '/employee_home' : '/customer_home');
  }
}, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // const endpoint = userType === 'employee' 
      //   ? `${import.meta.env.VITE_API_URL}/api/auth/login`
      //   : `${import.meta.env.VITE_API_URL}/api/auth/customer-login`;
      const endpoint =
        userType === 'employee'
          ? `${API_BASE}/api/auth/login`
          : `${API_BASE}/api/auth/customer-login`

      const payload = userType === 'employee'
        ? { email, password }
        : { email, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      // Store token
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('userType', userType);

      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('email', email);
      }

      navigate(userType === 'employee' ? '/employee_home' : '/customer_home');
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetMessage('');

    try {
      // const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
      const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });

      const data = await response.json();

      if (!response.ok) {
        setResetMessage(data.message || 'Failed to send reset email');
        return;
      }

      setResetMessage('Password reset email sent! Check your inbox.');
      setResetEmail('');
      setTimeout(() => setShowForgotPassword(false), 2000);
    } catch (err) {
      setResetMessage('An error occurred. Please try again.');
      console.error('Forgot password error:', err);
    }
  };

  const resetForm = () => {
    setUserType(null);
    setEmail('');
    setPassword('');
    setError('');
    setShowForgotPassword(false);
  };

  return (
    <div className="login-page">
      <header className="site-header">
        <div className="header-inner">
          <Link className="logo" to="/">
            National Postal Service
          </Link>
          <nav className="top-nav">
            <button
              type="button"
              className="nav-back-btn"
              onClick={() => navigate('/')}
            >
              ← Back
            </button>
          </nav>
        </div>
      </header>

      <div className="login-page-body">
        <div className="login-card login-card--branded">
        <h2>Sign in</h2>
        
        {!userType ? (
          // User Type Selection
          <div className="user-type-selection">
            <p className="user-type-prompt">Are you an Employee or Customer?</p>
            <div className="button-group">
              <button
                type="button"
                className="user-type-btn employee-btn"
                onClick={() => setUserType('employee')}
              >
                👔 Employee
              </button>
              <button
                type="button"
                className="user-type-btn customer-btn"
                onClick={() => setUserType('customer')}
              >
                👤 Customer
              </button>
            </div>
          </div>
        ) : !showForgotPassword ? (
          // Login Form
          <>
            <form onSubmit={handleSubmit}>
              {error && <div className="error-message">{error}</div>}

              <button
                type="button"
                className="back-button-top"
                onClick={resetForm}
              >
                ← Back
              </button>

              <h3>{userType === 'employee' ? 'Employee Login' : 'Customer Login'}</h3>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
              </div>

              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="rememberMe">Remember me</label>
              </div>

              <button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="login-footer">
              <button
                type="button"
                className="forgot-password-link"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot Password?
              </button>
              {userType === 'customer' && (
                <p className="signup-link">
                  Don't have an account? <Link to="/register">Sign up</Link>
                </p>
              )}
            </div>
          </>
        ) : (
          // Forgot Password Form
          <>
            <form onSubmit={handleForgotPassword}>
              <button
                type="button"
                className="back-button-top"
                onClick={() => setShowForgotPassword(false)}
              >
                ← Back
              </button>
              <h3>Reset Password</h3>
              {resetMessage && (
                <div className={resetMessage.includes('sent') ? 'success-message' : 'error-message'}>
                  {resetMessage}
                </div>
              )}
              <div className="form-group">
                <label htmlFor="resetEmail">Enter your email</label>
                <input
                  type="email"
                  id="resetEmail"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>
              <button type="submit">Send Reset Email</button>
            </form>
          </>
        )}
        </div>
      </div>
    </div>
  )
}

export default Login;
