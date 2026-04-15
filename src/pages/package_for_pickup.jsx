import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './css/home.css'
import './css/packages.css'
import './css/package_for_pickup.css'
import { authFetch } from '../authFetch'

const API_BASE =
  import.meta.env.VITE_API_URL != null && String(import.meta.env.VITE_API_URL).trim() !== ''
    ? String(import.meta.env.VITE_API_URL).replace(/\/$/, '')
    : import.meta.env.DEV
      ? ''
      : 'http://localhost:5000'

function authHeader() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** API datetime → value for `<input type="datetime-local" />` */
function toDatetimeLocalValue(value) {
  if (value == null || value === '') return ''
  const d = new Date(String(value).replace(' ', 'T'))
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function PackageForPickup() {
  const navigate = useNavigate()
  const [atOffice, setAtOffice] = useState([])
  const [offices, setOffices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [tracking, setTracking] = useState('')
  const [recipientId, setRecipientId] = useState('')
  const [postOfficeId, setPostOfficeId] = useState('')
  const [arrivalTime, setArrivalTime] = useState('')
  const [pickupTime, setPickupTime] = useState('')
  const [submittingArrival, setSubmittingArrival] = useState(false)
  const [submittingPickup, setSubmittingPickup] = useState(false)
  const [success, setSuccess] = useState('')
  /** In-app notice when late-fee policy applies (clerk informs sender + recipient). */
  const [lateFeePopup, setLateFeePopup] = useState(null)

  useEffect(() => {
    const ac = new AbortController()
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [r1, r2] = await Promise.all([
          authFetch(`${API_BASE}/api/employee/packages-at-office`, {
            headers: { ...authHeader() },
            signal: ac.signal,
          }),
          authFetch(`${API_BASE}/api/employee/post-offices`, {
            headers: { ...authHeader() },
            signal: ac.signal,
          }),
        ])
        const t1 = await r1.text()
        const t2 = await r2.text()
        let d1 = {}
        let d2 = {}
        try {
          if (t1) d1 = JSON.parse(t1)
        } catch {
          /* */
        }
        try {
          if (t2) d2 = JSON.parse(t2)
        } catch {
          /* */
        }
        if (!r1.ok) throw new Error(d1.message || t1.slice(0, 120) || 'Could not load at-office packages')
        if (!r2.ok) throw new Error(d2.message || t2.slice(0, 120) || 'Could not load post offices')
        setAtOffice(Array.isArray(d1) ? d1 : [])
        setOffices(Array.isArray(d2) ? d2 : [])
      } catch (e) {
        if (e?.name === 'AbortError') return
        setError(String(e.message || e))
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => ac.abort()
  }, [])

  const selectedPkg = useMemo(
    () => atOffice.find((p) => p.Tracking_Number === tracking),
    [atOffice, tracking]
  )

  useEffect(() => {
    if (!lateFeePopup) return
    const onKey = (e) => {
      if (e.key === 'Escape') setLateFeePopup(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lateFeePopup])

  useEffect(() => {
    if (selectedPkg?.Recipient_ID != null) setRecipientId(String(selectedPkg.Recipient_ID))
    else setRecipientId('')
    if (selectedPkg?.Pickup_Arrival_Time) {
      setArrivalTime(toDatetimeLocalValue(selectedPkg.Pickup_Arrival_Time))
    } else if (selectedPkg?.Shipment_Arrival_Stamp) {
      setArrivalTime(toDatetimeLocalValue(selectedPkg.Shipment_Arrival_Stamp))
    } else {
      setArrivalTime('')
    }
    setPickupTime('')
  }, [selectedPkg])

  const arrivalFromShipmentOrPickup = Boolean(
    selectedPkg?.Pickup_Arrival_Time || selectedPkg?.Shipment_Arrival_Stamp
  )

  async function refreshAtOfficeList() {
    const r = await authFetch(`${API_BASE}/api/employee/packages-at-office`, { headers: { ...authHeader() } })
    const t = await r.text()
    let d = []
    try {
      if (t) d = JSON.parse(t)
    } catch {
      /* */
    }
    if (r.ok && Array.isArray(d)) setAtOffice(d)
  }

  async function handleRecordArrival() {
    setSuccess('')
    setError('')
    if (!tracking.trim() || !recipientId || !postOfficeId || (!arrivalFromShipmentOrPickup && !arrivalTime)) {
      setError('Choose a package and post office. Enter arrival time if none is stored on the shipment yet.')
      return
    }
    setSubmittingArrival(true)
    try {
      const res = await authFetch(`${API_BASE}/api/employee/package-pickup-arrival`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({
          tracking_number: tracking.trim(),
          recipient_id: Number(recipientId),
          post_office_id: Number(postOfficeId),
          arrival_time: arrivalTime,
        }),
      })
      const text = await res.text()
      let data = {}
      try {
        if (text) data = JSON.parse(text)
      } catch {
        /* */
      }
      if (!res.ok) throw new Error(data.message || text.slice(0, 160) || `HTTP ${res.status}`)
      setSuccess(`Arrival saved for ${tracking.trim()}. Pickup time stays empty until the customer picks up.`)
      const fee = Number(data.late_fee_amount)
      if (Number.isFinite(fee) && fee > 0) {
        setLateFeePopup({
          kind: 'arrival',
          tracking: String(data.tracking_number || tracking.trim()),
          amount: fee,
          senderName: data.sender_name || 'Sender',
          recipientName: data.recipient_name || 'Recipient',
        })
      } else {
        setLateFeePopup(null)
      }
      await refreshAtOfficeList()
    } catch (err) {
      setError(String(err.message || err))
    } finally {
      setSubmittingArrival(false)
    }
  }

  async function handleCompletePickup() {
    setSuccess('')
    setError('')
    if (!tracking.trim() || !recipientId || !postOfficeId || (!arrivalFromShipmentOrPickup && !arrivalTime) || !pickupTime) {
      setError('Fill in package, post office, pickup time, and arrival if the shipment has no office arrival yet.')
      return
    }
    setSubmittingPickup(true)
    try {
      const res = await authFetch(`${API_BASE}/api/employee/package-pickup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({
          tracking_number: tracking.trim(),
          recipient_id: Number(recipientId),
          post_office_id: Number(postOfficeId),
          arrival_time: arrivalTime,
          pickup_time: pickupTime,
        }),
      })
      const text = await res.text()
      let data = {}
      try {
        if (text) data = JSON.parse(text)
      } catch {
        /* */
      }
      if (!res.ok) throw new Error(data.message || text.slice(0, 160) || `HTTP ${res.status}`)
      setSuccess(`Pickup recorded for ${tracking.trim()}. Status set to Picked Up when configured.`)
      const fee = Number(data.late_fee_amount)
      if (Number.isFinite(fee) && fee > 0) {
        setLateFeePopup({
          kind: 'pickup',
          tracking: String(data.tracking_number || tracking.trim()),
          amount: fee,
          senderName: data.sender_name || 'Sender',
          recipientName: data.recipient_name || 'Recipient',
        })
      } else {
        setLateFeePopup(null)
      }
      setTracking('')
      setPostOfficeId('')
      setArrivalTime('')
      setPickupTime('')
      await refreshAtOfficeList()
    } catch (err) {
      setError(String(err.message || err))
    } finally {
      setSubmittingPickup(false)
    }
  }

  function handleLogout(e) {
    e.preventDefault()
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userType')
    navigate('/')
  }

  return (
    <div className="pickup-page inventory-page">
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

      <main className="pickup-main">
        <h1>Package for pickup</h1>
       
        {error && (
          <div className="inventory-error pickup-banner">
            <span>{error}</span>
            <button type="button" onClick={() => setError('')} aria-label="Dismiss">
              ×
            </button>
          </div>
        )}
        {success && <div className="pickup-success pickup-banner">{success}</div>}

        {lateFeePopup && (
          <div
            className="pickup-latefee-backdrop"
            role="presentation"
            onClick={() => setLateFeePopup(null)}
          >
            <div
              className="pickup-latefee-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="pickup-latefee-title"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="pickup-latefee-title" className="pickup-latefee-title">
                Late fee applies
              </h2>
              <p className="pickup-latefee-lead">
                Notify the <strong>sender</strong> and <strong>recipient</strong> that this package will include the
                late-pickup fee below (policy: $10 after 10 days at office, $20 after 20 days).
              </p>
              <dl className="pickup-latefee-details">
                <div>
                  <dt>Tracking</dt>
                  <dd>
                    <code>{lateFeePopup.tracking}</code>
                  </dd>
                </div>
                <div>
                  <dt>Late fee</dt>
                  <dd className="pickup-latefee-amount">${lateFeePopup.amount.toFixed(2)}</dd>
                </div>
                <div>
                  <dt>Sender</dt>
                  <dd>{lateFeePopup.senderName}</dd>
                </div>
                <div>
                  <dt>Recipient</dt>
                  <dd>{lateFeePopup.recipientName}</dd>
                </div>
              </dl>
              <p className="pickup-latefee-note">
                {lateFeePopup.kind === 'arrival'
                  ? 'Fee is based on calendar days from office arrival through today. It may change if pickup happens later.'
                  : 'This fee is recorded on pickup and matches the stored late-fee amount for this package.'}
              </p>
              <button type="button" className="btn primary pickup-latefee-dismiss" onClick={() => setLateFeePopup(null)}>
                Acknowledge
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <p className="inventory-state-msg">Loading…</p>
        ) : (
          <>
            <section className="pickup-section">
              <h2>At office now</h2>
              {atOffice.length === 0 ? (
                <p className="inventory-state-msg">No packages are currently in &quot;At Office&quot; status.</p>
              ) : (
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Tracking #</th>
                        <th>Recipient ID</th>
                        <th>Recipient</th>
                        <th>Type</th>
                        <th>Weight</th>
                        <th>Arrival logged</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {atOffice.map((p) => (
                        <tr key={p.Tracking_Number}>
                          <td>
                            <code>{p.Tracking_Number}</code>
                          </td>
                          <td>{p.Recipient_ID ?? '—'}</td>
                          <td>{p.Recipient_Name || '—'}</td>
                          <td>{p.Package_Type_Code}</td>
                          <td>{p.Weight} lbs</td>
                          <td>
                            {p.Pickup_Arrival_Time
                              ? toDatetimeLocalValue(p.Pickup_Arrival_Time).replace('T', ' ')
                              : '—'}
                          </td>
                          <td>{p.Status_Name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="pickup-section pickup-form-section">
              <h2>Office log</h2>
              
              <form
                className="pickup-form"
                onSubmit={(e) => {
                  e.preventDefault()
                }}
              >
                <label className="pickup-field">
                  <span>Tracking number</span>
                  <select
                    required
                    value={tracking}
                    onChange={(e) => setTracking(e.target.value)}
                    disabled={atOffice.length === 0}
                  >
                    <option value="">Select a package (At Office)</option>
                    {atOffice.map((p) => (
                      <option key={p.Tracking_Number} value={p.Tracking_Number}>
                        {p.Tracking_Number}
                        {p.Recipient_Name ? ` — ${p.Recipient_Name}` : ''}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="pickup-field">
                  <span>Recipient ID</span>
                  <input type="text" readOnly value={recipientId} placeholder="Select tracking first" />
                </label>

                <label className="pickup-field">
                  <span>Post office (street)</span>
                  <select required value={postOfficeId} onChange={(e) => setPostOfficeId(e.target.value)}>
                    <option value="">Choose office…</option>
                    {offices.map((o) => (
                      <option key={o.Post_Office_ID} value={String(o.Post_Office_ID)}>
                        {o.Street_Label || `${o.Street}, ${o.City}, ${o.State}`}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="pickup-field">
                  <span>Arrival at office</span>
                  <input
                    type="datetime-local"
                    required={!arrivalFromShipmentOrPickup}
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                  />
                </label>
                {arrivalFromShipmentOrPickup && (
                  <p className="pickup-field-note">
                    Prefilled from the shipment’s office arrival (set when status becomes At Office) or from a saved
                    pickup log. Edit to override; clear to use the shipment time only.
                  </p>
                )}

                <label className="pickup-field">
                  <span>Customer pickup</span>
                  <input
                    type="datetime-local"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                  />
                </label>
                <p className="pickup-field-note">Pickup time is only required when you click Complete pickup.</p>

                <div className="pickup-form-actions">
                  <button
                    type="button"
                    className="btn primary pickup-submit"
                    disabled={submittingArrival || submittingPickup || atOffice.length === 0}
                    onClick={() => handleRecordArrival()}
                  >
                    {submittingArrival ? 'Saving…' : 'Record arrival'}
                  </button>
                  <button
                    type="button"
                    className="btn primary pickup-submit"
                    disabled={submittingArrival || submittingPickup || atOffice.length === 0}
                    onClick={() => handleCompletePickup()}
                  >
                    {submittingPickup ? 'Saving…' : 'Complete pickup'}
                  </button>
                </div>
              </form>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
