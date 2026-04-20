import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './css/home.css'
import EmployeeLayout from './EmployeeLayout'

const envApi = import.meta.env.VITE_API_URL
const API_BASE =
  envApi != null && String(envApi).trim() !== ''
    ? String(envApi).replace(/\/$/, '')
    : import.meta.env.DEV ? '' : 'http://localhost:5000'

function fmtInt(n) { return parseInt(n || 0).toLocaleString('en-US') }
function fmtDec(n) { return parseFloat(n || 0).toFixed(1) }
function fmtDate(d) { return d ? new Date(d).toLocaleDateString() : '—' }
function authH() { return { Authorization: `Bearer ${localStorage.getItem('token')}` } }

const STATUS_LABEL = { 0: 'Open', 1: 'Pending', 2: 'Closed' }
const STATUS_COLOR = { 0: '#dc2626', 1: '#d97706', 2: '#16a34a' }
const STATUS_BG    = { 0: '#fef2f2', 1: '#fffbeb', 2: '#f0fdf4' }

function StatCard({ label, value, color = '#1a1f4e', sub }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '18px 20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 800, color }}>{value}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 }}>
      <button onClick={() => onPage(page - 1)} disabled={page <= 1}
        style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: 6, background: page <= 1 ? '#f8fafc' : '#fff', cursor: page <= 1 ? 'not-allowed' : 'pointer', color: page <= 1 ? '#94a3b8' : '#374151', fontSize: '0.84rem' }}>
        Prev
      </button>
      <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Page {page} of {totalPages}</span>
      <button onClick={() => onPage(page + 1)} disabled={page >= totalPages}
        style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: 6, background: page >= totalPages ? '#f8fafc' : '#fff', cursor: page >= totalPages ? 'not-allowed' : 'pointer', color: page >= totalPages ? '#94a3b8' : '#374151', fontSize: '0.84rem' }}>
        Next
      </button>
    </div>
  )
}

const ISSUE_TYPES = ['failed transaction', 'payment issue', 'delivery issue', 'other']
const STATUS_OPTIONS = [{ value: '0', label: 'Open' }, { value: '1', label: 'Pending' }, { value: '2', label: 'Closed' }]

export default function TicketReport() {
  const navigate = useNavigate()

  const [search,    setSearch]    = useState('')
  const [dateFrom,  setDateFrom]  = useState('')
  const [dateTo,    setDateTo]    = useState('')
  const [status,    setStatus]    = useState('')
  const [issueType, setIssueType] = useState('')

  const [tableData, setTableData] = useState({ data: [], total: 0, page: 1, totalPages: 1 })
  const [stats,     setStats]     = useState(null)
  const [page,      setPage]      = useState(1)
  const [loading,   setLoading]   = useState(false)

  function buildParams(p = page) {
    const params = new URLSearchParams({ page: p, limit: 20 })
    if (search)    params.set('search',     search)
    if (dateFrom)  params.set('date_from',  dateFrom)
    if (dateTo)    params.set('date_to',    dateTo)
    if (status !== '') params.set('status', status)
    if (issueType) params.set('issue_type', issueType)
    return params
  }

  function fetchAll(p = 1) {
    setLoading(true)
    Promise.all([
      fetch(`${API_BASE}/api/tickets/report?${buildParams(p)}`,       { headers: authH() }).then(r => r.json()),
      fetch(`${API_BASE}/api/tickets/report/stats?${buildParams(p)}`, { headers: authH() }).then(r => r.json()),
    ]).then(([table, s]) => {
      setTableData(table)
      setStats(s)
      setPage(p)
    }).catch(() => {}).finally(() => setLoading(false))
  }

  function handleApply() { fetchAll(1) }
  function handleClear() {
    setSearch(''); setDateFrom(''); setDateTo(''); setStatus(''); setIssueType('')
  }

  useEffect(() => { fetchAll(1) }, [])

  const maxIssueCount = Math.max(...(stats?.by_issue?.map(x => Number(x.Count || 0)) || [1]), 1)

  return (
    <EmployeeLayout>
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg, #eae6de)' }}>
      <div style={{ maxWidth: 1280, width: '100%', margin: '0 auto', padding: '32px 28px 64px', flex: 1, boxSizing: 'border-box' }}>

        <div style={{ marginBottom: 28 }}>
          <h1 style={{ margin: '0 0 4px', fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Ticket Report</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Support ticket records and analytics</p>
        </div>

        {/* Filters */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '24px 28px', border: '1px solid #e2e8f0', marginBottom: 24, boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Filters</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>

            <div  style={{ gridColumn: 'span 2' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: 6 }}>Date Range</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                  style={{ flex: 1, padding: '7px 8px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: '0.82rem', outline: 'none' }} />
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                  style={{ flex: 1, padding: '7px 8px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: '0.82rem', outline: 'none' }} />
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: 6 }}>Status</div>
              <select value={status} onChange={e => setStatus(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.86rem', outline: 'none', background: '#fff' }}>
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: 6 }}>Issue Type</div>
              <select value={issueType} onChange={e => setIssueType(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.86rem', outline: 'none', background: '#fff' }}>
                <option value="">All Types</option>
                {ISSUE_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: 6 }}>Employee</div>
              <input type="text" placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.86rem', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={handleClear} style={{ padding: '8px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', fontSize: '0.84rem', color: '#64748b' }}>Clear</button>
            <button onClick={handleApply} style={{ padding: '8px 20px', background: '#1a1f4e', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.84rem', fontWeight: 700 }}>Apply</button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
              <StatCard label="Total Tickets"          value={fmtInt(stats.summary?.Total_Tickets)} />
              <StatCard label="Resolved"               value={fmtInt(stats.summary?.Resolved)}      color="#16a34a" />
              <StatCard label="Pending"                value={fmtInt(stats.summary?.Pending)}        color="#d97706" />
              <StatCard label="Open"                   value={fmtInt(stats.summary?.Open)}           color="#dc2626" />
              <StatCard label="Avg Resolved / Week"    value={fmtDec(stats.summary?.Avg_Resolved_Per_Week)} sub="all-time average" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Tickets by Issue Type</div>
                {stats.by_issue?.map((row, i) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.82rem' }}>
                      <span style={{ fontWeight: 600 }}>{row.Issue_Type}</span>
                      <span style={{ color: '#1a1f4e', fontWeight: 700 }}>{fmtInt(row.Count)}</span>
                    </div>
                    <div style={{ background: '#f1f5f9', borderRadius: 4, height: 8 }}>
                      <div style={{ width: `${(Number(row.Count) / maxIssueCount) * 100}%`, background: '#1a1f4e', height: '100%', borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Tickets by Status</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                  <thead><tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                    {['Status', 'Count'].map(h => (
                      <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 700, color: '#374151' }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {stats.by_status?.map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                        <td style={{ padding: '8px 10px' }}>
                          <span style={{ background: STATUS_BG[row.Status_Code], color: STATUS_COLOR[row.Status_Code], padding: '2px 10px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 700 }}>
                            {STATUS_LABEL[row.Status_Code] ?? row.Status_Code}
                          </span>
                        </td>
                        <td style={{ padding: '8px 10px', fontWeight: 700 }}>{fmtInt(row.Count)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Table */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>All Ticket Records</span>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{fmtInt(tableData.total)} records</span>
          </div>
          {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading...</div> : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                  <thead><tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    {['Ticket ID', 'Date Created', 'Date Updated', 'Employee', 'Issue Type', 'Status', 'Package ID', 'User ID', 'Resolution Note'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {tableData.data?.length === 0 ? (
                      <tr><td colSpan={9} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No records found</td></tr>
                    ) : tableData.data?.map((row, i) => (
                      <tr key={row.Ticket_ID} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                        <td style={{ padding: '9px 14px', color: '#64748b', fontSize: '0.78rem' }}>#{row.Ticket_ID}</td>
                        <td style={{ padding: '9px 14px' }}>{fmtDate(row.Date_Created)}</td>
                        <td style={{ padding: '9px 14px' }}>{fmtDate(row.Date_Updated)}</td>
                        <td style={{ padding: '9px 14px' }}>{row.Employee_Name || '—'}</td>
                        <td style={{ padding: '9px 14px' }}>{row.Issue_Type_Name || '—'}</td>
                        <td style={{ padding: '9px 14px' }}>
                          <span style={{ background: STATUS_BG[row.Ticket_Status_Code], color: STATUS_COLOR[row.Ticket_Status_Code], padding: '2px 10px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 700 }}>
                            {STATUS_LABEL[row.Ticket_Status_Code] ?? row.Ticket_Status_Code}
                          </span>
                        </td>
                        <td style={{ padding: '9px 14px' }}>{row.Package_ID ? <code style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: 4, fontSize: '0.78rem' }}>{row.Package_ID}</code> : '—'}</td>
                        <td style={{ padding: '9px 14px' }}>{row.User_ID || '—'}</td>
                        <td style={{ padding: '9px 14px', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.Resolution_Note || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: '16px 24px' }}>
                <Pagination page={tableData.page} totalPages={tableData.totalPages} onPage={p => fetchAll(p)} />
              </div>
            </>
          )}
        </div>

      </div>
    </div>
    </EmployeeLayout>
  )
}
