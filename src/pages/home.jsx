import { useNavigate } from 'react-router-dom'
import './css/home.css'
// import Layout from '../layout'
// import '../components/button.css'



 export default function Home() {
  const navigate = useNavigate();
    return (
    <div>
      <header className="site-header">
        <div className="header-inner">
          <a className="logo" href="/">National Postal Service</a>
          <nav className="top-nav">
            <a onClick={() => navigate('/customer_home')}>Customer</a>
            <a onClick={() => navigate('/employee_home')}>Employee</a>
            <a onClick={() => navigate('/login')}>Login</a>
            <a href="#services">Services</a>
            <a href="#track">Track</a>
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
                <input type="text" placeholder="Enter tracking number" />
                <button className="btn primary">Track</button>
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