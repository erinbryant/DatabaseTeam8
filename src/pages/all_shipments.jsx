import { useState, useEffect } from 'react'
import './css/home.css'
import './css/employee_home.css'
import './css/packages.css'
import skyline from '../assets/houston-skyline.jpeg'
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authFetch } from '../authFetch'

export default function AllShipments() {
  const [shipments, setShipments] = useState([])
  const [loading, setLoading] = useState(true)
  const userType = localStorage.getItem('userType')
  const [loggedIn] = useState(!!localStorage.getItem('token'))
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [sortValue, setSortValue] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [shipmentPackages, setShipmentPackages] = useState({})


  const STATUS_MAP = {
  0: { label: 'Open', color: '#dc2626', bg: '#fef2f2' },
  1: { label: 'Pending', color: '#d97706', bg: '#fffbeb' },
  2: { label: 'Closed', color: '#16a34a', bg: '#f0fdf4' },
}



  const navigate = useNavigate()

  useEffect(() => {
    authFetch('/api/shipments')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load shipments')
        return res.json()
      })
      .then((data) => {
        setShipments(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  let filtered = shipments.filter((c) => {
    const q = search.toLowerCase()
    return (
      (c.From_Full_Address || '').toLowerCase().includes(q) ||
      (c.To_Full_Address || '').toLowerCase().includes(q)
    //   (c.Shipment_ID || '').toLowerCase().includes(q) ||
    //   (c.Full_Address || '').toLowerCase().includes(q)
    )
  })

  if (sortValue === 'name_asc')
    filtered = [...filtered].sort((a, b) => Number(a.Shipment_ID) - Number(b.Shipment_ID))
  if (sortValue === 'name_desc')
    filtered = [...filtered].sort((a, b) => Number(b.Shipment_ID) - Number(a.Shipment_ID))

  function toggleExpand(id) {
    if (expanded === id) {
      setExpanded(null)
      return
    }
    setExpanded(id)

    authFetch(`/api/shipment/${id}/packages`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load shipment packages')
        return res.json()
      })
      .then((data) =>
        setShipmentPackages((prev) => ({
          ...prev,
          [id]: Array.isArray(data) ? data : [],
        }))
      )
      .catch(() =>
        setShipmentPackages((prev) => ({
          ...prev,
          [id]: [],
        }))
      )
  }

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
          <h2>All Shipments</h2>

          {error && (
            <div className="error-banner">
              <span>{error}</span>
              <button onClick={() => setError(null)}>✕</button>
            </div>
          )}

          {!loading && (
            <div className="stats-row">
              <div className="stat-card">
                <span className="stat-num">{shipments.length}</span>
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
              <option value="name_asc">Shipment ID asc</option>
              <option value="name_desc">Shipment ID dec</option>
            </select>
            <span className="result-count">
              {filtered.length} of {shipments.length} shipments
            </span>
          </div>

          {loading ? (
            <p className="state-msg">Loading shipments...</p>
          ) : filtered.length === 0 ? (
            <p className="state-msg">No shipments match your search.</p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>From Address</th>
                    <th>To Address</th>
                    <th>Departure Time</th>
                    <th>Arrival Time</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <React.Fragment key={c.Shipment_ID}>
                      <tr>
                        <td>
                          <code>{c.Shipment_ID}</code>
                        </td>
                        <td>{c.From_Full_Address}</td>
                        <td>{c.To_Full_Address || '—'}</td>
                        <td>{c.Departure_Time_Stamp || '—'}</td>
                        <td>{c.Arrival_Time_Stamp || '—'}</td>
                        <td>
                          <button
                            className="button"
                            style={{
                              padding: '5px 12px',
                              fontSize: '0.8rem',
                              marginTop: 0,
                            }}
                            onClick={() => toggleExpand(c.Shipment_ID)}
                          >
                            {expanded === c.Shipment_ID ? '▲ Hide' : '▼ More'}
                          </button>
                        </td>
                      </tr>

                      {expanded === c.Shipment_ID && (
                        <tr className="detail-row">
                          <td colSpan={6}>
                            <div className="detail-grid">
                              <div className="detail-item">
                                <label>Packages</label>
                                <p>
                                  {(shipmentPackages[c.Shipment_ID] || [])
                                    .map((p) => (
                                      <code
                                        key={p.Tracking_Number}
                                        style={{ display: 'block' }}
                                      >
                                        {p.Tracking_Number}
                                      </code>
                                    ))}
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
