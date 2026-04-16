// import EmployeeLayout from './EmployeeLayout'



import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './css/home.css'
import './css/employee_home.css'

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

const NAV_ITEMS = [
  { label: 'Dashboard',         path: '/employee_home',             section: 'main'  },
  { label: 'Packages',          path: '/package_list',              section: 'main'  },
  { label: 'Add Package',       path: '/employee/add-package',      section: 'main'  },
  { label: 'Package Pickup',    path: '/employee/package-pickup',   section: 'main'  },
  { label: 'Track a Package',   path: '/package_tracking',          section: 'main'  },
  { label: 'Support Tickets',   path: '/employee-support',          section: 'main'  },
  { label: 'Customers',         path: '/customers',                 section: 'main'  },
  { label: 'Profile',           path: '/profile',                   section: 'main'  },
  { label: 'Calculator',        path: '/price_calculator',          section: 'main'  },
  { label: 'Employees',         path: '/employees',                 section: 'admin' },
  { label: 'Register Employee', path: '/admin-register',            section: 'admin' },
  { label: 'Revenue Report',    path: '/revenue-report',            section: 'admin' },
  { label: 'Satisfaction Report', path: '/office-satisfaction',     section: 'admin' },
  { label: 'Ticket Report',     path: '/tickets_employees',         section: 'admin' },
]

export default function EmployeeLayout({ children }) {
  const navigate      = useNavigate()
  const roleId        = getStoredEmployeeRoleId()
  const isAdmin       = roleId === 5
  const isDriver      = roleId === 2
  const isClerk       = roleId === 1
  const name          = getStoredEmployeeFullName()
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

  const roleLabel = isAdmin ? 'Admin' : isDriver ? 'Driver' : 'Clerk'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg, #eae6de)' }}>

      {/* ── HEADER ── */}
      <header className="site-header" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          width: '100%',
          padding: '0 24px',
          boxSizing: 'border-box',
          height: '56px',
        }}>
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
              {roleLabel} — {name ?? ''}
            </span>
            <a href="#" onClick={handleLogout}
              style={{ color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem' }}>
              Logout
            </a>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>

        {/* ── SIDEBAR ── */}
        {sidebarOpen && (
          <aside style={{
            width: 230,
            background: '#1a1f4e',
            flexShrink: 0,
            position: 'sticky',
            top: 56,
            height: 'calc(100vh - 56px)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{ flex: 1, padding: '20px 0' }}>

              {/* Employee info */}
              <div style={{ padding: '0 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 8 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%',
                  background: '#2d3a8c',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: 10,
                }}>
                  {name?.charAt(0) ?? 'E'}
                </div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.88rem' }}>{name ?? 'Employee'}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.73rem', marginTop: 2 }}>{roleLabel}</div>
              </div>

              {/* Main nav */}
              <div style={{ paddingTop: 8 }}>
                <div style={{ padding: '0 20px 6px', color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Navigation
                </div>
                {mainNav.map(item => (
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

              {/* Admin nav */}
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

            {/* Sign out */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <a href="#" onClick={handleLogout}
                style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontSize: '0.82rem', transition: 'color 0.15s' }}
                onMouseEnter={e => e.target.style.color = '#fca5a5'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.45)'}
              >
                Sign out
              </a>
            </div>
          </aside>
        )}

        {/* ── PAGE CONTENT ── */}
        <div style={{ flex: 1, overflowX: 'hidden' }}>
          {children}
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