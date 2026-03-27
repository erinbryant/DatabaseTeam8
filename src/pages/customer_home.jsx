import { useNavigate } from 'react-router-dom'
import "./css/customer_home.css";
import skyline from "../assets/houston-skyline.jpeg";

export default function CustomerHome() {
  const navigate = useNavigate();
  return (
    <>
      <header className="navbar">
        <h1>National Postal Service</h1>

        <nav className="top-nav">
          <a onClick={() => navigate('/')}>Home</a>
          <a onClick={() => navigate('/track')}>Track Package</a>
          <a onClick={() => navigate('/send')}>Send Package</a>
          <a onClick={() => navigate('/history')}>History</a>
          <a onClick={() => navigate('/store')}>Store</a>
          <a onClick={() => navigate('/logout')}>Logout</a>
        </nav>
      </header>

      <main>
        <div className="hero">
          <img src={skyline} alt="Post Office" />
        </div>

        <div className="welcome">
          <h2>Welcome, Customer!</h2>
        </div>

        <div className="dashboard">
          <div className="card">
            <h2>Track a Package</h2>
            <p>See where your package is in real time.</p>
            <a onClick={() => navigate('/track')} className="button">Track Now</a>
          </div>

          <div className="card">
            <h2>Send a Package</h2>
            <p>Ship your packages quickly and safely</p>
            <a onClick={() => navigate('/send')} className="button">Send Now</a>
          </div>

          <div className="card">
            <h2>Account Info</h2>
            <p>View your address, saved packages, and profile settings.</p>
            <a onClick={() => navigate('/account')} className="button">View Account</a>
          </div>
        </div>
      </main>

      <footer>
        <p>© National Postal Service</p>
        <a onClick={() => navigate('/support')} className='footer-link'>Support</a>
      </footer>
    </>
  );
}