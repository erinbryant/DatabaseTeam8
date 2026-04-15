import { useNavigate, Link } from 'react-router-dom'
import './css/home.css'
import './css/employee_home.css'
// for the current button to look right
import './css/employee_profile.css'

import skyline from '../assets/houston-skyline.jpeg'

/** Name from localStorage `user` (employee login API returns Employee row fields). */
function getStoredEmployeeFullName() {
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

function getStoredEmployeeRoleId() {
  try {
    const raw = localStorage.getItem('user')
    console.log(raw)
    if (!raw) return null
    const u = JSON.parse(raw)
    const roleId = Number(u.Role_ID ?? u.role_id)
    console.log(roleId)
    return Number.isFinite(roleId) ? roleId : null
  } catch {
    return null
  }
}

export default function EmployeeHome() {
  const navigate = useNavigate()
  const roleId = getStoredEmployeeRoleId()
  const isAdmin = roleId === 5

  function handleLogout(e) {
    e.preventDefault()
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userType')
    navigate('/')
  }

  return (
     <div className="employee-home">
      <header className="site-header">
        <div className="header-inner">
          <Link className="logo" to="/"> National Postal Service</Link>
          <nav className="top-nav">
            <span className="nav-current" aria-current="page">Employee Home</span>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/price_calculator') }}>Calculator</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/package_tracking') }}>Track a Package</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/profile') }}>Profile</a>
            <a href="#" onClick={handleLogout}>Logout</a>
          </nav>
        </div>
      </header>

      <main>
        <div className="employee-hero">
          <img src={skyline} alt="Post Office skyline" />
        </div>

        <section className="employee-welcome">
          <h2>Welcome, {getStoredEmployeeFullName() ?? 'Employee'}</h2>
          <p className="employee-welcome-sub">
            Tools for post office staff — packages, inventory, and customer records.
          </p>
        </section>

        <section className="employee-dashboard">
          <div className="cards">
            {/* <div className="card">
              <h3>Profile</h3>
              <p>View and update your employee profile.</p>
              <button type="button" className="btn primary" onClick={() => navigate('/profile')}>
                Open profile
              </button>
            </div> */}

            <div className="card">
              <h3>Stock &amp; inventory</h3>
              <p>Check product levels across locations.</p>
              <button type="button" className="btn primary" onClick={() => navigate('/inventory')}>
                View inventory
              </button>
            </div>

            <div className="card">
              <h3>Support tickets</h3>
              <p>Review and manage customer support requests.</p>
              <button type="button" className="btn primary" onClick={() => navigate('/employee-support')}>
                Open tickets
              </button>
            </div>

            <div className="card">
              <h3>Packages</h3>
              <p>Browse and manage package records.</p>
              <button type="button" className="btn primary" onClick={() => navigate('/package_list')}>
                View packages
              </button>
            </div>

            <div className="card">
              <h3>Package for pickup</h3>
              <p>See packages at the office and record when the customer picks them up.</p>
              <button type="button" className="btn primary" onClick={() => navigate('/employee/package-pickup')}>
                Package for pickup
              </button>
            </div>

            <div className="card">
              <h3>Add package</h3>
              <p>Register a customer shipment, calculate price, and issue a tracking number.</p>
              <button type="button" className="btn primary" onClick={() => navigate('/employee/add-package')}>
                Add package
              </button>
            </div>

            {isAdmin && (
              <>
                <div className="card">
                  <h3>Employees</h3>
                  <p>View and manage employee accounts.</p>
                  <button type="button" className="btn primary" onClick={() => navigate('/employees')}>
                    View Employees
                  </button>
                </div>

                <div className="card">
                  <h3>Register new employee</h3>
                  <p>Create a new employee account (admin only).</p>
                  <button type="button" className="btn primary" onClick={() => navigate('/admin-register')}>
                    Add employee
                  </button>
                </div>

                 <div className="card">
                  <h3>Ticket Report</h3>
                  <p>view ticket records and reports</p>
                  <button type="button" className="btn primary" onClick={() => navigate('/tickets_employees')}>
                    review
                  </button>
                </div>

                 <div className="card">
                  <h3>Revinue Report</h3>
                  <p>Sort by type of pricing, and view popularity reports</p>
                  <button type="button" className="btn primary" onClick={() => navigate('/revenue-report')}>
                    review
                  </button>
                </div>

                <div className="card">
                  <h3>Employee Report</h3>
                  <p>View rankings and employee ratios</p>
                  <button type="button" className="btn primary" onClick={() => navigate('/reports/employee-performance')}>
                    review
                  </button>
                </div>
              </>
              
            )}

           

            {/* <div className="card">
              <h3>Package lookup</h3>
              <p>Track a package by tracking number.</p>
              <button type="button" className="btn primary" onClick={() => navigate('/package_tracking')}>
                Track package
              </button>
            </div> */}

            <div className="card">
              <h3>Customers</h3>
              <p>Search and manage customer accounts.</p>
              <button type="button" className="btn primary" onClick={() => navigate('/customers')}>
                View customers
              </button>
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