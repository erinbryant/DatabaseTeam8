import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './css/home.css'
import './css/package_tracking.css'

const API_BASE = import.meta.env.VITE_API_URL || ''

export default function PackageTracking() {
  
  const navigate = useNavigate()
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('token'))
  const [trackingNumber, setTrackingNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [packageData, setPackageData] = useState(null)

  useEffect(() => {
    const onStorage = () => setLoggedIn(!!localStorage.getItem('token'))
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const handleLogout = (e) => {
    e.preventDefault()
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userType')
    setLoggedIn(false)
    navigate('/')
  }

  const handleSearch = async () => {
    if (!trackingNumber.trim()) {
      setError('Please enter a tracking number')
      return
    }

    setLoading(true)
    setError(null)
    setPackageData(null)

    try {
      const id = encodeURIComponent(trackingNumber.trim())
      const response = await fetch(`${API_BASE}/api/packages/track/${id}`)

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || `Failed to fetch tracking information (${response.status})`)
      }

      const data = await response.json()
      setPackageData(data)
    } catch (err) {
      setError(err.message || 'Failed to load tracking information')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  const getStatusBadgeClass = (status) => {
    const s = (status || '').toLowerCase()
    if (s.includes('delivered')) return 'status-delivered'
    if (s.includes('transit') || s.includes('shipping')) return 'status-transit'
    if (s.includes('pending') || s.includes('processing')) return 'status-pending'
    if (s.includes('delay') || s.includes('exception')) return 'status-delayed'
    return 'status-default'
  }

  return (
    <div className="tracking-page">
      <header className="site-header">
        <div className="header-inner">
          <Link className="logo" to="/">
            National Postal Service
          </Link>
          <nav className="top-nav">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                navigate('/')
              }}
            >
              Home
            </a>
            {loggedIn ? (
              <>
                {localStorage.getItem('userType') === 'customer' && (
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      navigate('/customer_home')
                    }}
                  >
                    Customer Portal
                  </a>
                )}
                <a href="#" onClick={handleLogout}>
                  Logout
                </a>
              </>
            ) : (
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  navigate('/login')
                }}
              >
                Login
              </a>
            )}
          </nav>
        </div>
      </header>

      <main>
        <div className="tracking-hero">
          <img
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=80"
            alt=""
          />
        </div>

        <div className="tracking-content">
          <h2>Package tracking</h2>
          <p className="tracking-subtitle">
            Enter your tracking number to see status, route details, and delivery information.
          </p>

          <div className="tracking-search-card">
            <div className="tracking-controls">
              <input
                type="text"
                className="tracking-input"
                placeholder="Enter tracking number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button
                type="button"
                className="tracking-track-btn"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? 'Looking up…' : 'Track'}
              </button>
            </div>
          </div>

          {error && (
            <div className="tracking-error-banner">
              <span>{error}</span>
              <button type="button" onClick={() => setError(null)} aria-label="Dismiss">
                ×
              </button>
            </div>
          )}

          {loading && (
            <div className="tracking-state-msg">Looking up your package…</div>
          )}

          {!loading && packageData && (
            <>
              <h3 className="tracking-section-title">Package details</h3>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Tracking #</th>
                      <th>Status</th>
                      <th>Type</th>
                      <th>Weight</th>
                      <th>Dimensions (L × W × H)</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{packageData.Tracking_Number}</td>
                      <td>
                        <span
                          className={`status-badge ${getStatusBadgeClass(packageData.Status_Name)}`}
                        >
                          {packageData.Status_Name || '—'}
                        </span>
                      </td>
                      <td>{packageData.Type_Name || '—'}</td>
                      <td>{packageData.Weight != null ? `${packageData.Weight} lbs` : '—'}</td>
                      <td>
                        {packageData.Dim_X != null &&
                        packageData.Dim_Y != null &&
                        packageData.Dim_Z != null
                          ? `${packageData.Dim_X} × ${packageData.Dim_Y} × ${packageData.Dim_Z} in`
                          : '—'}
                      </td>
                      <td>
                        {packageData.Price != null ? `$${Number(packageData.Price).toFixed(2)}` : '—'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="tracking-detail-grid">
                <div className="tracking-detail-item">
                  <span className="tracking-detail-label">Sender</span>
                  <p>{packageData.Sender_Name || '—'}</p>
                </div>
                <div className="tracking-detail-item">
                  <span className="tracking-detail-label">Recipient</span>
                  <p>{packageData.Recipient_Name || '—'}</p>
                </div>
                {packageData.Delivered_Date && (
                  <div className="tracking-detail-item">
                    <span className="tracking-detail-label">Delivered</span>
                    <p>{new Date(packageData.Delivered_Date).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {!loading && !packageData && !error && trackingNumber === '' && (
            <div className="tracking-state-msg">Enter a tracking number above to get started.</div>
          )}
        </div>
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <span>© {new Date().getFullYear()} National Postal Service</span>
          <span className="footer-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Support</a>
          </span>
        </div>
      </footer>
    </div>
  )
}
