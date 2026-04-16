import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './css/home.css'
import './css/employee_home.css'
import skyline from '../assets/houston-skyline.jpeg'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function getStoredEmployee() {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}

function getStoredEmployeeFullName() {
  try {
    const u = getStoredEmployee()
    if (!u) return null
    const first = (u.First_Name ?? u.first_name ?? '').toString().trim()
    const last  = (u.Last_Name  ?? u.last_name  ?? '').toString().trim()
    return [first, last].filter(Boolean).join(' ') || null
  } catch { return null }
}

function getStoredEmployeeRoleId() {
  try {
    const u = getStoredEmployee()
    if (!u) return null
    const roleId = Number(u.Role_ID ?? u.role_id)
    return Number.isFinite(roleId) ? roleId : null
  } catch { return null }
}

function getStoredEmployeeId() {
  try {
    const u = getStoredEmployee()
    if (!u) return null
    return Number(u.Employee_ID ?? u.employee_id) || null
  } catch { return null }
}

const NAV_ITEMS = [
  { label: 'Dashboard',         path: '/employee_home',                section: 'main'  },
  { label: 'Packages',          path: '/package_list',                 section: 'main'  },
  { label: 'Add Package',       path: '/employee/add-package',         section: 'main'  },
  { label: 'Package Pickup',    path: '/employee/package-pickup',      section: 'main'  },
  { label: 'Track a Package',   path: '/package_tracking',             section: 'main'  },
  // { label: 'Inventory',         path: '/inventory',                    section: 'main'  },
  { label: 'Support Tickets',   path: '/employee-support',             section: 'main'  },
  { label: 'Customers',         path: '/customers',                    section: 'main'  },
  { label: 'Profile',           path: '/profile',                      section: 'main'  },
  { label: 'Calculator',        path: '/price_calculator',             section: 'main'  },
  { label: 'Employees',         path: '/employees',                    section: 'admin' },
  { label: 'Register Employee', path: '/admin-register',               section: 'admin' },
  { label: 'Employee Report',   path: '/reports/employee-performance', section: 'admin' },
  { label: 'Revenue Report',    path: '/revenue-report',               section: 'admin' },
  { label: 'Ticket Report',     path: '/tickets_employees',            section: 'admin' },
]
const DASHBOARD_CARDS = [
  { title: 'Packages',          desc: 'Browse and manage all package records.',                          path: '/package_list',                 btnLabel: 'View packages',      section: 'main'  },
  { title: 'Add Package',       desc: 'Register a shipment, calculate price, issue a tracking number.', path: '/employee/add-package',         btnLabel: 'Add package',        section: 'main'  },
  { title: 'Package Pickup',    desc: 'Record when a customer picks up their package at the office.',   path: '/employee/package-pickup',      btnLabel: 'Package for pickup', section: 'main'  },
  // { title: 'Inventory',         desc: 'Check product and supply levels across all locations.',          path: '/inventory',                    btnLabel: 'View inventory',     section: 'main'  },
  { title: 'Support Tickets',   desc: 'Review and respond to customer support requests.',               path: '/employee-support',             btnLabel: 'Open tickets',       section: 'main'  },
  { title: 'Customers',         desc: 'Search and manage customer accounts.',                           path: '/customers',                    btnLabel: 'View customers',     section: 'main'  },
  { title: 'Employees',         desc: 'View and manage all employee accounts.',                         path: '/employees',                    btnLabel: 'View employees',     section: 'admin' },
  { title: 'Register Employee', desc: 'Create a new employee account.',                                 path: '/admin-register',               btnLabel: 'Add employee',       section: 'admin' },
  { title: 'Employee Report',   desc: 'View performance rankings and employee metrics.',                path: '/reports/employee-performance', btnLabel: 'View report',        section: 'admin' },
  { title: 'Revenue Report',    desc: 'Sort by pricing type and view revenue reports.',                 path: '/revenue-report',               btnLabel: 'View report',        section: 'admin' },
  { title: 'Ticket Report',     desc: 'View ticket records and support analytics.',                     path: '/tickets_employees',            btnLabel: 'View report',        section: 'admin' },
]

// Shared stat card 
function StatCard({ label, value, color = '#1a1f4e', onClick, linkLabel }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: '20px 24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.05)', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
      <div style={{ fontSize: '2rem', fontWeight: 800, color }}>{value ?? '—'}</div>
      {onClick && (
        <button type="button" onClick={onClick}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: '#9b1c1c', textAlign: 'left' }}>
          {linkLabel ?? 'View more →'}
        </button>
      )}
    </div>
  )
}

//  Small package row 
function PkgRow({ pkg }) {
  const s = (pkg.Status_Name || '').toLowerCase()
  const badgeColor = s.includes('transit') ? '#1d4ed8' : s.includes('deliver') ? '#059669' : s.includes('pending') ? '#d97706' : '#64748b'
  const badgeBg    = s.includes('transit') ? '#eff6ff' : s.includes('deliver') ? '#f0fdf4' : s.includes('pending') ? '#fffbeb' : '#f8fafc'
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
      <code style={{ fontSize: '0.8rem', color: '#374151', fontWeight: 600 }}>{pkg.Tracking_Number}</code>
      <span style={{ background: badgeBg, color: badgeColor, borderRadius: 20, padding: '2px 10px', fontSize: '0.75rem', fontWeight: 700 }}>
        {pkg.Status_Name || '—'}
      </span>
    </div>
  )
}


//  ADMIN DASHBOARD 
function AdminDashboard({ navigate, token }) {
  const [packages, setPackages] = useState([])
  const [tickets,  setTickets]  = useState([])
  const [revenue,  setRevenue]  = useState(0)
  const [loading,  setLoading]  = useState(true)

useEffect(() => {
  Promise.all([
    fetch(`${API_BASE}/api/packages`,        { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => []),
    fetch(`${API_BASE}/api/support-tickets`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => []),
  ]).then(([pkgs, tix]) => {
    setPackages(Array.isArray(pkgs) ? pkgs : [])
    setTickets(Array.isArray(tix)   ? tix  : [])
    setRevenue(Array.isArray(pkgs)
      ? pkgs.reduce((s, p) => s + parseFloat(p.Price || 0), 0)
      : 0
    )
    setLoading(false)
  })
}, [token])

  const total     = packages.length
  const inTransit = packages.filter(p => (p.Status_Name || '').toLowerCase().includes('transit')).length
  const pending   = packages.filter(p => (p.Status_Name || '').toLowerCase().includes('pending')).length
  const delivered = packages.filter(p => (p.Status_Name || '').toLowerCase().includes('deliver')).length
  const lost      = packages.filter(p => (p.Status_Name || '').toLowerCase().includes('lost')).length

  return (
    <div style={{ padding: '32px 32px 64px' }}>
      <h2 style={{ margin: '0 0 18px', fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Today's Overview
      </h2>

      {loading ? (
        <div style={{ color: '#94a3b8', fontSize: '0.88rem' }}>Loading...</div>
      ) : (
        <>
          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
            <StatCard label="Total Packages" value={total}     color="#1a1f4e" onClick={() => navigate('/package_list')} />
            <StatCard label="In Transit"     value={inTransit} color="#0891b2" onClick={() => navigate('/package_list')} />
            <StatCard label="Pending"        value={pending}   color="#d97706" onClick={() => navigate('/package_list')} />
            <StatCard label="Delivered"      value={delivered} color="#059669" onClick={() => navigate('/package_list')} />
            <StatCard label="Lost"           value={lost}      color="#dc2626" onClick={() => navigate('/package_list')} />
            <StatCard
              label="Total Revenue"
              value={`$${revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              color="#7c3aed"
              onClick={() => navigate('/revenue-report')}
            />
          </div>

          {/* 3 col: recent packages + recent tickets + operations hub */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 32 }}>

            {/* Recent packages */}
            <div style={{ background: '#fff', borderRadius: 14, padding: '20px 24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>Recent Packages</span>
                <button type="button" onClick={() => navigate('/package_list')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.78rem', color: '#9b1c1c', fontWeight: 600 }}>
                  View all →
                </button>
              </div>
              {packages.slice(0, 6).map(p => <PkgRow key={p.Tracking_Number} pkg={p} />)}
            </div>

            {/* Recent tickets */}
            <div style={{ background: '#fff', borderRadius: 14, padding: '20px 24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>Recent Tickets</span>
                <button type="button" onClick={() => navigate('/employee-support')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.78rem', color: '#9b1c1c', fontWeight: 600 }}>
                  View all →
                </button>
              </div>
              {tickets.length === 0 ? (
                <div style={{ color: '#94a3b8', fontSize: '0.82rem', padding: '12px 0' }}>No tickets found.</div>
              ) : tickets.slice(0, 6).map((t, i) => {
                const open = t.Ticket_Status_Code === 0
                return (
                  <div key={t.Ticket_ID ?? i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '0.8rem', color: '#374151', fontWeight: 600 }}>
                      #{t.Ticket_ID} — {
                        t.Issue_Type === 1 ? 'Damaged Package' :
                        t.Issue_Type === 2 ? 'Delivery Delay' :
                        t.Issue_Type === 3 ? 'Wrong Address' :
                        `Issue #${t.Issue_Type}`
                      }
                    </span>
                    <span style={{ background: open ? '#fffbeb' : '#f0fdf4', color: open ? '#d97706' : '#059669', borderRadius: 20, padding: '2px 10px', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, marginLeft: 8 }}>
                      {open ? 'Open' : 'Resolved'}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Operations Hub */}
            <div style={{ background: '#fff', borderRadius: 14, padding: '20px 24px', border: '1px solid #f0e8d8', boxShadow: '0 2px 8px rgba(15,23,42,0.05)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>Operations Hub</span>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5, flex: 1 }}>
                Employee performance, revenue reports, and ticket analytics all in one place.
              </p>
              <div>
                <button
                  type="button"
                  onClick={() => navigate('/reports/employee-performance')}
                  style={{ background: '#9b1c1c', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.target.style.background = '#7f1d1d'}
                  onMouseLeave={e => e.target.style.background = '#9b1c1c'}
                >
                  Open Operations Hub
                </button>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  )
}

// CLERK DASHBOARD 
function ClerkDashboard({ navigate, token }) {
  const [packages, setPackages] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    fetch(`${API_BASE}/api/packages`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setPackages(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [token])

  const pending   = packages.filter(p => (p.Status_Name || '').toLowerCase().includes('pending')).length
  const inTransit = packages.filter(p => (p.Status_Name || '').toLowerCase().includes('transit')).length
  const recent    = packages.slice(0, 5)

  return (
    <div style={{ padding: '32px 32px 64px' }}>
      <h2 style={{ margin: '0 0 18px', fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Today's Overview
      </h2>

      {loading ? (
        <div style={{ color: '#94a3b8', fontSize: '0.88rem' }}>Loading...</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
            <StatCard label="Total Packages" value={packages.length} color="#1a1f4e" onClick={() => navigate('/package_list')} />
            <StatCard label="Pending"        value={pending}         color="#d97706" onClick={() => navigate('/package_list')} />
            <StatCard label="In Transit"     value={inTransit}       color="#0891b2" onClick={() => navigate('/package_list')} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
            {/* Recent packages */}
            <div style={{ background: '#fff', borderRadius: 14, padding: '20px 24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>Recent Packages</span>
                <button type="button" onClick={() => navigate('/package_list')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.78rem', color: '#9b1c1c', fontWeight: 600 }}>
                  View all →
                </button>
              </div>
              {recent.map(p => <PkgRow key={p.Tracking_Number} pkg={p} />)}
            </div>

            {/* Support tickets quick actions */}
            <div style={{ background: '#fff', borderRadius: 14, padding: '20px 24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.05)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', marginBottom: 16 }}>Support Tickets</div>
              <p style={{ margin: '0 0 16px', fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                Review and respond to open customer support requests assigned to you.
              </p>
              <button type="button" className="btn primary" onClick={() => navigate('/employee-support')}>
                Open tickets
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

//  DRIVER DASHBOARD 
function DriverDashboard({ navigate, token }) {
  const employeeId = getStoredEmployeeId()
  const [shipments, setShipments] = useState([])
  const [packages,  setPackages]  = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    fetch(`${API_BASE}/api/packages`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setPackages(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [token])

  const active    = packages.filter(p => {
    const s = (p.Status_Name || '').toLowerCase()
    return s.includes('transit') || s.includes('out for') || s.includes('pending')
  })
  const delivered = packages.filter(p => (p.Status_Name || '').toLowerCase().includes('deliver')).length

  return (
    <div style={{ padding: '32px 32px 64px' }}>
      <h2 style={{ margin: '0 0 18px', fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        My Shipments
      </h2>

      {loading ? (
        <div style={{ color: '#94a3b8', fontSize: '0.88rem' }}>Loading...</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
            <StatCard label="Active Shipments" value={active.length}  color="#1a1f4e" onClick={() => navigate('/package_list')} />
            <StatCard label="Delivered"        value={delivered}      color="#059669" onClick={() => navigate('/package_list')} />
            <StatCard label="Total Packages"   value={packages.length} color="#0891b2" onClick={() => navigate('/package_list')} />
          </div>

          {/* Active shipments list */}
          <div style={{ background: '#fff', borderRadius: 14, padding: '20px 24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.05)', marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>Active & In-Progress Shipments</span>
              <button type="button" onClick={() => navigate('/package_list')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.78rem', color: '#9b1c1c', fontWeight: 600 }}>
                View all →
              </button>
            </div>
            {active.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8', fontSize: '0.85rem' }}>No active shipments.</div>
            ) : (
              active.slice(0, 8).map(p => <PkgRow key={p.Tracking_Number} pkg={p} />)
            )}
          </div>
        </>
      )}

    </div>
  )
}

//  MAIN COMPONENT 
export default function EmployeeHome() {
  const navigate        = useNavigate()
  const roleId          = getStoredEmployeeRoleId()
  const isAdmin         = roleId === 5
  const isDriver        = roleId === 2
  const isClerk         = roleId === 1
  const name            = getStoredEmployeeFullName()
  const token           = localStorage.getItem('token')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  function handleLogout(e) {
    e.preventDefault()
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userType')
    navigate('/')
  }

  const mainNav  = NAV_ITEMS.filter(n => n.section === 'main')
  const adminNav = NAV_ITEMS.filter(n => n.section === 'admin')

  const dashLabel = isAdmin ? 'Administrator Dashboard' : isDriver ? 'Driver Dashboard' : 'Clerk Dashboard'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg, #eae6de)' }}>

      {/* ── TOP HEADER ── */}
      <header className="site-header" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', width: '100%', padding: '0 24px', boxSizing: 'border-box', height: '56px' }}>

          {/* Left: hamburger */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button onClick={() => setSidebarOpen(o => !o)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 5, padding: '4px 0' }}>
              <span style={{ display: 'block', width: 20, height: 2, background: '#fff', borderRadius: 2 }} />
              <span style={{ display: 'block', width: 20, height: 2, background: '#fff', borderRadius: 2 }} />
              <span style={{ display: 'block', width: 20, height: 2, background: '#fff', borderRadius: 2 }} />
            </button>
          </div>

          {/* Center: logo */}
          <Link className="logo" to="/" style={{ whiteSpace: 'nowrap' }}>
            National Postal Service
          </Link>

          {/* Right: role + logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, justifyContent: 'flex-end' }}>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
              {isAdmin ? 'Admin' : isDriver ? 'Driver' : 'Clerk'} — {name ?? ''}
            </span>
            <a href="#" onClick={handleLogout} style={{ color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem' }}>Logout</a>
          </div>

        </div>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>

        {/* ── SIDEBAR ── */}
          <aside 
            style={{ 
              width: sidebarOpen ? 230 : 0,
              opacity: sidebarOpen ? 1 : 0,
              background: '#1a1f4e',
              flexShrink: 0,
              position: 'sticky',
              top: 56,
              height: 'calc(100vh - 56px)',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              transition: 'width 0.3s ease, opacity 0.3s ease',
            }}
          >
            <div style={{ width: 230}}>
              <div style={{ flex: 1, padding: '20px 0' }}>
                <div style={{ padding: '0 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 8 }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#2d3a8c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: 10 }}>
                    {name?.charAt(0) ?? 'E'}
                  </div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.88rem' }}>{name ?? 'Employee'}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.73rem', marginTop: 2 }}>
                    {isAdmin ? 'Administrator' : isDriver ? 'Driver' : 'Clerk'}
                  </div>
                </div>

                <div style={{ paddingTop: 8 }}>
                  <div style={{ padding: '0 20px 6px', color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Navigation
                  </div>
                  {mainNav.map(item => {
                    const active = item.path === '/employee_home'
                    return (
                      <a key={item.path} href="#"
                        onClick={e => { e.preventDefault(); navigate(item.path) }}
                        style={{ display: 'block', padding: '8px 20px', color: active ? '#fff' : 'rgba(255,255,255,0.65)', textDecoration: 'none', fontSize: '0.86rem', fontWeight: active ? 700 : 400, background: active ? 'rgba(255,255,255,0.1)' : 'none', borderLeft: active ? '3px solid #c8922a' : '3px solid transparent', transition: 'all 0.15s' }}
                        onMouseEnter={e => { if (!active) { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}}
                        onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; e.currentTarget.style.background = 'none' }}}
                      >
                        {item.label}
                      </a>
                    )
                  })}
                </div>

                {isAdmin && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ padding: '0 20px 6px', color: '#c8922a', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      Admin Tools
                    </div>
                    {adminNav.map(item => (
                      <a key={item.path} href="#"
                        onClick={e => { e.preventDefault(); navigate(item.path) }}
                        style={{ display: 'block', padding: '8px 20px', color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontSize: '0.86rem', fontWeight: 400, borderLeft: '3px solid transparent', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; e.currentTarget.style.background = 'none' }}
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <a href="#" onClick={handleLogout}
                  style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontSize: '0.82rem', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.target.style.color = '#fca5a5'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.45)'}
                >
                  Sign out
                </a>
              </div>
            </div>
          </aside>

        {/* ── MAIN CONTENT ── */}
        <div style={{ flex: 1, overflowX: 'hidden' }}>

          {/* Hero */}
          <div style={{ position: 'relative', height: 160, overflow: 'hidden' }}>
            <img src={skyline} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 60%', filter: 'brightness(0.4)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(26,31,78,0.85), rgba(26,31,78,0.3))' }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 36px' }}>
              <div>
                <div style={{ color: '#c8922a', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
                  {dashLabel}
                </div>
                <h1 style={{ margin: 0, color: '#fff', fontSize: 'clamp(1.2rem, 2.5vw, 1.7rem)', fontWeight: 700 }}>
                  Welcome back, {name ?? 'Employee'}
                </h1>
                <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                  Tools for post office staff — packages and customer records.
                </p>
              </div>
            </div>
          </div>

          {/* Role-based dashboard */}
          {isAdmin  && <AdminDashboard  navigate={navigate} token={token} />}
          {isDriver && <DriverDashboard navigate={navigate} token={token} />}
          {isClerk  && <ClerkDashboard  navigate={navigate} token={token} />}
          {!isAdmin && !isDriver && !isClerk && <ClerkDashboard navigate={navigate} token={token} />}

        </div>
      </div>

      {/* ── FOOTER ── */}
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