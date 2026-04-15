import { useState, useEffect } from 'react'
import './css/home.css'
import './css/employee_home.css'
import './css/packages.css'
import skyline from '../assets/houston-skyline.jpeg'
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authFetch } from '../authFetch'

export default function AllCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const userType = localStorage.getItem('userType')
  const [loggedIn] = useState(!!localStorage.getItem('token'))
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [sortValue, setSortValue] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [customerPackages, setCustomerPackages] = useState({})

  const navigate = useNavigate()

  useEffect(() => {
    authFetch('/api/customers')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load customers')
        return res.json()
      })
      .then((data) => {
        setCustomers(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  let filtered = customers.filter((c) => {
    const q = search.toLowerCase()
    return (
      (c.Full_Name || '').toLowerCase().includes(q) ||
      (c.Email_Address || '').toLowerCase().includes(q) ||
      (c.Phone_Number || '').toLowerCase().includes(q) ||
      (c.Full_Address || '').toLowerCase().includes(q)
    )
  })

  if (sortValue === 'name_asc')
    filtered = [...filtered].sort((a, b) => a.Full_Name.localeCompare(b.Full_Name))
  if (sortValue === 'name_desc')
    filtered = [...filtered].sort((a, b) => b.Full_Name.localeCompare(a.Full_Name))

  function toggleExpand(id) {
    if (expanded === id) {
      setExpanded(null)
      return
    }
    setExpanded(id)

    authFetch(`/api/customers/${id}/packages`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load customer packages')
        return res.json()
      })
      .then((data) =>
        setCustomerPackages((prev) => ({
          ...prev,
          [id]: Array.isArray(data) ? data : [],
        }))
      )
      .catch(() =>
        setCustomerPackages((prev) => ({
          ...prev,
          [id]: [],
        }))
      )
  }

  const toggleCustomerStatus = async (id, currentStatus) => {
    const newStatus = currentStatus == 0 ? 1 : 0;
    const actionText = newStatus == 1 ? "deactivate" : "reinstate";

    if (window.confirm(`Are you sure you want to ${actionText} this customer?`)) {
      try {
        const response = await authFetch(`/api/customers/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_Active: newStatus })
        });

        if (!response.ok) throw new Error(`Failed to ${actionText} customer`);
        
        setCustomers(prev => prev.map(c => 
          c.Customer_ID === id ? { ...c, is_Active: newStatus } : c
        ));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  function handleLogout(e) {
    e.preventDefault()
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userType')
    navigate('/')
  }

  return (
    <div className={`packages-page ${userType === 'employee' ? 'employee-home' : ''}`}>
      <header className="site-header">
        <div className="header-inner">
          <Link className="logo" to="/"> National Postal Service</Link>
          <nav className="top-nav">
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/employee_home') }}>Employee Home</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/price_calculator') }}>Calculator</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/package_tracking') }}>Track a Package</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/profile') }}>Profile</a>
            <a href="#" onClick={handleLogout}>Logout</a>
          </nav>
        </div>
      </header>

      <main>
        <div className="inventory-hero">
          <img src={skyline} alt="" />
        </div>

        <div className="page-content">
          <h2>All Customers</h2>

          {error && (
            <div className="error-banner">
              <span>{error}</span>
              <button onClick={() => setError(null)}>✕</button>
            </div>
          )}

          {!loading && (
            <div className="stats-row">
              <div className="stat-card">
                <span className="stat-num">{customers.length}</span>
                <span className="stat-label">Total</span>
              </div>
            </div>
          )}

          <div className="controls-bar">
            <input
              type="text"
              className="search-input"
              placeholder="Search name, email, phone, address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="filter-select"
              value={sortValue}
              onChange={(e) => setSortValue(e.target.value)}
            >
              <option value="">Sort: Default</option>
              <option value="name_asc">Name (A → Z)</option>
              <option value="name_desc">Name (Z → A)</option>
            </select>
            <span className="result-count">
              {filtered.length} of {customers.length} customers
            </span>
          </div>

          {loading ? (
            <p className="state-msg">Loading customers...</p>
          ) : filtered.length === 0 ? (
            <p className="state-msg">No customers match your search.</p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Status</th>
                    <th></th>
                    <th></th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <React.Fragment key={c.Customer_ID}>
                      <tr>
                        <td>
                          <code>{c.Customer_ID}</code>
                        </td>
                        <td>{c.Full_Name}</td>
                        <td>{c.Email_Address || '—'}</td>
                        <td>{c.Phone_Number || '—'}</td>
                        <td>{c.Full_Address || '—'}</td>

                        <td>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            backgroundColor: c.is_Active == 0 ? '#d4edda' : '#f8d7da',
                            color: c.is_Active == 0 ? '#155724' : '#721c24',
                            border: c.is_Active == 0 ? '1px solid #c3e6cb' : '1px solid #f5c6cb'
                          }}>
                            {c.is_Active == 0 ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>

                        <td>
                          <button
                            className='button'
                            style={{
                              backgroundColor: c.is_Active == 0 ? '#d9534f' : '#28a745',
                              color: 'white',
                              marginTop: '5px',
                              width: '200px'
                            }}
                            onClick={() => toggleCustomerStatus(c.Customer_ID, c.is_Active)}
                          >
                            {c.is_Active == 0 ? 'Deactivate Account' : 'Reinstate Account'}
                          </button>
                        </td>

                        <td>
                          <button
                            className="button"
                            style={{
                              padding: '5px 12px',
                              fontSize: '0.8rem',
                              marginTop: 0,
                            }}
                            onClick={() => toggleExpand(c.Customer_ID)}
                          >
                            {expanded === c.Customer_ID ? '▲ Hide' : '▼ More'}
                          </button>
                        </td>
                      </tr>

                      {expanded === c.Customer_ID && (
                        <tr className="detail-row">
                          <td colSpan={8}>
                            <div className="detail-grid">
                              <div className="detail-item">
                                <label>Country</label>
                                <p>{c.Country || '—'}</p>
                              </div>
                             
                              <div className="detail-item">
                                <label>Sending</label>
                                <p>
                                  {(customerPackages[c.Customer_ID] || [])
                                    .filter((p) => p.Role === 'Sending')
                                    .map((p) => (
                                      <code
                                        key={p.Tracking_Number}
                                        style={{ display: 'block' }}
                                      >
                                        {p.Tracking_Number}
                                      </code>
                                    ))}
                                  {!(customerPackages[c.Customer_ID] || []).some(
                                    (p) => p.Role === 'Sending'
                                  ) && '—'}
                                </p>
                              </div>

                              <div className="detail-item">
                                <label>Receiving</label>
                                <p>
                                  {(customerPackages[c.Customer_ID] || [])
                                    .filter((p) => p.Role === 'Receiving')
                                    .map((p) => (
                                      <code
                                        key={p.Tracking_Number}
                                        style={{ display: 'block' }}
                                      >
                                        {p.Tracking_Number}
                                      </code>
                                    ))}
                                  {!(customerPackages[c.Customer_ID] || []).some(
                                    (p) => p.Role === 'Receiving'
                                  ) && '—'}
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <span>© {new Date().getFullYear()} National Postal Service</span>
          <span className="footer-links" />
        </div>
      </footer>
    </div>
  )
}
