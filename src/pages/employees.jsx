import { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './css/home.css'
import './css/packages.css'
import { authFetch } from '../authFetch'

// In dev, prefer same-origin `/api` so Vite's proxy can reach the backend without CORS surprises.
const envApi = import.meta.env.VITE_API_URL
const API_BASE =
  envApi != null && String(envApi).trim() !== ''
    ? String(envApi).replace(/\/$/, '')
    : import.meta.env.DEV
      ? ''
      : 'http://localhost:5000'

function getAuthHeader() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function getStoredEmployeeRoleId() {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    const u = JSON.parse(raw)
    const roleId = Number(u.Role_ID ?? u.role_id)
    return Number.isFinite(roleId) ? roleId : null
  } catch {
    return null
  }
}

export default function EmployeesPage() {
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

  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [officeFilter, setOfficeFilter] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const res = await authFetch(`${API_BASE}/api/admin/employees`, {
          headers: { ...getAuthHeader() },
        })
        const text = await res.text()
        let data = {}
        try {
          if (text) data = JSON.parse(text)
        } catch {
          /* non-JSON body (e.g. HTML error page) */
        }
        if (!res.ok) {
          const hint =
            res.status === 403
              ? ' If you were just granted admin access, log out and log in again so your token includes Role_ID 5.'
              : ''
          throw new Error(
            (data && data.message) || text?.slice(0, 180) || `Request failed (HTTP ${res.status})` + hint
          )
        }
        if (!cancelled) setEmployees(Array.isArray(data?.employees) ? data.employees : [])
      } catch (e) {
        if (!cancelled) setError(String(e?.message || e))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (isAdmin) load()
    else setLoading(false)

    return () => {
      cancelled = true
    }
  }, [isAdmin])

  const roleOptions = useMemo(() => {
    const set = new Set()
    for (const e of employees) if (e?.Role_Name) set.add(e.Role_Name)
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [employees])

  const officeOptions = useMemo(() => {
    const set = new Set()
    for (const e of employees) if (e?.Post_Office_Street) set.add(e.Post_Office_Street)
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [employees])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return employees.filter((e) => {
      // backend already filters Is_Active=1; keep defensive
      if (Number(e?.Is_Active) !== 1) return false
      if (roleFilter && e?.Role_Name !== roleFilter) return false
      if (officeFilter && e?.Post_Office_Street !== officeFilter) return false
      if (!q) return true
      const first = String(e?.First_Name || '').toLowerCase()
      const last = String(e?.Last_Name || '').toLowerCase()
      return first.includes(q) || last.includes(q)
    })
  }, [employees, search, roleFilter, officeFilter])

  async function deactivateEmployee(employeeId, displayName) {
    const ok = window.confirm(`Are you sure to remove ${displayName || 'this employee'}?`)
    if (!ok) return

    try {
      const res = await authFetch(`${API_BASE}/api/admin/employees/${employeeId}/deactivate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      })
      const text = await res.text()
      let data = {}
      try {
        if (text) data = JSON.parse(text)
      } catch {
        /* ignore */
      }
      if (!res.ok) throw new Error(data?.message || text?.slice(0, 180) || `Request failed (HTTP ${res.status})`)

      setEmployees((prev) => prev.filter((e) => e.Employee_ID !== employeeId))
    } catch (e) {
      window.alert(String(e?.message || e))
    }
  }

  if (!isAdmin) {
    return (
      <div>
        <header className="site-header">
          <div className="header-inner">
            <Link className="logo" to="/">National Postal Service</Link>
            <nav className="top-nav">
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/employee_home') }}>Dashboard</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/package_list') }}>Packages</a>
            {/* <a href="#" onClick={(e) => { e.preventDefault(); navigate('/inventory') }}>Inventory</a> */}
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/customers') }}>Customers</a>
          </nav>
          </div>
        </header>
        <main style={{ padding: 24 }}>
          <p className="state-msg">Access denied. Admin role required.</p>
        </main>
      </div>
    )
  }

  return (
    <div>
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

      <main style={{ paddingTop: 24 }}>
        <section className="services" style={{ paddingTop: 0 }}>
          <h2 style={{ marginBottom: 12 }}>Employees</h2>

          <div className="controls-bar">
            <input
              type="text"
              className="search-input"
              placeholder="Search first or last name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select className="filter-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="">Role: All</option>
              {roleOptions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            <select className="filter-select" value={officeFilter} onChange={(e) => setOfficeFilter(e.target.value)}>
              <option value="">Post office: All</option>
              {officeOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <span className="result-count">{filtered.length} employees</span>
          </div>

          {loading ? (
            <p className="state-msg">Loading employees...</p>
          ) : error ? (
            <p className="state-msg">{error}</p>
          ) : filtered.length === 0 ? (
            <p className="state-msg">No employees match your filters.</p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Post office street</th>
                    <th>Department</th>
                    <th>First</th>
                    <th>Last</th>
                    <th>Email</th>
                    <th>Sex</th>
                    <th>Phone</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e) => {
                    const employeeId = e.Employee_ID
                    const name = `${e.First_Name || ''} ${e.Last_Name || ''}`.trim()
                    return (
                      <tr key={employeeId}>
                        <td><code>{employeeId}</code></td>
                        <td>{e.Post_Office_Street || '—'}</td>
                        <td>{e.Department_Name || '—'}</td>
                        <td>{e.First_Name || '—'}</td>
                        <td>{e.Last_Name || '—'}</td>
                        <td>{e.Email_Address || '—'}</td>
                        <td>{e.Sex || '—'}</td>
                        <td>{e.Phone_Number || '—'}</td>
                        <td style={{ width: 44, textAlign: 'right' }}>
                          <button
                            type="button"
                            className="button"
                            title="Deactivate employee"
                            style={{ padding: '6px 10px', marginTop: 0 }}
                            onClick={() => deactivateEmployee(employeeId, name)}
                          >
                            🗑
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

