import { useNavigate } from 'react-router-dom'
import Layout from '../layout'
import '../components/button.css'

const API_BASE = import.meta.env.VITE_API_URL || ''

export default function EmployeeHome() {
  const navigate = useNavigate();

  return (
    <Layout buttonLabel="Logout" buttonHref="/">

      {/* ── PAGE TITLE ── */}
      <h2>Welcome to Post Office 8</h2>
      <p>What would you like to do today?</p>

      {/* ── NAVIGATION BUTTONS ── */}
      <div className="button-group">

        <button className="btn" onClick={() => navigate('/profile')}>
          Profile
        </button>

        <button className="btn" onClick={() => navigate('/inventory')}>
          Stock
        </button>

        <button className="btn" onClick={() => navigate('/support_tickets')}>
          Support Tickets
        </button>

        <button className="btn" onClick={() => navigate('/package_list')}>
          Packages
        </button>

        <button className="btn" onClick={() => navigate('/package_tracking')}>
          Package Lookup
        </button>

        <button className="btn" onClick={() => navigate('/package_history')}>
          Package History
        </button>

        <button className="btn" onClick={() => navigate('/price_calculator')}>
          Ship Package
        </button>

        <button className="btn" onClick={() => navigate('/customers')}>
          Customers
        </button>

      </div>

    </Layout>
  )
}