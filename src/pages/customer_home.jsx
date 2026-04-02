import { useNavigate, Link } from 'react-router-dom'
import './css/home.css'
import './css/customer_home.css'
import skyline from '../assets/houston-skyline.jpeg'

const API_BASE = import.meta.env.VITE_API_URL || ''

/** Name from localStorage `user` (customer login / register API shape). */
function getStoredCustomerFullName() {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    const u = JSON.parse(raw)
    const first = (u.First_Name ?? u.first_name ?? '').toString().trim()
    const last = (u.Last_Name ?? u.last_name ?? '').toString().trim()
    const full = [first, last].filter(Boolean).join(' ')
    return full || null
  } catch {
    return null
  }
}

export default function CustomerHome() {
  const navigate = useNavigate()

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userType')
    navigate('/')
  }

  return (
    <div className="customer-home">
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
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                navigate('/customer_packages')
              }}
            >
              My Packages
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                navigate('/inventory')
              }}
            >
              Store
            </a>
            <button type="button" className="customer-nav-logout" onClick={handleLogout}>
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main>
        <div className="customer-hero">
          <img src={skyline} alt="Post Office skyline" />
        </div>

        <section className="customer-welcome">
          <h2>
            Welcome, {getStoredCustomerFullName() ?? 'Customer'}
          </h2>
          <p className="customer-welcome-sub">Manage shipments and your account from one place.</p>
        </section>

        <section className="customer-dashboard">
          <div className="cards">
            <div className="card">
              <h3>Track a package</h3>
              <p>See where your package is in real time.</p>
              <button
                type="button"
                className="btn primary"
                onClick={() => navigate('/package_tracking')}
              >
                Track now
              </button>
            </div>

            {/* <div className="card">
              <h3>Send a package</h3>
              <p>Ship your packages quickly and safely.</p>
              <button type="button" className="btn primary" onClick={() => navigate('/ship_package')}>
                Send now
              </button>
            </div> */}

            <div className="card">
              <h3>Account info</h3>
              <p>View your address, saved packages, and profile settings.</p>
              <button
                type="button"
                className="btn primary"
                onClick={() => navigate('/customer_profile')}
              >
                View account
              </button>
            </div>
            <div className="card">
              <h3>Submit Support Ticket</h3>
              <p>Submit a Support ticket for issues with your package.</p>
              <button
                type="button"
                className="btn primary"
                onClick={() => navigate('/submit_ticket')}
              >
                Send now
              </button>
            </div>

            <div className="card">
              <h3>Package Pricing</h3>
              <p>Submit your package's information and recieve an estemated shipping price.</p>
              <button
                type="button"
                className="btn primary"
                onClick={() => navigate('/price_calculator')}
              >
                Calculate
              </button>
            </div>
            
          </div>
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
