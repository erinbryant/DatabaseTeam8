import { useNavigate, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './css/home.css'
import './css/customer_home.css'
import skyline from '../assets/houston-skyline.jpeg'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function getStoredCustomerFullName() {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    const u = JSON.parse(raw)
    const first = (u.First_Name ?? u.first_name ?? '').toString().trim()
    const last  = (u.Last_Name  ?? u.last_name  ?? '').toString().trim()
    return [first, last].filter(Boolean).join(' ') || null
  } catch { return null }
}

export default function CustomerHome() {
  const navigate = useNavigate()
  const [lostPackages,   setLostPackages]   = useState([])
  const [showLostBanner, setShowLostBanner] = useState(true)

  useEffect(() => {
    const user  = JSON.parse(localStorage.getItem('user') || '{}')
    const token = localStorage.getItem('token')
    if (user.Customer_ID && token) {
      fetch(`${API_BASE}/api/packages/lost/${user.Customer_ID}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => setLostPackages(Array.isArray(data) ? data : []))
        .catch(() => setLostPackages([]))
    }
  }, [])

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userType')
    navigate('/')
  }

  async function dismissLostPackage(trackingNumber) {
    const token = localStorage.getItem('token')
    try {
      await fetch(`${API_BASE}/api/packages/lost/${trackingNumber}/dismiss`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      })
      setLostPackages(lostPackages.filter(p => p.Tracking_Number !== trackingNumber))
    } catch (err) {
      console.error('Failed to dismiss lost package:', err)
    }
  }

  // Placeholder — swap for real notifications when system is ready
  const notifications = []

  return (
    <div className="customer-home">
      <header className="site-header">
        <div className="header-inner">
          <Link className="logo" to="/">National Postal Service</Link>
          <nav className="top-nav">
            <span className="nav-current" aria-current="page">Customer Home</span>
            <a href="#" onClick={e => { e.preventDefault(); navigate('/price_calculator') }}>Calculator</a>
            <a href="#" onClick={e => { e.preventDefault(); navigate('/customer_profile') }}>Profile</a>
            <a href="#" onClick={handleLogout}>Logout</a>
          </nav>
        </div>
      </header>

      {/* Lost Package Banner */}
      {lostPackages.length > 0 && showLostBanner && (
        <div className="lost-banner">
          <div className="lost-banner-inner">
            <div className="lost-icon">
              <svg viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.25"/>
                <path d="M10 6v4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="10" cy="13.5" r="0.75" fill="currentColor"/>
              </svg>
            </div>
            <div className="lost-content">
              <p className="lost-title">One or more of your packages have been marked as lost</p>
              <ul className="lost-list">
                {lostPackages.map(pkg => (
                  <li key={pkg.Tracking_Number}>
                    <span className="track">{pkg.Tracking_Number}</span>
                    <span>{pkg.last_location ?? 'Location unknown'}</span>
                    <span className="date">· Lost since {new Date(pkg.Date_Updated ?? pkg.Date_Created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </li>
                ))}
              </ul>
              <p className="lost-action">
                <a href="#" onClick={e => { e.preventDefault(); navigate('/submit_ticket') }}>Submit a support ticket</a>
                {' '}or{' '}
                <a href="#" onClick={e => { e.preventDefault(); navigate('/customer_packages') }}>view package details</a>
              </p>
            </div>
            <button className="lost-dismiss" onClick={() => setShowLostBanner(false)}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      <main>
        <div className="customer-hero">
          <img src={skyline} alt="Post Office skyline" />
        </div>

        <section className="customer-welcome">
          <h2>Welcome, {getStoredCustomerFullName() ?? 'Customer'}</h2>
          <p className="customer-welcome-sub">Manage shipments and your account from one place.</p>
        </section>

        <section className="customer-dashboard">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>

            {/* ── Left: cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

              {/* Row 1 */}
              <div className="card">
                <h3>Track a Package</h3>
                <p>See where your package is in real time.</p>
                <button type="button" className="btn primary" onClick={() => navigate('/package_tracking')}>
                  Track now
                </button>
              </div>

              <div className="card">
                <h3>My Packages</h3>
                <p>View your current and past packages.</p>
                <button type="button" className="btn primary" onClick={() => navigate('/customer_packages')}>
                  View now
                </button>
              </div>

              {/* Row 2 — single card centered */}
              <div className="card" style={{ gridColumn: '1 / -1', maxWidth: '50%', margin: '0 auto', width: '100%' }}>
                <h3>Support Ticket</h3>
                <p>Submit a ticket for issues with your package.</p>
                <button type="button" className="btn primary" onClick={() => navigate('/submit_ticket')}>
                  Send now
                </button>
              </div>

            </div>

            {/* ── Right: notifications ── */}
            <div style={{
              background: '#fff',
              borderRadius: 16,
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(15,23,42,0.05)',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '14px 20px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1d4ed8' }}>Notifications</span>
                {notifications.length > 0 && (
                  <span style={{ background: '#9b1c1c', color: '#fff', borderRadius: 20, padding: '1px 8px', fontSize: '0.72rem', fontWeight: 700 }}>
                    {notifications.length}
                  </span>
                )}
              </div>

              <div style={{ padding: '16px 20px' }}>
                {notifications.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '28px 0' }}>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>
                      No current notifications
                    </div>
                  </div>
                ) : (
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {notifications.map((n, i) => (
                      <li key={i} style={{
                        padding: '10px 14px',
                        background: '#f8fafc',
                        borderRadius: 10,
                        borderLeft: '3px solid #1a1f4e',
                        fontSize: '0.84rem',
                        color: '#374151',
                        lineHeight: 1.5,
                      }}>
                        {n.message}
                        {n.date && <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 4 }}>{n.date}</div>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

          </div>
        </section>
      </main>

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
    </div>
  )
}