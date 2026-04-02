import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './css/home.css'

const API_BASE = import.meta.env.VITE_API_URL || ''

export default function Home() {
  const navigate = useNavigate()
  const [loggedIn, setLoggedIn] = useState(() => !!localStorage.getItem('token'))

  useEffect(() => {
    const sync = () => setLoggedIn(!!localStorage.getItem('token'))
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  function handleLogout(e) {
    e.preventDefault()
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userType')
    setLoggedIn(false)
    navigate('/')
  }

  return (
    <div>
      <header className="site-header">
        <div className="header-inner">
          <a className="logo" href="/">National Postal Service</a>
          <nav className="top-nav">
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
              <a onClick={() => navigate('/login')}>Login</a>
            )}
          </nav>
        </div>
        <div className="hero">
          <div className="hero-left">
            <h1>Reliable mail and shipping services</h1>
            <p>Send, receive, and track packages nationwide with confidence.</p>
          </div>
          <div className="hero-right">
            <div className="track-card" id="track">
              <h3>Track a Package</h3>
              <div className="track-form">
                {/* <input 
                  type="text" 
                  placeholder="Enter tracking number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
                <button className="btn primary" onClick = {handleSubmit}>Track</button> */}
                <button className="btn primary" onClick={() => navigate('/package_tracking')}>
                  Track a Package
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section id="services" className="services">
          <h2>Popular Services</h2>
          <div className="cards">
            <div className="card">
              <h3>Mail & Shipping</h3>
              <p>Letters, packages, priority mail, and more.</p>
              <a className="link" href="#">Learn more</a>
            </div>
            <div className="card">
              <h3>PO Boxes</h3>
              <p>Secure PO Box options near you.</p>
              <a className="link" href="#">Find a PO Box</a>
            </div>
            <div className="card">
              <h3>Rates & Fees</h3>
              <p>Check pricing for domestic and international shipping.</p>
              <a className="link" href="#">View rates</a>
            </div>
          </div>
        </section>

        <section className="announcements">
          <h2>Announcements</h2>
          <ul>
            <li>Holiday shipping deadlines posted for the upcoming season.</li>
            <li>New drop-off locations open in several cities.</li>
          </ul>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <div>© National Postal Service</div>
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

