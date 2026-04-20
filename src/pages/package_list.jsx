import { useState, useEffect, Fragment } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './css/home.css'
// import './css/customer_home.css'
import './css/inventory.css'
import './css/package_list.css'
import skyline from '../assets/houston-skyline.jpeg'
import { authFetch } from '../authFetch'
import EmployeeLayout from './EmployeeLayout'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const ZONES = [
  { value: '1', label: 'Zone 1 — 1-50 mi' },
  { value: '2', label: 'Zone 2 — 51-150 mi' },
  { value: '3', label: 'Zone 3 — 151-300 mi' },
  { value: '4', label: 'Zone 4 — 301-600 mi' },
  { value: '5', label: 'Zone 5 — 601-1,000 mi' },
  { value: '6', label: 'Zone 6 — 1,001-1,400 mi' },
  { value: '7', label: 'Zone 7 — 1,401-1,800 mi' },
  { value: '8', label: 'Zone 8 — 1,801+ mi' },
  { value: '9', label: 'Zone 9 — Territories' },
]

function statusBadgeStyle(status) {
  const s = (status || '').toLowerCase()
  if (s.includes('deliver') || s.includes('picked up'))
    return { background: '#dcfce7', color: '#1a1f4e', borderRadius: 20, padding: '3px 10px', fontWeight: 700, fontSize: '0.8rem' }
  if (s.includes('transit') || s.includes('out for'))
    return { background: '#dbeafe', color: '#1a1f4e', borderRadius: 20, padding: '3px 10px', fontWeight: 700, fontSize: '0.8rem' }
  if (s.includes('pending'))
    return { background: '#fef9c3', color: '#1a1f4e', borderRadius: 20, padding: '3px 10px', fontWeight: 700, fontSize: '0.8rem' }
  if (s.includes('delay'))
    return { background: '#ffedd5', color: '#1a1f4e', borderRadius: 20, padding: '3px 10px', fontWeight: 700, fontSize: '0.8rem' }
  if (s.includes('lost'))
    return { background: '#fee2e2', color: '#1a1f4e', borderRadius: 20, padding: '3px 10px', fontWeight: 700, fontSize: '0.8rem' }
  if (s.includes('return'))
    return { background: '#f3e8ff', color: '#1a1f4e', borderRadius: 20, padding: '3px 10px', fontWeight: 700, fontSize: '0.8rem' }
  return { background: '#f1f5f9', color: '#1a1f4e', borderRadius: 20, padding: '3px 10px', fontWeight: 700, fontSize: '0.8rem' }
}

function PackageTable({ title, packages, expanded, onToggle, statusCodes, onStatusChange, statusUpdating, color = '#1d4ed8', collapsible = false }) {
  const [open, setOpen] = useState(!collapsible)

  return (
    <div style={{ background: '#fff', border: '1px solid #dbe4ef', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 16px rgba(15,23,42,0.05)', marginBottom: 28 }}>
      {/* Section header */}
      <div
        onClick={() => collapsible && setOpen(o => !o)}
        style={{ padding: '16px 24px', background: '#f8fafc', borderBottom: open ? '1px solid #dbe4ef' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: collapsible ? 'pointer' : 'default' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{title}</h3>
          <span style={{ background: color, color: '#fff', borderRadius: 20, padding: '2px 10px', fontSize: '0.8rem', fontWeight: 700 }}>
            {packages.length}
          </span>
        </div>
        {collapsible && (
          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{open ? '▲ Collapse' : '▼ Expand'}</span>
        )}
      </div>

      {open && (
        packages.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>No packages in this category.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #dbe4ef' }}>
                  {['Tracking #', 'Type', 'Sender', 'Recipient', 'Weight', 'Zone', 'Price', 'Status', 'Created', ''].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {packages.map((p, i) => (
                  
                  <Fragment key={p.Tracking_Number}>
                    <tr style={{ background: i % 2 === 0 ? '#fff' : '#fafbfc', borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 14px' }}>
                        <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: '0.82rem', fontWeight: 700 }}>
                          {p.Tracking_Number}
                        </code>
                      </td>
                      <td style={{ padding: '10px 14px', color: '#374151' }}>{p.Package_Type_Code}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.Sender_Name || '—'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{p.Sender_Email || ''}</div>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.Recipient_Name || '—'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{p.Recipient_Email || ''}</div>
                      </td>
                      <td style={{ padding: '10px 14px', color: '#374151' }}>{p.Weight} lbs</td>
                      <td style={{ padding: '10px 14px', color: '#374151' }}>Zone {p.Zone}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: '#1e40af' }}>${parseFloat(p.Price || 0).toFixed(2)}</td>
                      <td style={{ padding: '10px 14px' }}>
                        {statusCodes.length > 0 ? (
                          <select
                            value={String(
                              p.Delivery_Status_Code != null
                                ? p.Delivery_Status_Code
                                : statusCodes[0]?.Status_Code
                            )}
                            onChange={e => onStatusChange(p.Tracking_Number, e.target.value)}
                            disabled={statusUpdating === p.Tracking_Number}
                            style={{ padding: '4px 8px', border: '1px solid #dbe4ef', borderRadius: 6, fontSize: '0.82rem' }}
                          >
                            {statusCodes.map(s => (
                              <option key={s.Status_Code} value={String(s.Status_Code)}>{s.Status_Name}</option>
                            ))}
                          </select>
                        ) : (
                          <span style={statusBadgeStyle(p.Status_Name)}>{p.Status_Name || '—'}</span>
                        )}
                      </td>
                      <td style={{ padding: '10px 14px', color: '#64748b', fontSize: '0.82rem' }}>
                        {p.Date_Created ? new Date(p.Date_Created).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <button
                          onClick={() => onToggle(p.Tracking_Number)}
                          style={{ background: 'none', border: '1px solid #dbe4ef', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: '0.78rem', color: '#374151' }}
                        >
                          {expanded === p.Tracking_Number ? '▲ Less' : '▼ More'}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded detail row */}
                    {expanded === p.Tracking_Number && (
                      <tr style={{ background: '#f8fafc' }}>
                        <td colSpan={10} style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px 24px' }}>
                            {[
                              { label: 'Dimensions',     value: `${p.Dim_X}" × ${p.Dim_Y}" × ${p.Dim_Z}"` },
                              { label: 'Oversize',       value: p.Oversize ? 'Yes' : 'No' },
                              { label: 'Sig. Required',  value: p.Requires_Signature ? 'Yes' : 'No' },
                              { label: 'From',           value: p.From_City ? `${p.From_City}, ${p.From_State}` : '—' },
                              { label: 'To',             value: p.To_City   ? `${p.To_City}, ${p.To_State}`   : '—' },
                              { label: 'Post Office',    value: p.Office_City || '—' },
                              { label: 'Handled By',     value: p.Handled_By || '—' },
                              { label: 'Delivered Date', value: p.Delivered_Date ? new Date(p.Delivered_Date).toLocaleDateString() : '—' },
                              { label: 'Last Updated',   value: p.Date_Updated   ? new Date(p.Date_Updated).toLocaleDateString()   : '—' },
                            ].map(item => (
                              <div key={item.label}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>{item.label}</div>
                                <div style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: 500 }}>{item.value}</div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  )
}


export default function AllPackages() {
  const navigate   = useNavigate()
  const token      = localStorage.getItem('token')
  const userType   = localStorage.getItem('userType')

  //Add sidebar using this
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const [packages,       setPackages]       = useState([])
  const [statusCodes,    setStatusCodes]    = useState([])
  const [postOffices,    setPostOffices]    = useState([])
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState(null)
  const [expanded,       setExpanded]       = useState(null)
  const [statusUpdating, setStatusUpdating] = useState(null)
  

  // Filters
  const [search,        setSearch]        = useState('')
  const [zoneFilter,    setZoneFilter]    = useState('')
  const [typeFilter,    setTypeFilter]    = useState('')
  const [officeFilter,  setOfficeFilter]  = useState('')
  //const [showFilters,   setShowFilters]   = useState(false)
  const [statusFilter,   setStatusFilter]   = useState('')
  const [dateFromFilter, setDateFromFilter] = useState('')
  const [dateToFilter,   setDateToFilter]   = useState('')
  const [sigFilter,      setSigFilter]      = useState('')

  useEffect(() => {
    if (userType !== 'employee' && userType !== 'admin') { navigate('/login'); return }

    // Load packages, status codes, post offices in parallel
    Promise.all([
      authFetch(`${API_BASE}/api/packages/full`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      authFetch(`${API_BASE}/api/status-codes`,  { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => []),
      authFetch(`${API_BASE}/api/reports/post-offices`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => []),
    ])
    .then(([pkgs, codes, offices]) => {
      // console.log('PACKAGES:', pkgs)
  // console.log('STATUS CODES:', codes)
      setPackages(Array.isArray(pkgs) ? pkgs : [])
      setStatusCodes(Array.isArray(codes) ? codes : [])
      setPostOffices(Array.isArray(offices) ? offices : [])
      setLoading(false)
    })
    .catch(err => { setError(err.message); setLoading(false) })
  }, [navigate, token, userType])

  async function handleStatusChange(trackingNumber, statusCodeStr) {
    setStatusUpdating(trackingNumber); setError(null)
    try {
      const res = await authFetch(`${API_BASE}/api/employee/packages/${encodeURIComponent(trackingNumber)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status_code: Number(statusCodeStr) }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Could not update status')
      const code = Number(statusCodeStr)
      const name = statusCodes.find(s => s.Status_Code === code)?.Status_Name
      const isFinal = statusCodes.find(s => s.Status_Code === code)?.Is_Final_Status
      setPackages(prev => prev.map(row =>
        row.Tracking_Number === trackingNumber
          ? { ...row, Delivery_Status_Code: code, Status_Name: name ?? row.Status_Name, Is_Final_Status: isFinal }
          : row
      ))
    } catch (err) {
      setError(err.message || 'Status update failed')
    } finally {
      setStatusUpdating(null)
    }
  }

  function toggleExpand(tn) { setExpanded(e => e === tn ? null : tn) }

  function handleLogout(e) {
    e.preventDefault()
    localStorage.removeItem('token'); localStorage.removeItem('user'); localStorage.removeItem('userType')
    navigate('/')
  }

  // Apply filters
const filtered = packages.filter(p => {
  const q = search.toLowerCase()
  const matchSearch = !q ||
    (p.Tracking_Number || '').toLowerCase().includes(q) ||
    (p.Sender_Name     || '').toLowerCase().includes(q) ||
    (p.Recipient_Name  || '').toLowerCase().includes(q) ||
    (p.Sender_Email    || '').toLowerCase().includes(q)
  const matchZone   = !zoneFilter   || String(p.Zone) === zoneFilter
  const matchType   = !typeFilter   || p.Package_Type_Code === typeFilter
  const matchOffice = !officeFilter || String(p.Post_Office_ID) === officeFilter
  const matchStatus = !statusFilter || (p.Status_Name || '').toLowerCase().includes(statusFilter)
  const matchDateFrom = !dateFromFilter || new Date(p.Date_Created) >= new Date(dateFromFilter)
  const matchDateTo   = !dateToFilter   || new Date(p.Date_Created) <= new Date(dateToFilter + 'T23:59:59')
  const matchSig = !sigFilter ||
    (sigFilter === 'yes' ? p.Requires_Signature === 1 : p.Requires_Signature === 0)
  return matchSearch && matchZone && matchType && matchOffice && matchStatus && matchDateFrom && matchDateTo && matchSig
})

  // Split into 3 groups
  const active = filtered.filter(p => {
    const s = (p.Status_Name || '').toLowerCase()
    return !s.includes('deliver') && !s.includes('picked up') && !s.includes('lost') && !s.includes('return') && !s.includes('disposed')
  })
  const completed = filtered.filter(p => {
    const s = (p.Status_Name || '').toLowerCase()
    return s.includes('deliver') || s.includes('picked up') || s.includes('disposed')
  })
  const lostReturned = filtered.filter(p => {
    const s = (p.Status_Name || '').toLowerCase()
    return s.includes('lost') || s.includes('return')
  })

  

  const commonProps = { expanded, onToggle: toggleExpand, statusCodes, onStatusChange: handleStatusChange, statusUpdating }

  return (
    <EmployeeLayout>
    <div className="inventory-page-flat package-list-page">
      <main>
        <div className="inventory-hero">
          <img src={skyline} alt="" />
        </div>

        <div className="inventory-inner">
          <h2>All Packages</h2>
          <p className="inventory-subtitle">Search, filter, and manage package records across the network.</p>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', color: '#991b1b', marginBottom: 20, display: 'flex', justifyContent: 'space-between' }}>
              {error}
              <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b', fontWeight: 700 }}>×</button>
            </div>
          )}

          {/* Summary stats */}
          {!loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Total',       value: packages.length,      color: '#1a1f4e' },
                { label: 'Active',      value: active.length,        color: '#1a1f4e' },
                { label: 'Completed',   value: completed.length,     color: '#1a1f4e' },
                { label: 'Lost/Return', value: lostReturned.length,  color: '#1a1f4e' },
                { label: 'In Transit',  value: packages.filter(p => (p.Status_Name||'').toLowerCase().includes('transit')).length, color: '#1a1f4e' },
                { label: 'Pending',     value: packages.filter(p => (p.Status_Name||'').toLowerCase().includes('pending')).length, color: '#1a1f4e' },
              ].map(s => (
                <div key={s.label} style={{ background: '#fff', border: '1px solid #dbe4ef', borderRadius: 12, padding: '14px 16px', boxShadow: '0 2px 6px rgba(15,23,42,0.04)' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Search + filter toolbar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20, alignItems: 'center' }}>
            <input
              type="text" placeholder="Search tracking #, sender, recipient…"
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: 220, padding: '9px 14px', border: '1px solid #dbe4ef', borderRadius: 10, fontSize: '0.9rem' }}
            />
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{filtered.length} of {packages.length} packages</span>
          </div>

          {/* Filter panel */}
          
            <div style={{ background: '#fff', border: '1px solid #dbe4ef', borderRadius: 14, padding: '18px 20px', marginBottom: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 5, color: '#374151' }}>Zone</label>
                <select value={zoneFilter} onChange={e => setZoneFilter(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #dbe4ef', borderRadius: 8, fontSize: '0.88rem' }}>
                  <option value="">All zones</option>
                  {ZONES.map(z => <option key={z.value} value={z.value}>{z.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 5, color: '#374151' }}>Package Type</label>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #dbe4ef', borderRadius: 8, fontSize: '0.88rem' }}>
                  <option value="">All types</option>
                  <option value="GEN">General Shipping</option>
                  <option value="EXP">Express</option>
                  <option value="OVR">Oversize</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 5, color: '#374151' }}>Post Office</label>
                <select value={officeFilter} onChange={e => setOfficeFilter(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #dbe4ef', borderRadius: 8, fontSize: '0.88rem' }}>
                  <option value="">All offices</option>
                  {postOffices.map(o => <option key={o.Post_Office_ID} value={o.Post_Office_ID}>{o.City}, {o.State}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 5, color: '#374151' }}>Status</label>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #dbe4ef', borderRadius: 8, fontSize: '0.88rem' }}>
                  <option value="">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="transit">In Transit</option>
                  <option value="out for">Out for Delivery</option>
                  <option value="deliver">Delivered</option>
                  <option value="delay">Delayed</option>
                  <option value="return">Returned</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 5, color: '#374151' }}>Date From</label>
                <input type="date" value={dateFromFilter} onChange={e => setDateFromFilter(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #dbe4ef', borderRadius: 8, fontSize: '0.88rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 5, color: '#374151' }}>Date To</label>
                <input type="date" value={dateToFilter} onChange={e => setDateToFilter(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #dbe4ef', borderRadius: 8, fontSize: '0.88rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 5, color: '#374151' }}>Signature</label>
                <select value={sigFilter} onChange={e => setSigFilter(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #dbe4ef', borderRadius: 8, fontSize: '0.88rem' }}>
                  <option value="">All</option>
                  <option value="yes">Required</option>
                  <option value="no">Not required</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button onClick={() => {
                  setZoneFilter(''); setTypeFilter(''); setOfficeFilter(''); setSearch('')
                  setStatusFilter(''); setDateFromFilter(''); setDateToFilter(''); setSigFilter('')
                }}
                  style={{ padding: '8px 16px', background: '#f8fafc', border: '1px solid #dbe4ef', borderRadius: 8, cursor: 'pointer', color: '#64748b' }}>
                  Clear all
                </button>
              </div>
            </div>
          

          {loading ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>Loading packages…</div>
          ) : (
            <>
              <PackageTable title="Active Packages"    packages={active}       color="#1d4ed8" {...commonProps} />
              <PackageTable title="Completed"          packages={completed}    color="#059669" collapsible {...commonProps} />
              <PackageTable title="Lost & Returned"   packages={lostReturned} color="#dc2626" collapsible {...commonProps} />
            </>
          )}
        </div>
      </main>
    </div>
    </EmployeeLayout>
  )
}