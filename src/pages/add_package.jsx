import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './css/home.css'
import './css/add_package.css'
import skyline from '../assets/houston-skyline.jpeg'
import { authFetch } from '../authFetch'

const ZONES = [
  { value: '1', label: 'Zone 1 — 1 to 50 miles' },
  { value: '2', label: 'Zone 2 — 51 to 150 miles' },
  { value: '3', label: 'Zone 3 — 151 to 300 miles' },
  { value: '4', label: 'Zone 4 — 301 to 600 miles' },
  { value: '5', label: 'Zone 5 — 601 to 1,000 miles' },
  { value: '6', label: 'Zone 6 — 1,001 to 1,400 miles' },
  { value: '7', label: 'Zone 7 — 1,401 to 1,800 miles' },
  { value: '8', label: 'Zone 8 — 1,801 miles or greater' },
  { value: '9', label: 'Zone 9 — Territories & military addresses' },
]

const BOX_TIERS = [
  { maxL: 12, maxW: 12, maxH: 12, surcharge: 0, label: 'Small (up to 12×12×12 in)' },
  { maxL: 18, maxW: 18, maxH: 18, surcharge: 5, label: 'Medium (up to 18×18×18 in)' },
  { maxL: 24, maxW: 24, maxH: 24, surcharge: 10, label: 'Large (up to 24×24×24 in)' },
  { maxL: 30, maxW: 30, maxH: 30, surcharge: 20, label: 'Extra Large (up to 30×30×30 in)' },
]

const MAX_WEIGHT = 30
const OVR_THRESHOLD = 15

function getBoxTier(dx, dy, dz) {
  if (!dx && !dy && !dz) return null
  for (const tier of BOX_TIERS) {
    if (dx <= tier.maxL && dy <= tier.maxW && dz <= tier.maxH) return tier
  }
  return 'rejected'
}

const emptyAddr = () => ({
  house_number: '',
  street: '',
  city: '',
  state: '',
  zip_code: '',
  apt_number: '',
})

export default function AddPackage() {
  const navigate = useNavigate()

  // ── Sender ────────────────────────────────────────────────────────────
  const [senderEmail, setSenderEmail] = useState('')
  const [senderFirst, setSenderFirst] = useState('')
  const [senderLast, setSenderLast] = useState('')
  const [senderPhone, setSenderPhone] = useState('')
  const [senderAddr, setSenderAddr] = useState(emptyAddr)
  const [lookingUp, setLookingUp] = useState(false)
  const [lookupMsg, setLookupMsg] = useState(null)
  const [senderFound, setSenderFound] = useState(false)

  // ── Recipient ─────────────────────────────────────────────────────────
  const [recipientEmail, setRecipientEmail] = useState('')
  const [recipientFirst, setRecipientFirst] = useState('')
  const [recipientLast, setRecipientLast] = useState('')
  const [recipientPhone, setRecipientPhone] = useState('')
  const [recipientAddr, setRecipientAddr] = useState(emptyAddr)
  const [recipientLookingUp, setRecipientLookingUp] = useState(false)
  const [recipientLookupMsg, setRecipientLookupMsg] = useState(null)
  const [recipientFound, setRecipientFound] = useState(false)

  // ── Package ───────────────────────────────────────────────────────────
  const [shipmentType, setShipmentType] = useState('')
  const [excessFee, setExcessFee] = useState('')
  const [weight, setWeight] = useState('')
  const [zone, setZone] = useState('')
  const [dimX, setDimX] = useState('')
  const [dimY, setDimY] = useState('')
  const [dimZ, setDimZ] = useState('')

  // ── State ─────────────────────────────────────────────────────────────
  const [quotedPrice, setQuotedPrice] = useState(null)
  const [submitResult, setSubmitResult] = useState(null)
  const [error, setError] = useState(null)
  const [loadingQuote, setLoadingQuote] = useState(false)
  const [loadingPay, setLoadingPay] = useState(false)

  // ── Derived ───────────────────────────────────────────────────────────
  const w = parseFloat(weight) || 0
  const dx = parseFloat(dimX) || 0
  const dy = parseFloat(dimY) || 0
  const dz = parseFloat(dimZ) || 0
  const weightTooHeavy = w > MAX_WEIGHT
  const isOverweight = w > OVR_THRESHOLD
  const boxTier = getBoxTier(dx, dy, dz)
  const boxRejected = boxTier === 'rejected'
  const effectiveType = isOverweight ? 'oversize' : shipmentType

  // ── Customer lookup (PROTECTED endpoint) ──────────────────────────────
  async function lookupSender() {
    if (!senderEmail.trim()) {
      setLookupMsg({ type: 'error', text: 'Enter an email to look up.' })
      return
    }

    setLookingUp(true)
    setLookupMsg(null)
    setSenderFound(false)

    try {
      const res = await authFetch(`/api/customer/lookup?email=${encodeURIComponent(senderEmail.trim())}`)

      if (res.status === 404) {
        setLookupMsg({
          type: 'info',
          text: 'No existing customer found — fill in details manually.',
        })
        setSenderFirst('')
        setSenderLast('')
        setSenderPhone('')
        setSenderAddr(emptyAddr())
        return
      }

      if (!res.ok) throw new Error('Lookup failed')

      const data = await res.json()
      const c = data.customer

      setSenderFirst(c.First_Name || '')
      setSenderLast(c.Last_Name || '')
      setSenderPhone(c.Phone_Number || '')
      setSenderAddr({
        house_number: c.House_Number || '',
        street: c.Street || '',
        city: c.City || '',
        state: c.State || '',
        zip_code: c.Zip_Code || ''
      
      })

      setSenderFound(true)
      setLookupMsg({ type: 'success', text: `Found: ${c.First_Name} ${c.Last_Name}` })
    } catch (err) {
      setLookupMsg({ type: 'error', text: err.message || 'Lookup failed' })
    } finally {
      setLookingUp(false)
    }
  }

  // ── Recipient lookup ──────────────────────────────────
  async function lookupRecipient() {
    if (!recipientEmail.trim()) {
      setRecipientLookupMsg({ type: 'error', text: 'Enter an email to look up.' })
      return
    }
 
    if (recipientEmail.trim().toLowerCase() === senderEmail.trim().toLowerCase()) {
      setRecipientLookupMsg({
        type: 'error',
        text: 'Recipient cannot be the same account as the sender.',
      })
      return
    }
 
    setRecipientLookingUp(true)
    setRecipientLookupMsg(null)
    setRecipientFound(false)
 
    try {
      const res = await authFetch(`/api/customer/lookup?email=${encodeURIComponent(recipientEmail.trim())}`)
 
      if (res.status === 404) {
        setRecipientLookupMsg({
          type: 'info',
          text: 'No existing customer found — fill in details manually.',
        })
        setRecipientFirst('')
        setRecipientLast('')
        setRecipientPhone('')
        setRecipientAddr(emptyAddr())
        return
      }
 
      if (!res.ok) throw new Error('Lookup failed')
 
      const data = await res.json()
      const c = data.customer
 
      setRecipientFirst(c.First_Name || '')
      setRecipientLast(c.Last_Name || '')
      setRecipientPhone(c.Phone_Number || '')
      setRecipientAddr({
        house_number: c.House_Number || '',
        street: c.Street || '',
        city: c.City || '',
        state: c.State || '',
        zip_code: c.Zip_Code || ''
      })
 
      setRecipientFound(true)
      setRecipientLookupMsg({ type: 'success', text: `Found: ${c.First_Name} ${c.Last_Name}` })
    } catch (err) {
      setRecipientLookupMsg({ type: 'error', text: err.message || 'Lookup failed' })
    } finally {
      setRecipientLookingUp(false)
    }
  }

  // ── Calculate price (PUBLIC endpoint) ──────────────────────────────────
  async function calculatePrice() {
    if (!effectiveType) {
      setError('Select a shipment type.')
      return
    }
    if (!weight || w <= 0) {
      setError('Enter a valid weight.')
      return
    }
    if (weightTooHeavy) {
      setError(`Max weight is ${MAX_WEIGHT} lbs.`)
      return
    }
    if (!zone) {
      setError('Select a zone.')
      return
    }
    if (boxRejected) {
      setError('Dimensions exceed 30×30×30 inches.')
      return
    }

    setError(null)
    setLoadingQuote(true)

    try {
      const q = new URLSearchParams({
        package_type: effectiveType,
        weight: String(weight),
        zone: String(zone),
      })
      if (excessFee) q.append('excess_fee', excessFee)
      if (dx > 0) q.append('dim_x', String(dx))
      if (dy > 0) q.append('dim_y', String(dy))
      if (dz > 0) q.append('dim_z', String(dz))

      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const res = await authFetch(`${API_BASE}/api/price?${q.toString()}`)

      const raw = await res.text()
      let data = {}
      try {
        data = raw ? JSON.parse(raw) : {}
      } catch {
        data = { error: raw?.slice(0, 240) }
      }

      if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`)
      setQuotedPrice(data.Tot_Price)
    } catch (err) {
      setError(err.message || 'Quote failed')
      setQuotedPrice(null)
    } finally {
      setLoadingQuote(false)
    }
  }

  // ── Pay & create (PROTECTED endpoint) ──────────────────────────────────
  async function payAndCreate() {
    setError(null)
    setSubmitResult(null)

    if (!senderFirst.trim() || !senderLast.trim()) {
      setError('Sender name is required.')
      return
    }
    if (!recipientFirst.trim() || !recipientLast.trim()) {
      setError('Recipient name is required.')
      return
    }

    const sa = senderAddr
    const ra = recipientAddr

    if (!sa.house_number || !sa.street || !sa.city || !sa.state || !sa.zip_code) {
      setError('Complete the sender address.')
      return
    }

    if (!ra.house_number || !ra.street || !ra.city || !ra.state || !ra.zip_code) {
      setError('Complete the recipient address.')
      return
    }

    if (!effectiveType || !weight || !zone) {
      setError('Package type, weight, and zone are required.')
      return
    }

    if (boxRejected) {
      setError('Dimensions exceed 30×30×30 inches.')
      return
    }

    setLoadingPay(true)

    try {
      const body = {
        sender_email: senderEmail.trim(),
        sender_first_name: senderFirst.trim(),
        sender_last_name: senderLast.trim(),
        sender_phone: senderPhone || null,
        sender_house_number: sa.house_number,
        sender_street: sa.street,
        sender_city: sa.city,
        sender_state: sa.state,
        sender_zip_code: sa.zip_code,
        sender_apt_number: sa.apt_number || null,
        sender_country: 'USA',

        recipient_email: recipientEmail.trim() || null,
        recipient_first_name: recipientFirst.trim(),
        recipient_last_name: recipientLast.trim(),
        recipient_phone: recipientPhone || null,
        recipient_house_number: ra.house_number,
        recipient_street: ra.street,
        recipient_city: ra.city,
        recipient_state: ra.state,
        recipient_zip_code: ra.zip_code,
        recipient_apt_number: ra.apt_number || null,
        recipient_country: 'USA',

        package_type: effectiveType,
        weight: Number(weight),
        zone: Number(zone),
        excess_fee: excessFee || null,
        dim_x: dx || undefined,
        dim_y: dy || undefined,
        dim_z: dz || undefined,
      }

      const res = await authFetch('/api/employee/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Could not create package')
      setSubmitResult(data)
      setQuotedPrice(data.price)
    } catch (err) {
      setError(err.message || 'Payment failed')
    } finally {
      setLoadingPay(false)
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
    <div className="add-package-page">
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
        <div className="price-calculator-hero">
          <img src={skyline} alt="" />
        </div>

        <div className="add-package-inner">
          <h2>Add package</h2>
          <p className="add-package-subtitle">
            Fill in sender, recipient, and package details to create a shipment.
          </p>

          {/* ── SENDER ── */}
          <div className="add-package-section">
            <h3>Sender</h3>

            {/* Email lookup */}
            <div className="ap-lookup-row">
              <div className="form-field" style={{ flex: 1 }}>
                <label htmlFor="ap-s-email">Customer email</label>
                <input
                  id="ap-s-email"
                  type="email"
                  value={senderEmail}
                  onChange={(e) => {
                    setSenderEmail(e.target.value)
                    setSenderFound(false)
                    setLookupMsg(null)
                  }}
                  placeholder="customer@example.com"
                  autoComplete="off"
                />
              </div>
              <button
                type="button"
                className="btn-calc ap-lookup-btn"
                onClick={lookupSender}
                disabled={lookingUp}
              >
                {lookingUp ? 'Looking up…' : 'Look up'}
              </button>
            </div>

            {lookupMsg && (
              <div className={`ap-lookup-msg ap-lookup-msg--${lookupMsg.type}`}>
                {lookupMsg.text}
              </div>
            )}

            <div className="add-package-grid" style={{ marginTop: 16 }}>
              <div className="form-field">
                <label>First name</label>
                <input
                  value={senderFirst}
                  onChange={(e) => setSenderFirst(e.target.value)}
                  disabled={senderFound}
                />
              </div>
              <div className="form-field">
                <label>Last name</label>
                <input
                  value={senderLast}
                  onChange={(e) => setSenderLast(e.target.value)}
                  disabled={senderFound}
                />
              </div>
              <div className="form-field">
                <label>Phone (optional)</label>
                <input value={senderPhone} onChange={(e) => setSenderPhone(e.target.value)} />
              </div>
              <div className="form-field">
                <label>House #</label>
                <input
                  value={senderAddr.house_number}
                  onChange={(e) =>
                    setSenderAddr({ ...senderAddr, house_number: e.target.value })
                  }
                  disabled={senderFound}
                />
              </div>
              <div className="form-field">
                <label>Street</label>
                <input
                  value={senderAddr.street}
                  onChange={(e) => setSenderAddr({ ...senderAddr, street: e.target.value })}
                  disabled={senderFound}
                />
              </div>
              <div className="form-field">
                <label>City</label>
                <input
                  value={senderAddr.city}
                  onChange={(e) => setSenderAddr({ ...senderAddr, city: e.target.value })}
                  disabled={senderFound}
                />
              </div>
              <div className="form-field">
                <label>State</label>
                <input
                  value={senderAddr.state}
                  onChange={(e) => setSenderAddr({ ...senderAddr, state: e.target.value })}
                  disabled={senderFound}
                />
              </div>
              <div className="form-field">
                <label>ZIP code</label>
                <input
                  maxLength={5}
                  value={senderAddr.zip_code}
                  onChange={(e) =>
                    setSenderAddr({ ...senderAddr, zip_code: e.target.value })
                  }
                  disabled={senderFound}
                />
              </div>
              
              <div className="form-field">
                <label>Apt (optional)</label>
                <input
                  value={senderAddr.apt_number}
                  onChange={(e) =>
                    setSenderAddr({ ...senderAddr, apt_number: e.target.value })
                  }
                />
              </div>
            </div>
            {senderFound && (
              <button
                type="button"
                className="ap-clear-btn"
                onClick={() => {
                  setSenderFound(false)
                  setSenderFirst('')
                  setSenderLast('')
                  setSenderPhone('')
                  setSenderAddr(emptyAddr())
                  setLookupMsg(null)
                }}
              >
                ✕ Clear and enter manually
              </button>
            )}
          </div>

          {/* ── RECIPIENT ── */}
          <div className="add-package-section">
            <h3>Recipient</h3>
            <p className="add-package-hint">
              Leave email blank if the recipient does not have one.
            </p>
 
            {/* Email lookup row */}
            <div className="ap-lookup-row">
              <div className="form-field" style={{ flex: 1 }}>
                <label htmlFor="ap-r-email">Email (optional)</label>
                <input
                  id="ap-r-email"
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => {
                    setRecipientEmail(e.target.value)
                    setRecipientFound(false)
                    setRecipientLookupMsg(null)
                  }}
                  placeholder="Optional"
                />
              </div>
              <button
                type="button"
                className="btn-calc ap-lookup-btn"
                onClick={lookupRecipient}
                disabled={recipientLookingUp}
              >
                {recipientLookingUp ? 'Looking up…' : 'Look up'}
              </button>
            </div>
 
            {recipientLookupMsg && (
              <div className={`ap-lookup-msg ap-lookup-msg--${recipientLookupMsg.type}`}>
                {recipientLookupMsg.text}
              </div>
            )}
 
            <div className="add-package-grid" style={{ marginTop: 16 }}>
              <div className="form-field">
                <label>First name</label>
                <input
                  value={recipientFirst}
                  onChange={(e) => setRecipientFirst(e.target.value)}
                  disabled={recipientFound}
                />
              </div>
              <div className="form-field">
                <label>Last name</label>
                <input
                  value={recipientLast}
                  onChange={(e) => setRecipientLast(e.target.value)}
                  disabled={recipientFound}
                />
              </div>
              <div className="form-field">
                <label>Phone (optional)</label>
                <input value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} />
              </div>
              <div className="form-field">
                <label>House #</label>
                <input
                  value={recipientAddr.house_number}
                  onChange={(e) =>
                    setRecipientAddr({ ...recipientAddr, house_number: e.target.value })
                  }
                  disabled={recipientFound}
                />
              </div>
              <div className="form-field">
                <label>Street</label>
                <input
                  value={recipientAddr.street}
                  onChange={(e) =>
                    setRecipientAddr({ ...recipientAddr, street: e.target.value })
                  }
                  disabled={recipientFound}
                />
              </div>
              <div className="form-field">
                <label>City</label>
                <input
                  value={recipientAddr.city}
                  onChange={(e) =>
                    setRecipientAddr({ ...recipientAddr, city: e.target.value })
                  }
                  disabled={recipientFound}
                />
              </div>
              <div className="form-field">
                <label>State</label>
                <input
                  value={recipientAddr.state}
                  onChange={(e) =>
                    setRecipientAddr({ ...recipientAddr, state: e.target.value })
                  }
                  disabled={recipientFound}
                />
              </div>
              <div className="form-field">
                <label>ZIP code</label>
                <input
                  maxLength={5}
                  value={recipientAddr.zip_code}
                  onChange={(e) =>
                    setRecipientAddr({ ...recipientAddr, zip_code: e.target.value })
                  }
                  disabled={recipientFound}
                />
              </div>
              <div className="form-field">
                <label>Apt (optional)</label>
                <input
                  value={recipientAddr.apt_number}
                  onChange={(e) =>
                    setRecipientAddr({ ...recipientAddr, apt_number: e.target.value })
                  }
                />
              </div>
            </div>
 
            {recipientFound && (
              <button
                type="button"
                className="ap-clear-btn"
                onClick={() => {
                  setRecipientFound(false)
                  setRecipientFirst('')
                  setRecipientLast('')
                  setRecipientPhone('')
                  setRecipientAddr(emptyAddr())
                  setRecipientLookupMsg(null)
                }}
              >
                ✕ Clear and enter manually
              </button>
            )}
          </div>

              {/* ── PACKAGE & PRICING ── */}
          <div className="add-package-section">
            <h3>Package details &amp; pricing</h3>
            <div className="price-calculator-card" style={{ maxWidth: '100%', boxShadow: 'none', border: 'none', padding: 0 }}>

              {/* Shipment type */}
              <div className="form-field" style={{ marginBottom: 20 }}>
                <label>Shipment type</label>
                <select value={shipmentType} onChange={(e) => setShipmentType(e.target.value)} disabled={isOverweight}
                  style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--border, #dbe4ef)', borderRadius: 10, fontSize: '1rem', fontFamily: 'inherit' }}>
                  <option value="">Select type</option>
                  <option value="general shipping">General shipping</option>
                  <option value="express">Express</option>
                </select>
                {isOverweight && (
                  <span className="calc-notice calc-notice--warn">
                    Weight over {OVR_THRESHOLD} lbs — automatically classified as oversize
                  </span>
                )}
              </div>

              {/* Weight */}
              <div className="form-field" style={{ marginBottom: 20 }}>
                <label>Weight (lbs)</label>
                <input type="number" min="0" max={MAX_WEIGHT} step="0.01"
                  value={weight} onChange={(e) => { setWeight(e.target.value); setQuotedPrice(null) }}
                  placeholder="0.00"
                  style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--border, #dbe4ef)', borderRadius: 10, fontSize: '1rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
                {weightTooHeavy && <span className="calc-notice calc-notice--error">Exceeds maximum of {MAX_WEIGHT} lbs</span>}
              </div>

              {/* Dimensions */}
              <div className="form-field" style={{ marginBottom: 20 }}>
                <label>Dimensions (inches) — Length × Width × Height</label>
                <div className="dim-row">
                  <input type="number" min="0" step="0.1" value={dimX} onChange={(e) => { setDimX(e.target.value); setQuotedPrice(null) }} placeholder="L"
                    style={{ width: 80, padding: '12px 8px', border: '1px solid var(--border, #dbe4ef)', borderRadius: 10, fontSize: '1rem', textAlign: 'center' }} />
                  <span className="dim-sep">×</span>
                  <input type="number" min="0" step="0.1" value={dimY} onChange={(e) => { setDimY(e.target.value); setQuotedPrice(null) }} placeholder="W"
                    style={{ width: 80, padding: '12px 8px', border: '1px solid var(--border, #dbe4ef)', borderRadius: 10, fontSize: '1rem', textAlign: 'center' }} />
                  <span className="dim-sep">×</span>
                  <input type="number" min="0" step="0.1" value={dimZ} onChange={(e) => { setDimZ(e.target.value); setQuotedPrice(null) }} placeholder="H"
                    style={{ width: 80, padding: '12px 8px', border: '1px solid var(--border, #dbe4ef)', borderRadius: 10, fontSize: '1rem', textAlign: 'center' }} />
                </div>
                {boxRejected && <span className="calc-notice calc-notice--error">Exceeds maximum size of 30×30×30 inches</span>}
                {boxTier && boxTier !== 'rejected' && (
                  <span className="calc-notice calc-notice--info">
                    {boxTier.label}{boxTier.surcharge > 0 ? ` — +$${boxTier.surcharge.toFixed(2)} surcharge` : ' — no surcharge'}
                  </span>
                )}
              </div>

              {/* Zone */}
              <div className="form-field" style={{ marginBottom: 20 }}>
                <label>Destination zone</label>
                <select value={zone} onChange={(e) => { setZone(e.target.value); setQuotedPrice(null) }}
                  style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--border, #dbe4ef)', borderRadius: 10, fontSize: '1rem', fontFamily: 'inherit' }}>
                  <option value="">Select zone</option>
                  {ZONES.map(z => <option key={z.value} value={z.value}>{z.label}</option>)}
                </select>
              </div>

              {/* Excess fee */}
              <div className="form-field" style={{ marginBottom: 20 }}>
                <label>Add-on fee (optional)</label>
                <select value={excessFee} onChange={(e) => { setExcessFee(e.target.value); setQuotedPrice(null) }}
                  style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--border, #dbe4ef)', borderRadius: 10, fontSize: '1rem', fontFamily: 'inherit' }}>
                  <option value="">None</option>
                  <option value="Fragile Handling">Fragile handling</option>
                  <option value="Fuel Surcharge">Fuel surcharge</option>
                  <option value="Hazardous Material">Hazardous material</option>
                  <option value="Signature Required">Signature required</option>
                </select>
              </div>

              {/* Summary */}
              {effectiveType && weight && zone && !boxRejected && (
                <div className="calc-summary">
                  <span>Type: <strong>{effectiveType.charAt(0).toUpperCase() + effectiveType.slice(1)}</strong></span>
                  <span>Cubic inches: {dimX*dimY*dimZ} in³ </span>
                  <span>{weight} lbs</span>
                  <span>{ZONES.find(z => z.value === zone)?.label}</span>
                  {boxTier && boxTier !== 'rejected' && boxTier.surcharge > 0 && (
                    <span>Box surcharge: +${boxTier.surcharge.toFixed(2)}</span>
                  )}
                  {excessFee && <span>Add-on: {excessFee}</span>}
                </div>
              )}

              <button type="button" className="btn-calc" onClick={calculatePrice}
                disabled={loadingQuote || weightTooHeavy || boxRejected}>
                {loadingQuote ? 'Calculating…' : 'Calculate price'}
              </button>

              {quotedPrice != null && !Number.isNaN(Number(quotedPrice)) && (
                <div className="price-calculator-result">
                  Estimated total: <strong>${parseFloat(quotedPrice).toFixed(2)}</strong>
                </div>
              )}
            </div>
          </div>

          {error && <div className="add-package-error">{error}</div>}

          {/* ── CREATE ── */}
          <div className="add-package-section">
            <h3>Record payment &amp; create shipment</h3>
            <p className="add-package-hint">Calculate a price first, then click below to create the package and record payment.</p>
            <div className="add-package-actions">
              <button type="button" className="btn-calc" disabled={loadingPay || !quotedPrice} onClick={payAndCreate}
                style={{ opacity: !quotedPrice ? 0.5 : 1 }}>
                {loadingPay ? 'Processing…' : 'Pay & create package'}
              </button>
            </div>
            {submitResult && (
              <div className="add-package-result">
                ✅ Created <code>{submitResult.tracking_number}</code> — charged ${parseFloat(submitResult.price).toFixed(2)} to sender account.
              </div>
            )}
          </div>

          {/* The rest of your JSX (package details & pricing, create button, footer) can remain unchanged */}
          {/* You can keep the remainder of your original component below this point if you'd like. */}
        </div>
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <div>© {new Date().getFullYear()} National Postal Service</div>
        </div>
      </footer>
    </div>


  )
}
