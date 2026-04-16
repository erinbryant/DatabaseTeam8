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
function fmtPct(n) { return n != null ? `${parseFloat(n).toFixed(1)}%` : '—' }
function authH()   { return { Authorization: `Bearer ${localStorage.getItem('token')}` } }
function fmtDate(d){ return d ? new Date(d).toLocaleDateString() : '—' }

function successColor(r) {
  const n = Number(r || 0)
  if (n >= 80) return '#059669'
  if (n >= 50) return '#d97706'
  return '#dc2626'
}

function RangeFilter({ label, minVal, maxVal, onMinChange, onMaxChange, step = '1' }) {
  return (
    <div>
      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', gap: 6 }}>
        {['Min', 'Max'].map((ph, i) => (
          <input key={ph} type="number" step={step} min="0" placeholder={ph}
            value={i === 0 ? minVal : maxVal}
            onChange={e => i === 0 ? onMinChange(e.target.value) : onMaxChange(e.target.value)}
            style={{ flex: 1, padding: '7px 8px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: '0.84rem', outline: 'none' }} />
        ))}
      </div>
    </div>
  )
}

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
              style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '0.84rem', color: '#64748b' }}>{placeholder}</div>
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

// ── Comparison panel ──────────────────────────────────────────────────────
function ComparisonPanel({ offices, onClose }) {
  if (!offices.length) return null

  const metrics = [
    { key: 'Total_Employees', label: 'Employees',      fmt: fmtInt },
    { key: 'Clerks',          label: 'Clerks',          fmt: fmtInt },
    { key: 'Drivers',         label: 'Drivers',         fmt: fmtInt },
    { key: 'Total_Packages',  label: 'Total Packages',  fmt: fmtInt },
    { key: 'Total_Shipments', label: 'Shipments',       fmt: fmtInt },
    { key: 'Delivered',       label: 'Delivered',       fmt: fmtInt },
    { key: 'Lost',            label: 'Lost',            fmt: fmtInt },
    { key: 'Returned',        label: 'Returned',        fmt: fmtInt },
    { key: 'Success_Rate',    label: 'Success Rate',    fmt: fmtPct },
    { key: 'Avg_Revenue_Per_Package', label: 'Avg Revenue/Pkg', fmt: v => `$${fmt(v)}` },
  ]

  // For each numeric metric, find best value to highlight
  function bestIndex(key) {
    const higherIsBetter = key !== 'Lost' && key !== 'Returned'
    const vals = offices.map(o => Number(o[key] || 0))
    const best = higherIsBetter ? Math.max(...vals) : Math.min(...vals)
    return vals.indexOf(best)
  }

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(15,23,42,0.08)', marginTop: 24 }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
        <div>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>Office Comparison</span>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8', marginLeft: 10 }}>
            {offices.length} offices selected — green highlight = best value
          </span>
        </div>
        <button onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontWeight: 700, fontSize: '1.1rem' }}>×</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: 700, color: '#374151', background: '#f8fafc', minWidth: 160 }}>Metric</th>
              {offices.map(o => (
                <th key={o.Post_Office_ID} style={{ padding: '12px 20px', textAlign: 'center', fontWeight: 700, color: '#1a1f4e', background: '#f8fafc', minWidth: 140, whiteSpace: 'nowrap' }}>
                  {o.City}, {o.State}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((m, mi) => {
              const best = bestIndex(m.key)
              return (
                <tr key={m.key} style={{ borderBottom: '1px solid #f1f5f9', background: mi % 2 === 0 ? '#fff' : '#fafbfc' }}>
                  <td style={{ padding: '10px 20px', fontWeight: 600, color: '#374151' }}>{m.label}</td>
                  {offices.map((o, oi) => {
                    const isBest = oi === best
                    const val    = o[m.key]
                    const isRate = m.key === 'Success_Rate'
                    return (
                      <td key={o.Post_Office_ID} style={{
                        padding: '10px 20px', textAlign: 'center', fontWeight: isBest ? 800 : 500,
                        color: isRate ? successColor(val) : isBest ? '#059669' : '#374151',
                        background: isBest ? '#f0fdf4' : 'transparent',
                      }}>
                        {m.fmt(val)}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function OfficeSatisfactionReport() {
  const navigate = useNavigate()

  // Filters
  const [dateFrom,     setDateFrom]     = useState('')
  const [dateTo,       setDateTo]       = useState('')
  const [zoneMin,      setZoneMin]      = useState('')
  const [zoneMax,      setZoneMax]      = useState('')
  const [pkgType,      setPkgType]      = useState('')
  const [successMin,   setSuccessMin]   = useState('')
  const [successMax,   setSuccessMax]   = useState('')
  const [packagesMin,  setPackagesMin]  = useState('')
  const [packagesMax,  setPackagesMax]  = useState('')
  const [deliveredMin, setDeliveredMin] = useState('')
  const [deliveredMax, setDeliveredMax] = useState('')

  // Data
  const [tableData,      setTableData]      = useState([])
  const [selected,       setSelected]       = useState(new Set()) // Set of Post_Office_IDs
  const [drillOffice,    setDrillOffice]    = useState(null)
  const [drillEmployees, setDrillEmployees] = useState([])
  const [loading,        setLoading]        = useState(false)
  const [showCompare,    setShowCompare]    = useState(true)
  const [rawData,    setRawData]    = useState({ data: [], total: 0, page: 1, totalPages: 1 })
  const [rawLoading, setRawLoading] = useState(false)
  const [rawPage,    setRawPage]    = useState(1)

  function buildParams() {
    const p = new URLSearchParams()
    if (dateFrom)                              p.set('date_from',       dateFrom)
    if (dateTo)                                p.set('date_to',         dateTo)
    if (zoneMin && Number(zoneMin) >= 1)       p.set('zone_min',        zoneMin)
    if (zoneMax && Number(zoneMax) >= 1)       p.set('zone_max',        zoneMax)
    if (pkgType)                               p.set('package_type',    pkgType)
    if (successMin && Number(successMin) >= 0) p.set('success_rate_min', successMin)
    if (successMax && Number(successMax) >= 0) p.set('success_rate_max', successMax)
    if (packagesMin && Number(packagesMin) >= 0) p.set('packages_min', packagesMin)
    if (packagesMax && Number(packagesMax) >= 0) p.set('packages_max', packagesMax)
    if (deliveredMin && Number(deliveredMin) >= 0) p.set('delivered_min', deliveredMin)
    if (deliveredMax && Number(deliveredMax) >= 0) p.set('delivered_max', deliveredMax)
    return p
  }

  function fetchTable() {
    setLoading(true)
    setSelected(new Set())
    setDrillOffice(null)
    fetch(`${API_BASE}/api/operations/office-satisfaction?${buildParams()}`, { headers: authH() })
      .then(r => r.json())
      .then(d => setTableData(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  function fetchRaw(p = 1) {
    setRawLoading(true)
    const params = buildParams()
    params.set('page', p)
    params.set('limit', 20)
    fetch(`${API_BASE}/api/operations/office-raw?${params}`, { headers: authH() })
      .then(r => r.json())
      .then(d => { setRawData(d); setRawPage(p) })
      .catch(() => {})
      .finally(() => setRawLoading(false))
  }

  function fetchDrill(officeId) {
    const p = new URLSearchParams({ post_office_id: officeId })
    if (dateFrom) p.set('date_from', dateFrom)
    if (dateTo)   p.set('date_to',   dateTo)
    fetch(`${API_BASE}/api/operations/office-employees?${p}`, { headers: authH() })
      .then(r => r.json())
      .then(d => setDrillEmployees(Array.isArray(d) ? d : []))
      .catch(() => {})
  }

  function handleApply() { fetchTable(); fetchRaw(1); setDrillOffice(null) }
  function handleClear() {
    setDateFrom(''); setDateTo(''); setZoneMin(''); setZoneMax(''); setPkgType('')
    setSuccessMin(''); setSuccessMax(''); setPackagesMin(''); setPackagesMax('')
    setDeliveredMin(''); setDeliveredMax('')
  }

  function toggleSelect(id) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (selected.size === tableData.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(tableData.map(o => o.Post_Office_ID)))
    }
    setShowCompare(false)
  }

  useEffect(() => { fetchTable(); fetchRaw(1) }, [])

  function handleLogout(e) {
    e.preventDefault()
    localStorage.removeItem('token'); localStorage.removeItem('user'); localStorage.removeItem('userType')
    navigate('/')
  }

  const networkRate    = tableData.length ? (tableData.reduce((s, o) => s + Number(o.Success_Rate || 0), 0) / tableData.length).toFixed(1) : null
  const bestOffice     = [...tableData].sort((a, b) => b.Success_Rate - a.Success_Rate)[0]
  const worstOffice    = [...tableData].sort((a, b) => a.Success_Rate - b.Success_Rate)[0]
  const totalPackages  = tableData.reduce((s, o) => s + Number(o.Total_Packages || 0), 0)
  const totalDelivered = tableData.reduce((s, o) => s + Number(o.Delivered || 0), 0)
  const totalLost      = tableData.reduce((s, o) => s + Number(o.Lost || 0), 0)

  const selectedOffices = tableData.filter(o => selected.has(o.Post_Office_ID))
  const allChecked      = tableData.length > 0 && selected.size === tableData.length
  const someChecked     = selected.size > 0 && selected.size < tableData.length

  const pkgTypes = [
    { value: 'GEN', label: 'General Shipping' },
    { value: 'EXP', label: 'Express' },
    { value: 'OVR', label: 'Oversize' },
  ]

  return (
    <EmployeeLayout>
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg, #eae6de)' }}>

      <div style={{ maxWidth: 1280, width: '100%', margin: '0 auto', padding: '32px 28px 64px', flex: 1, boxSizing: 'border-box' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ margin: '0 0 4px', fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Office Satisfaction Report</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Delivery success rates and performance by post office location</p>
        </div>

        {/* Controls */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '24px 28px', border: '1px solid #e2e8f0', marginBottom: 24, boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Range Bounds</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Date Range</div>
              <div style={{ display: 'flex', gap: 6, minWidth: 0 }}>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ flex: 1, minWidth: 0, padding: '7px 8px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: '0.82rem', outline: 'none' }} />
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ flex: 1, minWidth: 0, padding: '7px 8px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: '0.82rem', outline: 'none' }} />
            </div>
            </div>
            <RangeFilter label="Zone (1–9)"       minVal={zoneMin}      maxVal={zoneMax}      onMinChange={setZoneMin}      onMaxChange={setZoneMax} />
            <RangeFilter label="Success Rate (%)" minVal={successMin}   maxVal={successMax}   onMinChange={setSuccessMin}   onMaxChange={setSuccessMax}   step="0.1" />
            <RangeFilter label="Total Packages"   minVal={packagesMin}  maxVal={packagesMax}  onMinChange={setPackagesMin}  onMaxChange={setPackagesMax} />
            <RangeFilter label="Delivered Count"  minVal={deliveredMin} maxVal={deliveredMax} onMinChange={setDeliveredMin} onMaxChange={setDeliveredMax} />
          </div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Categories</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: 6 }}>Package Type</div>
              <SearchableSelect options={pkgTypes} value={pkgType} onChange={setPkgType} placeholder="All types" />
            </div>
            <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
              <button onClick={handleClear} style={{ padding: '8px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', fontSize: '0.84rem', color: '#64748b' }}>Clear</button>
              <button onClick={handleApply} style={{ padding: '8px 20px', background: '#1a1f4e', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.84rem', fontWeight: 700 }}>Apply</button>
            </div>
          </div>
        </div>

        {/* Summary stats */}
        {tableData.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
            <StatCard label="Network Success Rate" value={networkRate ? `${networkRate}%` : '—'} color="#1a1f4e" />
            <StatCard label="Best Office"          value={bestOffice?.City  || '—'} sub={bestOffice  ? `${bestOffice.Success_Rate}%`  : ''} color="#1a1f4e" />
            <StatCard label="Worst Office"         value={worstOffice?.City || '—'} sub={worstOffice ? `${worstOffice.Success_Rate}%` : ''} color="#1a1f4e" />
            <StatCard label="Total Packages"       value={fmtInt(totalPackages)}    color="#1a1f4e" />
            <StatCard label="Total Delivered"      value={fmtInt(totalDelivered)}   color="#1a1f4e" />
            <StatCard label="Total Lost"           value={fmtInt(totalLost)}        color="#1a1f4e" />
          </div>
        )}

        {/* Compare bar */}
        {selected.size > 0 && (
          <div style={{ background: '#1a1f4e', borderRadius: 12, padding: '12px 20px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#fff', fontSize: '0.88rem', fontWeight: 600 }}>
              {selected.size} office{selected.size > 1 ? 's' : ''} selected
            </span>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setSelected(new Set())}
                style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.82rem' }}>
                Clear selection
              </button>
              <button onClick={() => setShowCompare(true)} disabled={selected.size < 2}
                style={{ padding: '6px 14px', background: selected.size >= 2 ? '#c8922a' : 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: 6, cursor: selected.size >= 2 ? 'pointer' : 'not-allowed', fontSize: '0.82rem', fontWeight: 700, opacity: selected.size >= 2 ? 1 : 0.5 }}>
                Compare {selected.size >= 2 ? `(${selected.size})` : '— select 2+'}
              </button>
            </div>
          </div>
        )}

        {/* Main table */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(15,23,42,0.04)', marginBottom: 24 }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>All Post Offices</span>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Check rows to compare · Click a row to see employees</span>
          </div>
          {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading...</div> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    {/* Select all checkbox */}
                    <th style={{ padding: '10px 14px', width: 40 }}>
                      <input type="checkbox" checked={allChecked} ref={el => { if (el) el.indeterminate = someChecked }}
                        onChange={toggleAll} style={{ cursor: 'pointer', width: 15, height: 15 }} />
                    </th>
                    {['Location', 'Employees', 'Clerks', 'Drivers', 'Packages', 'Shipments', 'Delivered', 'Lost', 'Returned', 'Success Rate', 'Avg Revenue/Pkg'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.length === 0 ? (
                    <tr><td colSpan={12} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No data found</td></tr>
                  ) : tableData.map((row, i) => {
                    const isSelected = selected.has(row.Post_Office_ID)
                    const isDrill    = drillOffice?.Post_Office_ID === row.Post_Office_ID
                    return (
                      <tr key={row.Post_Office_ID}
                        style={{ borderBottom: '1px solid #f1f5f9', background: isDrill ? '#eff6ff' : isSelected ? '#fefce8' : i % 2 === 0 ? '#fff' : '#fafbfc', transition: 'background 0.1s' }}>
                        {/* Checkbox — stops row click from firing */}
                        <td style={{ padding: '10px 14px' }} onClick={e => e.stopPropagation()}>
                          <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(row.Post_Office_ID)}
                            style={{ cursor: 'pointer', width: 15, height: 15 }} />
                        </td>
                        {/* Clickable cells for drill down */}
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: '#1a1f4e', cursor: 'pointer' }}
                          onClick={() => { setDrillOffice(isDrill ? null : row); if (!isDrill) fetchDrill(row.Post_Office_ID) }}>
                          {row.City}, {row.State}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>{fmtInt(row.Total_Employees)}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>{fmtInt(row.Clerks)}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>{fmtInt(row.Drivers)}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>{fmtInt(row.Total_Packages)}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>{fmtInt(row.Total_Shipments)}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center', color: '#1a1f4e', fontWeight: 600 }}>{fmtInt(row.Delivered)}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center', color: '#1a1f4e', fontWeight: 600 }}>{fmtInt(row.Lost)}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center', color: '#1a1f4e', fontWeight: 600 }}>{fmtInt(row.Returned)}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <span style={{ background: `${successColor(row.Success_Rate)}20`, color: successColor(row.Success_Rate), borderRadius: 20, padding: '3px 12px', fontWeight: 800, fontSize: '0.85rem' }}>
                            {fmtPct(row.Success_Rate)}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', fontWeight: 600 }}>${fmt(row.Avg_Revenue_Per_Package)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Drill down panel */}
        {drillOffice && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #dbeafe', overflow: 'hidden', boxShadow: '0 4px 16px rgba(29,78,216,0.08)', marginBottom: 24 }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #dbeafe', background: '#eff6ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1a1f4e' }}>
                {drillOffice.City}, {drillOffice.State} — Individual Employees
              </span>
              <button onClick={() => { setDrillOffice(null); setDrillEmployees([]) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontWeight: 700, fontSize: '1.1rem' }}>×</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', maxWidth: 1280, margin: '0 auto' }}>
                <thead><tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  {['Employee', 'Role', 'Department', 'Packages', 'Shipments', 'Delivered', 'Success Rate'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {drillEmployees.length === 0 ? (
                    <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>No employees found</td></tr>
                  ) : drillEmployees.map((emp, i) => (
                    <tr key={emp.Employee_ID} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                      <td style={{ padding: '9px 14px' }}>
                        <div style={{ fontWeight: 600 }}>{emp.Employee_Name}</div>
                        <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{emp.Email_Address}</div>
                      </td>
                      <td style={{ padding: '9px 14px' }}>
                        <span style={{ background: emp.Role_Name === 'Clerk' ? '#eff6ff' : '#f5f3ff', color: emp.Role_Name === 'Clerk' ? '#1d4ed8' : '#7c3aed', borderRadius: 20, padding: '2px 10px', fontSize: '0.76rem', fontWeight: 700 }}>
                          {emp.Role_Name}
                        </span>
                      </td>
                      <td style={{ padding: '9px 14px', color: '#374151' }}>{emp.Department_Name}</td>
                      <td style={{ padding: '9px 14px', textAlign: 'center', fontWeight: 600 }}>{fmtInt(emp.Total_Packages)}</td>
                      <td style={{ padding: '9px 14px', textAlign: 'center', fontWeight: 600 }}>{fmtInt(emp.Total_Shipments)}</td>
                      <td style={{ padding: '9px 14px', textAlign: 'center', color: '#1a1f4e', fontWeight: 600 }}>{fmtInt(emp.Delivered)}</td>
                      <td style={{ padding: '9px 14px', textAlign: 'center' }}>
                        <span style={{ color: successColor(emp.Success_Rate), fontWeight: 800 }}>{fmtPct(emp.Success_Rate)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Comparison panel */}
        {showCompare && selectedOffices.length >= 2 && (
          <ComparisonPanel offices={selectedOffices} onClose={() => setShowCompare(false)} />
        )}
        {/* Raw data table */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(15,23,42,0.04)', marginTop: 24, maxWidth: 1280}}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>All Package Records</span>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{fmtInt(rawData.total)} records</span>
        </div>
        {rawLoading ? <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading...</div> : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                <thead><tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  {['Tracking #', 'Type', 'Weight', 'Zone', 'Date', 'Status', 'Employee', 'Role', 'Office', 'Sender', 'Recipient', 'Departed', 'Arrived'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {rawData.data?.length === 0 ? (
                    <tr><td colSpan={13} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No records found</td></tr>
                  ) : rawData.data?.map((row, i) => (
                    <tr key={row.Tracking_Number} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                      <td style={{ padding: '9px 14px' }}><code style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: 4, fontSize: '0.78rem' }}>{row.Tracking_Number}</code></td>
                      <td style={{ padding: '9px 14px' }}>{row.Package_Type_Code || '—'}</td>
                      <td style={{ padding: '9px 14px' }}>{row.Weight ? `${row.Weight} lbs` : '—'}</td>
                      <td style={{ padding: '9px 14px' }}>{row.Zone ? `Zone ${row.Zone}` : '—'}</td>
                      <td style={{ padding: '9px 14px' }}>{fmtDate(row.Date_Created)}</td>
                      <td style={{ padding: '9px 14px' }}>
                        <span style={{ color: successColor(row.Status_Name === 'Delivered' ? 100 : row.Status_Name === 'Lost' ? 0 : 50), fontWeight: 600, fontSize: '0.82rem' }}>
                          {row.Status_Name || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '9px 14px' }}>{row.Employee_Name || '—'}</td>
                      <td style={{ padding: '9px 14px' }}>
                        {row.Role_Name ? (
                          <span style={{ background: row.Role_Name === 'Clerk' ? '#eff6ff' : '#f5f3ff', color: row.Role_Name === 'Clerk' ? '#1a1f4e' : '#1a1f4e', borderRadius: 20, padding: '2px 8px', fontSize: '0.76rem', fontWeight: 700 }}>
                            {row.Role_Name}
                          </span>
                        ) : '—'}
                      </td>
                      <td style={{ padding: '9px 14px' }}>{row.Office_Location || '—'}</td>
                      <td style={{ padding: '9px 14px' }}>{row.Sender_Name || '—'}</td>
                      <td style={{ padding: '9px 14px' }}>{row.Recipient_Name || '—'}</td>
                      <td style={{ padding: '9px 14px', fontSize: '0.78rem', color: '#64748b' }}>{fmtDate(row.Departure_Time_Stamp)}</td>
                      <td style={{ padding: '9px 14px', fontSize: '0.78rem', color: '#64748b' }}>{fmtDate(row.Arrival_Time_Stamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '16px 24px' }}>
              <Pagination page={rawData.page} totalPages={rawData.totalPages} onPage={p => fetchRaw(p)} />
            </div>
          </>
        )}
      </div>
      </div>
    </div>
    </EmployeeLayout>
  )
}