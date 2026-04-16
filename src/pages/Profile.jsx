import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './css/home.css'
import './css/employee_home.css'
import './css/employee_profile.css'
import skyline from '../assets/houston-skyline.jpeg'
import { authFetch } from '../authFetch'
import EmployeeLayout from './EmployeeLayout'

async function parseJsonResponse(response) {
  const raw = await response.text()
  const ct = response.headers.get('content-type') || ''
  if (!raw || !ct.includes('application/json')) {
    return { data: null, raw }
  }
  try {
    return { data: JSON.parse(raw), raw }
  } catch {
    return { data: null, raw }
  }
}

export default function Profile() {
  const [user, setUser] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    Email_Address: '',
    Phone_Number: '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        navigate('/login')
        return
      }

      const response = await authFetch('/api/auth/profile')
      const { data, raw } = await parseJsonResponse(response)

      if (!response.ok) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
        return
      }

      if (!data?.user) {
        setError(raw || 'Failed to load profile')
        setLoading(false)
        return
      }

      setUser(data.user)
      setFormData({
        Email_Address: data.user.Email_Address || '',
        Phone_Number: data.user.Phone_Number || '',
      })
    } catch {
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      const response = await authFetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const { data, raw } = await parseJsonResponse(response)
      if (!response.ok) {
        setError(data?.message || raw || 'Update failed')
        return
      }

      setUser(data.user)
      setIsEditing(false)
      setSuccess('Profile updated successfully!')
      localStorage.setItem('user', JSON.stringify(data.user))
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('An error occurred. Please try again.')
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    try {
      const response = await authFetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      const { data, raw } = await parseJsonResponse(response)
      if (!response.ok) {
        setError(data?.message || raw || 'Password change failed')
        return
      }

      setSuccess('Password changed successfully!')
      setShowChangePassword(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('An error occurred. Please try again.')
    }
  }

  function handleLogout(e) {
    e.preventDefault()
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userType')
    localStorage.removeItem('rememberMe')
    navigate('/')
  }

  const navHeader = (
    <header className="site-header">
      <div className="header-inner">
        <Link className="logo" to="/">National Postal Service</Link>
          <nav className="top-nav">
            {/* <Link className="logo" to="/"> National Postal Service</Link>
          <nav className="top-nav"> */}
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/employee_home') }}>Employee Home</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/price_calculator') }}>Calculator</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/package_tracking') }}>Track a Package</a>
            <span className="nav-current" aria-current="page"> Profile</span>
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
      <div className="employee-home employee-profile-page">
        {navHeader}
        <main>
          <div className="employee-hero">
            <img src={skyline} alt="" />
          </div>
          <div className="employee-profile-inner employee-profile-loading">
            <p>Loading your profile…</p>
          </div>
        </main>
        {pageFooter}
      </div>
    )
  }

  if (!user) {
    return (
      <div className="employee-home employee-profile-page">
        {navHeader}
        <main>
          <div className="employee-hero">
            <img src={skyline} alt="" />
          </div>
          <div className="employee-profile-inner">
            <div className="employee-profile-card">
              <p className="error-message" style={{ margin: 0 }}>
                {error || 'Could not load profile.'}
              </p>
              <button
                type="button"
                className="btn primary"
                style={{ marginTop: 16 }}
                onClick={() => navigate('/employee_home')}
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
    <EmployeeLayout>
    <div className="employee-home employee-profile-page">

      <main>
        <div className="employee-hero">
          <img src={skyline} alt="" />
        </div>

        <div className="employee-profile-inner">
          <div className="employee-profile-card">
            <div className="employee-profile-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div className="employee-profile-avatar">
                  {user.First_Name?.charAt(0)}
                  {user.Last_Name?.charAt(0)}
                </div>
                <div>
                  <h2>Employee profile</h2>
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

            {!isEditing && !showChangePassword && (
              <>
                <div className="employee-profile-section">
                  <h3>Contact &amp; location</h3>
                  <div className="employee-profile-grid">
                    <div className="employee-profile-item">
                      <label>Name</label>
                      <p>
                        {user.First_Name} {user.Middle_Name} {user.Last_Name}
                      </p>
                    </div>
                    <div className="employee-profile-item">
                      <label>Email</label>
                      <p>{user.Email_Address}</p>
                    </div>
                    <div className="employee-profile-item">
                      <label>Phone</label>
                      <p>{user.Phone_Number || '—'}</p>
                    </div>
                    <div className="employee-profile-item">
                      <label>Post office</label>
                      <p>
                        {user.Office_City ?? '—'}, {user.Office_State ?? '—'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="employee-profile-section">
                  <h3>Employment</h3>
                  <div className="employee-profile-grid">
                    <div className="employee-profile-item">
                      <label>Employee ID</label>
                      <p>{user.Employee_ID}</p>
                    </div>
                    <div className="employee-profile-item">
                      <label>Department</label>
                      <p>{user.Department_Name ?? '—'}</p>
                    </div>
                    <div className="employee-profile-item">
                      <label>Role</label>
                      <p>{user.Role_Name ?? '—'}</p>
                    </div>
                    <div className="employee-profile-item">
                      <label>Supervisor</label>
                      <p>{user.Supervisor || '—'}</p>
                    </div>
                    <div className="employee-profile-item">
                      <label>Salary</label>
                      <p>${parseFloat(user.Salary || 0).toLocaleString()}</p>
                    </div>
                    <div className="employee-profile-item">
                      <label>Hours worked</label>
                      <p>
                        {user.Hours_Worked != null ? `${user.Hours_Worked} hrs` : '—'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="employee-profile-actions">
                  <button type="button" className="btn primary" onClick={() => setIsEditing(true)}>
                    Edit profile
                  </button>
                  <button type="button" className="btn" onClick={() => setShowChangePassword(true)}>
                    Change password
                  </button>
                  <button type="button" className="btn primary" onClick={() => navigate('/employee_home')}>
                    Employee Home
                  </button>
                </div>
              </>
            )}

            {showChangePassword && (
              <form onSubmit={handleChangePassword}>
                <h3 className="form-section-title">Change password</h3>
                <div className="form-group">
                  <label htmlFor="currentPassword">Current password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    placeholder="Current password"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="newPassword">New password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    placeholder="New password"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm new password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="employee-profile-actions">
                  <button type="submit" className="btn primary">
                    Save password
                  </button>
                  <button type="button" className="btn" onClick={() => setShowChangePassword(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {isEditing && (
              <form onSubmit={handleUpdateProfile}>
                <h3 className="form-section-title">Edit profile</h3>
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
                <div className="employee-profile-actions">
                  <button type="submit" className="btn primary">
                    Save changes
                  </button>
                  <button type="button" className="btn" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
    </EmployeeLayout>
  )
}
