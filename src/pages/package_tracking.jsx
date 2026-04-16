import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './css/home.css'
import './css/package_tracking.css'
import { authFetch } from '../authFetch'
import EmployeeLayout from './EmployeeLayout'

const envApi = import.meta.env.VITE_API_URL
const API_BASE =
  envApi != null && String(envApi).trim() !== ''
    ? String(envApi).replace(/\/$/, '')
    : import.meta.env.DEV
      ? ''
      : 'http://localhost:5000'

export default function PackageTracking() {
  const navigate   = useNavigate()
  const userType   = localStorage.getItem('userType')
  const isEmployee = userType === 'employee'

  const [loggedIn,       setLoggedIn]       = useState(!!localStorage.getItem('token'))
  const [trackingNumber, setTrackingNumber] = useState('')
  const [loading,        setLoading]        = useState(false)
  const [error,          setError]          = useState(null)
  const [results,        setResults]        = useState(null)

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
    if (!trackingNumber.trim()) { setError('Please enter a tracking number'); return }
    setLoading(true); setError(null); setResults(null)
    const id = encodeURIComponent(trackingNumber.trim())
    try {
      const res = await authFetch(`${API_BASE}/api/packages/${id}/tracking`)
      const raw = await res.text()
      const contentType = res.headers.get('content-type') || ''
      let data = {}
      if (raw && contentType.includes('application/json')) {
        try { data = JSON.parse(raw) } catch { data = {} }
      }
      if (!res.ok) throw new Error(data.error || data.message || raw || 'Failed to fetch tracking info')
      setResults(Array.isArray(data) ? data : [data])
    } catch (err) {
      setError(err.message || 'Could not load tracking information')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSearch() }

  function statusBadge(status) {
    const s = (status || '').toLowerCase()
    const cls = s.includes('deliver')                      ? 'status-delivered'
      : s.includes('transit') || s.includes('shipping')   ? 'status-transit'
      : s.includes('pending') || s.includes('processing') ? 'status-pending'
      : s.includes('delay')   || s.includes('exception')  ? 'status-delayed'
      : 'status-default'
    return <span className={`status-badge ${cls}`}>{status || 'Unknown'}</span>
  }

  const shipments = (results || []).filter(r => r.Instance_Type === 'Shipment')
  const delivery  = (results || []).find(r  => r.Instance_Type === 'Delivery')

  // ── Shared page content ───────────────────────────────────────────────
  const content = (
    <main>
      <div className="tracking-hero">
        <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=80" alt="" />
      </div>

      <div className="tracking-content">
        <h2>Package tracking</h2>
        <p className="tracking-subtitle">Enter your tracking number to see status and delivery information.</p>

        <div className="tracking-search-card">
          <div className="tracking-controls">
            <input type="text" className="tracking-input" placeholder="Enter tracking number"
              value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} onKeyDown={handleKeyDown} />
            <button type="button" className="tracking-track-btn" onClick={handleSearch} disabled={loading}>
              {loading ? 'Looking up…' : 'Track'}
            </button>
          </div>
        </div>

        {error && (
          <div className="tracking-error-banner">
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)} aria-label="Dismiss">×</button>
          </div>
        )}

        {loading && <p className="state-msg">Looking up tracking number...</p>}

        {results && results.length === 0 && (
          <p className="state-msg">No tracking information found for <code>{trackingNumber}</code>.</p>
        )}

        {shipments.length > 0 && (
          <>
            <h3 className="tracking-section-title">Package details</h3>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Shipment_ID</th><th>Status</th><th>From Address</th>
                    <th>To Address</th><th>Departed</th><th>Arrived</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.map(s => (
                    <tr key={s.Shipment_ID}>
                      <td><code>{s.Shipment_ID}</code></td>
                      <td>{statusBadge(s.Status_Name)}</td>
                      <td>{s.From_Full_Address || '—'}</td>
                      <td>{s.To_Full_Address   || '—'}</td>
                      <td>{s.Departure_Time_Stamp ? new Date(s.Departure_Time_Stamp).toLocaleString() : '—'}</td>
                      <td>{s.Arrival_Time_Stamp   ? new Date(s.Arrival_Time_Stamp).toLocaleString()   : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {delivery && (
          <>
            <h3 style={{ marginTop: '2rem' }}>Delivery</h3>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Delivery ID</th><th>Status</th><th>Delivered Date</th>
                    <th>Signature Received</th><th>Final State</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>{delivery.Delivery_ID ?? '—'}</code></td>
                    <td>{statusBadge(delivery.Status_Name)}</td>
                    <td>{delivery.Delivered_Date ? new Date(delivery.Delivered_Date).toLocaleString() : '—'}</td>
                    <td>{delivery.Signature_Received || '—'}</td>
                    <td>{delivery.Is_Final_Status ? 'Final' : 'In Progress'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}

        {!loading && !results && !error && (
          <div className="tracking-state-msg">Enter a tracking number above to get started.</div>
        )}
      </div>
    </main>
  )

  // ── Employee: sidebar layout ──────────────────────────────────────────
  if (isEmployee) {
    return (
      <EmployeeLayout>
        {content}
      </EmployeeLayout>
    )
  }

  // ── Customer / logged out: original layout ────────────────────────────
  return (
    <div className="tracking-page">
      <header className="site-header">
        <div className="header-inner">
          <Link className="logo" to="/">National Postal Service</Link>
          <nav className="top-nav">
            {loggedIn ? (
              <>
                <a href="#" onClick={e => { e.preventDefault(); navigate('/customer_home') }}>Customer Home</a>
                <a href="#" onClick={e => { e.preventDefault(); navigate('/price_calculator') }}>Calculator</a>
                <span className="nav-current" aria-current="page">Track a Package</span>
                <a href="#" onClick={e => { e.preventDefault(); navigate('/customer_profile') }}>Profile</a>
                <a href="#" onClick={handleLogout}>Logout</a>
              </>
            ) : (
              <a href="#" onClick={e => { e.preventDefault(); navigate('/login') }}>Login</a>
            )}
          </nav>
        </div>
      </header>

      {content}

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