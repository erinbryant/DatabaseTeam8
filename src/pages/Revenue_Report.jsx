import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './css/home.css'
import EmployeeLayout from './EmployeeLayout'

const envApi = import.meta.env.VITE_API_URL
const API_BASE =
  envApi != null && String(envApi).trim() !== ''
    ? String(envApi).replace(/\/$/, '')
    : import.meta.env.DEV ? '' : 'http://localhost:5000'

function fmt(n)    { return parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
function fmtInt(n) { return parseInt(n || 0).toLocaleString('en-US') }
function fmtDate(d){ return d ? new Date(d).toLocaleDateString() : '—' }
function authH()   { return { Authorization: `Bearer ${localStorage.getItem('token')}` } }

function SearchableSelect({ options, value, onChange, placeholder = 'All', labelKey = 'label', valueKey = 'value' }) {
  const [search, setSearch] = useState('')
  const [open, setOpen]     = useState(false)
  const ref                 = useRef(null)

  useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const filtered      = options.filter(o => String(o[labelKey] || '').toLowerCase().includes(search.toLowerCase()))
  const selectedLabel = options.find(o => String(o[valueKey]) === String(value))?.[labelKey] || ''

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div onClick={() => setOpen(o => !o)}
        style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: '0.86rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: 180 }}>
        <span style={{ color: value ? '#0f172a' : '#94a3b8' }}>{value ? selectedLabel : placeholder}</span>
        <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>▼</span>
      </div>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 50, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', minWidth: 220, marginTop: 4 }}>
          <div style={{ padding: 8, borderBottom: '1px solid #f1f5f9' }}>
            <input autoFocus type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: '0.84rem', boxSizing: 'border-box', outline: 'none' }} />
          </div>
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            <div onClick={() => { onChange(''); setOpen(false); setSearch('') }}
              style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '0.84rem', color: '#64748b' }}>
              {placeholder}
            </div>
            {filtered.map(o => (
              <div key={o[valueKey]} onClick={() => { onChange(String(o[valueKey])); setOpen(false); setSearch('') }}
                style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '0.84rem', color: '#0f172a', background: String(o[valueKey]) === String(value) ? '#eff6ff' : 'none' }}>
                {o[labelKey]}
              </div>
            ))}
            {filtered.length === 0 && <div style={{ padding: 12, color: '#94a3b8', fontSize: '0.82rem', textAlign: 'center' }}>No results</div>}
          </div>
        </div>
      )}
    </div>
  )
}

function RangeFilter({ label, minVal, maxVal, onMinChange, onMaxChange, prefix = '', step = '1' }) {
  return (
    <div>
      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {['Min', 'Max'].map((ph, i) => (
          <div key={ph} style={{ position: 'relative', flex: 1 }}>
            {prefix && <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.82rem' }}>{prefix}</span>}
            <input type="number" step={step} min="0" placeholder={ph}
              value={i === 0 ? minVal : maxVal}
              onChange={e => i === 0 ? onMinChange(e.target.value) : onMaxChange(e.target.value)}
              style={{ width: '100%', padding: `7px 8px 7px ${prefix ? '18px' : '8px'}`, border: '1px solid #e2e8f0', borderRadius: 6, fontSize: '0.84rem', boxSizing: 'border-box', outline: 'none' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, color = '#1a1f4e' }) {
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

export default function RevenueReport() {
  const navigate = useNavigate()

  const [amountMin, setAmountMin] = useState('')
  const [amountMax, setAmountMax] = useState('')
  const [dateFrom,  setDateFrom]  = useState('')
  const [dateTo,    setDateTo]    = useState('')
  const [weightMin, setWeightMin] = useState('')
  const [weightMax, setWeightMax] = useState('')
  const [zoneMin,   setZoneMin]   = useState('')
  const [zoneMax,   setZoneMax]   = useState('')
  const [pkgType,   setPkgType]   = useState('')
  const [empSearch, setEmpSearch] = useState('')
  const [officeId, setOfficeId] = useState('')

  const [tableData, setTableData] = useState({ data: [], total: 0, page: 1, totalPages: 1 })
  const [stats,     setStats]     = useState(null)
  const [page,      setPage]      = useState(1)
  const [loading,   setLoading]   = useState(false)

  function buildParams(p = page) {
    const params = new URLSearchParams({ page: p, limit: 20 })
    if (amountMin && Number(amountMin) >= 0) params.set('amount_min',    amountMin)
    if (amountMax && Number(amountMax) >= 0) params.set('amount_max',    amountMax)
    if (dateFrom)  params.set('date_from',     dateFrom)
    if (dateTo)    params.set('date_to',       dateTo)
    if (weightMin && Number(weightMin) >= 0) params.set('weight_min',    weightMin)
    if (weightMax && Number(weightMax) >= 0) params.set('weight_max',    weightMax)
    if (zoneMin   && Number(zoneMin)   >= 1) params.set('zone_min',      zoneMin)
    if (zoneMax   && Number(zoneMax)   >= 1) params.set('zone_max',      zoneMax)
    if (pkgType)   params.set('package_type',  pkgType)
    if (empSearch) params.set('employee_name', empSearch)
    if (officeId) params.set('post_office_id', officeId)
    return params
  }

  function fetchAll(p = 1) {
    setLoading(true)
    Promise.all([
      fetch(`${API_BASE}/api/operations/revenue?${buildParams(p)}`,       { headers: authH() }).then(r => r.json()),
      fetch(`${API_BASE}/api/operations/revenue/stats?${buildParams(p)}`, { headers: authH() }).then(r => r.json()),
    ]).then(([table, s]) => {
      setTableData(table)
      setStats(s)
      setPage(p)
    }).catch(() => {}).finally(() => setLoading(false))
  }

  function handleApply() { fetchAll(1) }
  function handleClear() {
    setAmountMin(''); setAmountMax(''); setDateFrom(''); setDateTo('')
    setWeightMin(''); setWeightMax(''); setZoneMin(''); setZoneMax('')
    setPkgType(''); setEmpSearch(''); setOfficeId('')
  }

  const [postOffices, setPostOffices] = useState([])

  useEffect(() => {
    fetch(`${API_BASE}/api/operations/post-offices`, { headers: authH() })
      .then(r => r.json())
      .then(d => setPostOffices(Array.isArray(d) ? d.map(o => ({ value: o.Post_Office_ID, label: o.Label })) : []))
      .catch(() => {})
    fetchAll(1)
  }, [])

  function handleLogout(e) {
    e.preventDefault()
    localStorage.removeItem('token'); localStorage.removeItem('user'); localStorage.removeItem('userType')
    navigate('/')
  }

  const pkgTypes = [{ value: 'GEN', label: 'General Shipping' }, { value: 'EXP', label: 'Express' }, { value: 'OVR', label: 'Oversize' }]

  return (
    <EmployeeLayout>
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg, #eae6de)' }}>

      <div style={{ maxWidth: 1280, width: '100%', margin: '0 auto', padding: '32px 28px 64px', flex: 1, boxSizing: 'border-box' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ margin: '0 0 4px', fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Revenue Report</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Payment records and revenue analytics</p>
        </div>

        {/* Controls */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '24px 28px', border: '1px solid #e2e8f0', marginBottom: 24, boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Range Bounds</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
            <RangeFilter label="Payment Amount" prefix="$" minVal={amountMin} maxVal={amountMax} onMinChange={setAmountMin} onMaxChange={setAmountMax} step="0.01" />
            <RangeFilter label="Package Weight (lbs)" minVal={weightMin} maxVal={weightMax} onMinChange={setWeightMin} onMaxChange={setWeightMax} step="0.1" />
            <RangeFilter label="Zone (1–9)" minVal={zoneMin} maxVal={zoneMax} onMinChange={setZoneMin} onMaxChange={setZoneMax} />
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Date Range</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                  style={{ flex: 1, padding: '7px 8px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: '0.82rem', outline: 'none' }} />
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                  style={{ flex: 1, padding: '7px 8px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: '0.82rem', outline: 'none' }} />
              </div>
            </div>
          </div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Categories</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: 6 }}>Package Type</div>
              <SearchableSelect options={pkgTypes} value={pkgType} onChange={setPkgType} placeholder="All types" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: 6 }}>Employee</div>
              <input type="text" placeholder="Search by name..." value={empSearch} onChange={e => setEmpSearch(e.target.value)}
                style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.86rem', minWidth: 180, outline: 'none' }} />
            </div>
            <div>
  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: 6 }}>Post Office</div>
  <SearchableSelect options={postOffices} value={officeId} onChange={setOfficeId} placeholder="All offices" />
</div>
            <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
              <button onClick={handleClear} style={{ padding: '8px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', fontSize: '0.84rem', color: '#64748b' }}>Clear</button>
              <button onClick={handleApply} style={{ padding: '8px 20px', background: '#1a1f4e', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.84rem', fontWeight: 700 }}>Apply</button>
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
              <StatCard label="Total Revenue"       value={`$${fmt(stats.summary?.Total_Revenue)}`}       color="#000000" />
              <StatCard label="Transactions"        value={fmtInt(stats.summary?.Total_Transactions)}     color="#000000" />
              <StatCard label="Avg per Transaction" value={`$${fmt(stats.summary?.Avg_Per_Transaction)}`} color="#000000" />
              <StatCard label="Highest"             value={`$${fmt(stats.summary?.Max_Transaction)}`}     color="#000000" />
              <StatCard label="Lowest"              value={`$${fmt(stats.summary?.Min_Transaction)}`}     color="#000000" />
              <StatCard label="Projected Next Qtr"  value={`$${fmt(stats.projected_next_quarter)}`}       color="#000000" sub="Based on last 3 months" />
            </div>

            {stats.quarterly?.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', border: '1px solid #e2e8f0', marginBottom: 24 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Quarterly Breakdown</div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                    <thead><tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                      {['Quarter', 'Transactions', 'Revenue', 'Avg per Transaction'].map(h => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#374151' }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {stats.quarterly.map((q, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 600, color: '#1a1f4e' }}>{q.Quarter_Label}</td>
                          <td style={{ padding: '8px 12px' }}>{fmtInt(q.Transactions)}</td>
                          <td style={{ padding: '8px 12px', fontWeight: 700, color: '#000000' }}>${fmt(q.Revenue)}</td>
                          <td style={{ padding: '8px 12px' }}>${fmt(Number(q.Revenue) / Number(q.Transactions || 1))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Revenue by Package Type</div>
                {stats.by_package_type?.map((t, i) => {
                  const maxR = Math.max(...stats.by_package_type.map(x => Number(x.Revenue || 0)), 1)
                  return (
                    <div key={i} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.82rem' }}>
                        <span style={{ fontWeight: 600 }}>{t.Package_Type_Code || 'Unknown'}</span>
                        <span style={{ color: '#000000', fontWeight: 700 }}>${fmt(t.Revenue)}</span>
                      </div>
                      <div style={{ background: '#f1f5f9', borderRadius: 4, height: 8 }}>
                        <div style={{ width: `${(Number(t.Revenue) / maxR) * 100}%`, background: '#1a1f4e', height: '100%', borderRadius: 4 }} />
                      </div>
                    </div>
                  )
                })}
              </div>
              <div style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Revenue by Zone</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                  <thead><tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                    {['Zone', 'Transactions', 'Revenue', 'Avg'].map(h => (
                      <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 700, color: '#374151' }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {stats.by_zone?.map((z, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                        <td style={{ padding: '6px 10px', fontWeight: 600 }}>Zone {z.Zone}</td>
                        <td style={{ padding: '6px 10px' }}>{fmtInt(z.Transactions)}</td>
                        <td style={{ padding: '6px 10px', fontWeight: 700, color: '#000000' }}>${fmt(z.Revenue)}</td>
                        <td style={{ padding: '6px 10px' }}>${fmt(z.Avg_Revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Raw table */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>All Payment Records</span>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{fmtInt(tableData.total)} records</span>
          </div>
          {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading...</div> : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                  <thead><tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    {['Payment ID', 'Date', 'Amount', 'Tracking #', 'Type', 'Weight', 'Zone', 'Customer', 'Employee', 'Office'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {tableData.data?.length === 0 ? (
                      <tr><td colSpan={10} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No records found</td></tr>
                    ) : tableData.data?.map((row, i) => (
                      <tr key={row.Payment_ID} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                        <td style={{ padding: '9px 14px', color: '#64748b', fontSize: '0.78rem' }}>#{row.Payment_ID}</td>
                        <td style={{ padding: '9px 14px' }}>{fmtDate(row.Date_Created)}</td>
                        <td style={{ padding: '9px 14px', fontWeight: 700, color: '#000000' }}>${fmt(row.Payment_Amount)}</td>
                        <td style={{ padding: '9px 14px' }}><code style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: 4, fontSize: '0.78rem' }}>{row.Tracking_Number || '—'}</code></td>
                        <td style={{ padding: '9px 14px' }}>{row.Package_Type_Code || '—'}</td>
                        <td style={{ padding: '9px 14px' }}>{row.Weight ? `${row.Weight} lbs` : '—'}</td>
                        <td style={{ padding: '9px 14px' }}>{row.Zone ? `Zone ${row.Zone}` : '—'}</td>
                        <td style={{ padding: '9px 14px' }}>{row.Customer_Name || '—'}</td>
                        <td style={{ padding: '9px 14px' }}>{row.Employee_Name || '—'}</td>
                        <td style={{ padding: '9px 14px' }}>{row.Office_City ? `${row.Office_City}, ${row.Office_State}` : '—'}</td>
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