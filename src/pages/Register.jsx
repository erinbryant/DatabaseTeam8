import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './css/home.css'
import '../components/Auth.css'
import {
  validateAll,
  validateName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validatePhone,
  validateAptNumber,
  validateHouseNumber,
  validateStreet,
  validateCity,
  validateState,
  validateZip3,
  validateZip2,
  validateRequired,
} from '../Validation'

// In dev, prefer same-origin `/api` so Vite's proxy can reach the backend without CORS surprises.
const envApi = import.meta.env.VITE_API_URL
const API_BASE =
  envApi != null && String(envApi).trim() !== ''
    ? String(envApi).replace(/\/$/, '')
    : import.meta.env.DEV
      ? ''
      : 'http://localhost:5000'

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

    const validationError = validateAll([
      [formData.first_name, validateName, 'First name'],
      [formData.middle_name, (v) => (!v ? null : validateName(v, 'Middle name'))],
      [formData.last_name, validateName, 'Last name'],
      [formData.email, validateEmail],
      [formData.phone_number, validatePhone],
      [formData.apt_number, validateAptNumber],
      [formData.house_number, validateHouseNumber],
      [formData.street, validateStreet],
      [formData.city, validateCity],
      [formData.state, validateState],
      [formData.zip_first3, validateZip3],
      [formData.zip_last2, validateZip2],
      [formData.country, validateRequired, 'Country'],
      [formData.password, validatePassword],
      [formData.password, validateConfirmPassword, formData.confirmPassword],
    ])

    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      const url = `${API_BASE}/api/customer/register`
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
        const errorMsg =
          data.message || `Registration failed (status ${response.status})`
        setError(errorMsg)
        console.error('Registration failed', { status: response.status, body: data })
        return
      }

      // If your backend returns a token on registration, store it (same as before)
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
        <div className="register-card register-card-wide login-card--branded">
          <h2>Create an account</h2>
          <p className="subtitle">
            Customer registration — all fields marked * are required.
          </p>

          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}

            <h3 className="register-section-heading">Your name</h3>
            <div className="form-row form-row--3">
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

            <h3 className="register-section-heading">Contact</h3>
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

            <h3 className="register-section-heading">Address</h3>
            <div className="form-row form-row--3">
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

            <div className="form-row form-row--3">
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

            <div className="form-group">
              <label>Sex *</label>
              <select
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                required
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
                <option value="U">Prefer not to say</option>
              </select>
            </div>

            <h3 className="register-section-heading">Password</h3>
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

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="register-footer-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register