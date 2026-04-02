import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './css/home.css'
import '../components/Auth.css'

const API_BASE = import.meta.env.VITE_API_URL || ''

/** User-friendly message when fetch returns !ok (502 = proxy cannot reach backend). */
function getRegistrationErrorMessage(status, data) {
  if (data && typeof data.message === 'string' && data.message.trim()) {
    return data.message
  }
  if (status === 502 || status === 503) {
    return (
      'Cannot reach the API server (502). Start the backend: open a terminal in the project, run "cd backend" then "npm start" ' +
      '(server must listen on the same port as Vite’s proxy, usually 5000), then try again.'
    )
  }
  if (status === 504) {
    return 'The registration request timed out. Try again or check that the backend is running.'
  }
  return `Registration failed (status ${status})`
}

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone_number: '',
    apt_number: '',
    house_number: '',
    street: '',
    city: '',
    state: '',
    zip_first3: '',
    zip_last2: '',
    zip_plus4: '',
    country: 'USA',
    birth_day: '',
    birth_month: '',
    birth_year: '',
    sex: 'U',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const url = `${API_BASE}/api/customer/register`
      console.log('Fetching:', url)
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: formData.first_name,
          middle_name: formData.middle_name || null,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
          phone_number: formData.phone_number || null,
          apt_number: formData.apt_number || null,
          house_number: formData.house_number,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zip_first3: formData.zip_first3,
          zip_last2: formData.zip_last2,
          zip_plus4: formData.zip_plus4 || null,
          country: formData.country || 'USA',
          birth_day: formData.birth_day,
          birth_month: formData.birth_month,
          birth_year: formData.birth_year,
          sex: formData.sex,
        }),
      })

      let data = {}
      const text = await response.text()
      if (text) {
        try {
          data = JSON.parse(text)
        } catch {
          data = { message: text }
        }
      }

      if (!response.ok) {
        setError(getRegistrationErrorMessage(response.status, data))
        console.error('Registration failed', { status: response.status, body: data })
        return
      }

      if (data.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('userType', 'customer')
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user))
      }
      navigate('/customer_home')
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('Register error:', err)
    } finally {
      setLoading(false)
    }
  }

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
        <div className="login-card login-card--branded register-card-wide">
        <h2>Create an account</h2>
        
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label>First name *</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                placeholder="John"
              />
            </div>
            <div className="form-group">
              <label>Middle name</label>
              <input
                type="text"
                name="middle_name"
                value={formData.middle_name}
                onChange={handleChange}
                placeholder="Optional"
              />
            </div>
            <div className="form-group">
              <label>Last name *</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="john@example.com"
              />
            </div>
            <div className="form-group">
              <label>Phone number</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="713-555-0101"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Apt / unit</label>
              <input
                type="text"
                name="apt_number"
                value={formData.apt_number}
                onChange={handleChange}
                placeholder="Optional"
              />
            </div>
            <div className="form-group">
              <label>House number *</label>
              <input
                type="text"
                name="house_number"
                value={formData.house_number}
                onChange={handleChange}
                required
                placeholder="123"
              />
            </div>
            <div className="form-group">
              <label>Street *</label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                required
                placeholder="Main St"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                placeholder="Houston"
              />
            </div>
            <div className="form-group">
              <label>State *</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                placeholder="TX"
                maxLength={50}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>ZIP (first 3) *</label>
              <input
                type="text"
                name="zip_first3"
                value={formData.zip_first3}
                onChange={handleChange}
                required
                placeholder="770"
                maxLength={3}
                inputMode="numeric"
              />
            </div>
            <div className="form-group">
              <label>ZIP (last 2) *</label>
              <input
                type="text"
                name="zip_last2"
                value={formData.zip_last2}
                onChange={handleChange}
                required
                placeholder="01"
                maxLength={2}
                inputMode="numeric"
              />
            </div>
            <div className="form-group">
              <label>ZIP +4</label>
              <input
                type="text"
                name="zip_plus4"
                value={formData.zip_plus4}
                onChange={handleChange}
                placeholder="Optional"
                maxLength={4}
                inputMode="numeric"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Country *</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                placeholder="USA"
                maxLength={50}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Birth day *</label>
              <input
                type="number"
                name="birth_day"
                value={formData.birth_day}
                onChange={handleChange}
                required
                min={1}
                max={31}
                placeholder="15"
              />
            </div>
            <div className="form-group">
              <label>Birth month *</label>
              <input
                type="number"
                name="birth_month"
                value={formData.birth_month}
                onChange={handleChange}
                required
                min={1}
                max={12}
                placeholder="6"
              />
            </div>
            <div className="form-group">
              <label>Birth year *</label>
              <input
                type="number"
                name="birth_year"
                value={formData.birth_year}
                onChange={handleChange}
                required
                min={1900}
                max={new Date().getFullYear()}
                placeholder="1995"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Sex *</label>
              <select name="sex" value={formData.sex} onChange={handleChange} required>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
                <option value="U">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="At least 6 characters"
              />
            </div>
            <div className="form-group">
              <label>Confirm password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="login-link register-footer-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
        </div>
      </div>
    </div>
  )
}

export default Register
