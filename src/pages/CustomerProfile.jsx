import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './css/home.css'
import './css/customer_home.css'
import './css/customer_profile.css'
import skyline from '../assets/houston-skyline.jpeg'
import { authFetch } from '../authFetch'

export default function CustomerProfile() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    Email_Address: '',
    Phone_Number: '',
    House_Number: '',
    Street: '',
    City: '',
    State: '',
    Zip_Code: '',
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    authFetch('/api/customer/profile')
      .then(async (r) => {
        const raw = await r.text()
        const ct = r.headers.get('content-type') || ''
        if (!raw || !ct.includes('application/json')) {
          throw new Error(raw || 'Failed to load profile')
        }
        return JSON.parse(raw)
      })
      .then((data) => {
        setUser(data.user)
        setFormData({
          Email_Address: data.user.Email_Address || '',
          Phone_Number: data.user.Phone_Number || '',
          House_Number: data.user.House_Number || '',
          Street: data.user.Street || '',
          City: data.user.City || '',
          State: data.user.State || '',
          Zip_Code: data.user.Zip_Code || '',
        })
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load profile')
        setLoading(false)
      })
  }, [navigate])

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const response = await authFetch('/api/customer/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const raw = await response.text()
      const ct = response.headers.get('content-type') || ''
      let data = {}
      if (raw && ct.includes('application/json')) {
        try {
          data = JSON.parse(raw)
        } catch {
          data = {}
        }
      }

      if (!response.ok) {
        setError(data.message || raw || 'Update failed')
        return
      }

      setUser(data.user)
      setIsEditing(false)
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('An error occurred. Please try again.')
    }
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userType')
    navigate('/')
  }

  const navHeader = (
    <header className="site-header">
      <div className="header-inner">
        <Link className="logo" to="/">National Postal Service</Link>
        <nav className="top-nav">
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/customer_home') }}>Customer Home</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/price_calculator') }}>Calculator</a>
            <span className="nav-current" aria-current="page">Profile</span>
            <a href="#" onClick={handleLogout}>Logout</a>
          </nav>
      </div>
    </header>
  )

  const pageFooter = (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>© {new Date().getFullYear()} National Postal Service</div>
        <div className="footer-links">
          <a href="#">Privacy</a>
          <a href="#">Contact</a>
          <a href="#">Locations</a>
        </div>
      </div>
    </footer>
  )

  if (loading) {
    return (
      <div className="customer-home customer-profile-page">
        {navHeader}
        <main>
          <div className="customer-hero">
            <img src={skyline} alt="" />
          </div>
          <div className="customer-profile-inner customer-profile-loading">
            <p>Loading your profile…</p>
          </div>
        </main>
        {pageFooter}
      </div>
    )
  }

  if (!user) {
    return (
      <div className="customer-home customer-profile-page">
        {navHeader}
        <main>
          <div className="customer-hero">
            <img src={skyline} alt="" />
          </div>
          <div className="customer-profile-inner">
            <div className="customer-profile-card">
              <p className="error-message" style={{ margin: 0 }}>
                {error || 'Could not load profile.'}
              </p>
              <button
                type="button"
                className="btn primary"
                style={{ marginTop: 16 }}
                onClick={() => navigate('/customer_home')}
              >
                Back to dashboard
              </button>
            </div>
          </div>
        </main>
        {pageFooter}
      </div>
    )
  }

  return (
    <div className="customer-home customer-profile-page">
      {navHeader}

      <main>
        <div className="customer-hero">
          <img src={skyline} alt="" />
        </div>

        <div className="customer-profile-inner">
          <div className="customer-profile-card">
            <div className="customer-profile-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div className="customer-profile-avatar">
                  {user.First_Name?.charAt(0)}
                  {user.Last_Name?.charAt(0)}
                </div>
                <div>
                  <h2>Your profile</h2>
                  <p
                    style={{
                      margin: 0,
                      color: 'var(--text-soft, #475569)',
                      fontSize: '0.95rem',
                    }}
                  >
                    {user.First_Name} {user.Last_Name}
                  </p>
                </div>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {!isEditing && (
              <>
                <div className="customer-profile-section">
                  <h3>Contact &amp; address</h3>
                  <div className="customer-profile-grid">
                    <div className="customer-profile-item">
                      <label>Name</label>
                      <p>
                        {user.First_Name} {user.Last_Name}
                      </p>
                    </div>
                    <div className="customer-profile-item">
                      <label>Email</label>
                      <p>{user.Email_Address}</p>
                    </div>
                    <div className="customer-profile-item">
                      <label>Phone</label>
                      <p>{user.Phone_Number || '—'}</p>
                    </div>
                    <div
                      className="customer-profile-item"
                      style={{ gridColumn: '1 / -1' }}
                    >
                      <label>Address</label>
                      <p>
                        {user.House_Number} {user.Street}
                        <br />
                        {user.City}, {user.State} {user.Zip_First3}
                        {user.Zip_Last2}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="customer-profile-actions">
                  <button
                    type="button"
                    className="btn primary"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit profile
                  </button>
                  <button
                    type="button"
                    className="btn primary"
                    onClick={() => navigate('/customer_home')}
                  >
                    Customer Home
                  </button>
                </div>
              </>
            )}

            {isEditing && (
              <form onSubmit={handleUpdateProfile}>
                <h3
                  style={{
                    marginTop: 0,
                    color: 'var(--primary-strong, #1e40af)',
                    fontSize: '1.05rem',
                  }}
                >
                  Edit profile
                </h3>

                <div className="form-group">
                  <label htmlFor="Email_Address">Email</label>
                  <input
                    type="email"
                    id="Email_Address"
                    name="Email_Address"
                    value={formData.Email_Address}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="Phone_Number">Phone</label>
                  <input
                    type="tel"
                    id="Phone_Number"
                    name="Phone_Number"
                    value={formData.Phone_Number}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="House_Number">House number</label>
                    <input
                      type="text"
                      id="House_Number"
                      name="House_Number"
                      value={formData.House_Number}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="Street">Street</label>
                    <input
                      type="text"
                      id="Street"
                      name="Street"
                      value={formData.Street}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="City">City</label>
                    <input
                      type="text"
                      id="City"
                      name="City"
                      value={formData.City}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="State">State</label>
                    <input
                      type="text"
                      id="State"
                      name="State"
                      value={formData.State}
                      onChange={handleFormChange}
                      maxLength={2}
                      placeholder="TX"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="Zip_Code">ZIP </label>
                    <input
                      type="text"
                      id="Zip_Code"
                      name="Zip_Code"
                      value={formData.Zip_Code}
                      onChange={handleFormChange}
                      maxLength={5}
                    />
                  </div>
                  
                </div>

                <div className="customer-profile-actions">
                  <button type="submit" className="btn primary">
                    Save changes
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {pageFooter}
    </div>
  )
}