import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './css/EmployeeSupport.css'
// import './css/home.css'
import { authFetch } from '../authFetch'

const STATUS_MAP = {
  0: { label: 'Open', color: '#dc2626', bg: '#fef2f2' },
  1: { label: 'Pending', color: '#d97706', bg: '#fffbeb' },
  2: { label: 'Closed', color: '#16a34a', bg: '#f0fdf4' },
}

const ISSUE_TYPE_MAP = {
  0: 'Lost Package',
  1: 'Damaged Package',
  2: 'Delivery Delay',
  3: 'Wrong Address',
  4: 'Missing Item',
  5: 'Other',
}

const statusOptions = [
  { value: 0, label: 'Open' },
  { value: 1, label: 'Pending' },
  { value: 2, label: 'Closed' },
]

export default function EmployeeSupport() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  /* Updated search bar*/
  const [searchTerm, setSearchTerm] = useState('')

  const [editTicket, setEditTicket] = useState(null)
  const [editStatus, setEditStatus] = useState(0)
  const [editNote, setEditNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    fetchTickets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchTickets = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await authFetch('/api/support-tickets')
      if (!res.ok) throw new Error('Failed to fetch tickets')
      const data = await res.json()
      setTickets(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const openEdit = (ticket) => {
    setEditTicket(ticket)
    setEditStatus(ticket.Ticket_Status_Code)
    setEditNote(ticket.Resolution_Note || '')
    setSaveSuccess(false)
  }

  const closeEdit = () => {
    setEditTicket(null)
    setEditNote('')
    setSaveSuccess(false)
  }

  const handleSave = async () => {
    if (!editTicket) return
    setSaving(true)
    try {
      const res = await authFetch(`/api/support-tickets/${editTicket.Ticket_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Ticket_Status_Code: editStatus,
          Resolution_Note: editNote,
        }),
      })

      if (!res.ok) throw new Error('Failed to update ticket')

      setTickets((prev) =>
        prev.map((t) =>
          t.Ticket_ID === editTicket.Ticket_ID
            ? { ...t, Ticket_Status_Code: editStatus, Resolution_Note: editNote }
            : t
        )
      )

      setSaveSuccess(true)
      setTimeout(() => closeEdit(), 1000)
    } catch (err) {
      alert('Error saving: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const filtered = tickets.filter((ticket) => {
    const matchesStatus = 
    filterStatus === 'all' ||
    String(ticket.Ticket_Status_Code) === filterStatus;

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      ticket.Ticket_ID?.toString().includes(searchLower) ||
      ticket.User_ID?.toString().includes(searchLower) ||
      ticket.Package_ID?.toString().includes(searchLower);

    return matchesStatus && matchesSearch;
  })

  return (
    <>
      <div className="es-root">
        <nav className="es-nav">
          
          <span className="es-nav-brand">National Postal Service</span>
          <Link to="/employee_home" className="es-nav-link">
            Employee Home
          </Link>
        </nav>


        {/* Header */}
        <div className="es-header">
          <h1>Support Ticket Management</h1>
          <p>Review and resolve customer support tickets</p>
          
        </div>
        

        {/* Body */}
        <div className="es-body">
          {/* Toolbar */}
          <div className="es-toolbar">
            <span className="es-count">
              {filtered.length} ticket{filtered.length !== 1 ? 's' : ''}
              {filterStatus !== 'all'
                ? ` · ${STATUS_MAP[Number(filterStatus)]?.label}`
                : ''}
            </span>
            <div className="es-filters">
              <Link to="/employee/submit-ticket" className="es-add-btn">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Ticket
              </Link>

              <button
                className={`es-filter-btn ${
                  filterStatus === 'all' ? 'active' : ''
                }`}
                onClick={() => setFilterStatus('all')}
              >
                All
              </button>

              {statusOptions.map((s) => (
                <button
                  key={s.value}
                  className={`es-filter-btn ${
                    filterStatus === String(s.value) ? 'active' : ''
                  }`}
                  onClick={() => setFilterStatus(String(s.value))}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <input
            type="text"
            className="es-search"
            placeholder="Search by Ticket ID, Customer ID, or Package ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Table */}
          {loading ? (
            <div className="es-spinner" />
          ) : error ? (
            <div className="es-error">⚠ {error}</div>
          ) : (
            <div className="es-table-wrap">
              <table className="es-table">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Customer ID</th>
                    <th>Package ID</th>
                    <th>Assigned Emp.</th>
                    <th>Issue Type</th>
                    <th>Description</th>
                    <th>Resolution Note</th>
                    <th>Status</th>
                    <th>Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={9}>
                        <div className="es-empty">No tickets found.</div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((t) => {
                      const status =
                        STATUS_MAP[t.Ticket_Status_Code] || STATUS_MAP[0]
                      return (
                        <tr key={t.Ticket_ID}>
                          <td>
                            <span className="es-ticket-id">#{t.Ticket_ID}</span>
                          </td>
                          <td>{t.User_ID}</td>
                          <td>
                            <span className="es-mono">{t.Package_ID}</span>
                          </td>
                          <td>{t.Assigned_Employee_ID}</td>
                          <td>
                            {ISSUE_TYPE_MAP[t.Issue_Type] ??
                              `Type ${t.Issue_Type}`}
                          </td>
                          <td>
                            <span className="es-desc" title={t.Description}>
                              {t.Description || (
                                <span style={{ color: '#ccc' }}>—</span>
                              )}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`es-note ${
                                !t.Resolution_Note ? 'empty' : ''
                              }`}
                              title={t.Resolution_Note}
                            >
                              {t.Resolution_Note || 'No note yet'}
                            </span>
                          </td>
                          <td>
                            <span
                              className="es-badge"
                              style={{
                                color: status.color,
                                background: status.bg,
                              }}
                            >
                              {status.label}
                            </span>
                          </td>
                          <td>
                            <button
                              className="es-edit-btn"
                              onClick={() => openEdit(t)}
                              title="Edit ticket"
                            >
                              <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editTicket && (
        <div
          className="es-overlay"
          onClick={(e) => e.target === e.currentTarget && closeEdit()}
        >
          <div className="es-modal">
            <div className="es-modal-header">
              <div>
                <h2>Edit Ticket #{editTicket.Ticket_ID}</h2>
                <span>Package: {editTicket.Package_ID}</span>
              </div>
              <button className="es-modal-close" onClick={closeEdit}>
                ✕
              </button>
            </div>

            <div className="es-modal-body">
              <div className="es-info-grid">
                <div className="es-info-item">
                  <div className="es-info-label">Customer ID</div>
                  <div className="es-info-value">{editTicket.User_ID}</div>
                </div>
                <div className="es-info-item">
                  <div className="es-info-label">Assigned Employee</div>
                  <div className="es-info-value">
                    {editTicket.Assigned_Employee_ID}
                  </div>
                </div>
                <div className="es-info-item" style={{ gridColumn: 'span 2' }}>
                  <div className="es-info-label">Issue Type</div>
                  <div className="es-info-value">
                    {ISSUE_TYPE_MAP[editTicket.Issue_Type] ??
                      `Type ${editTicket.Issue_Type}`}
                  </div>
                </div>
                {editTicket.Description && (
                  <div className="es-info-item" style={{ gridColumn: 'span 2' }}>
                    <div className="es-info-label">Description</div>
                    <div
                      className="es-info-value"
                      style={{
                        fontWeight: 400,
                        fontSize: '0.82rem',
                        color: '#555',
                      }}
                    >
                      {editTicket.Description}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="es-field-label">Ticket Status</div>
                <div className="es-status-group">
                  {statusOptions.map((s) => (
                    <button
                      key={s.value}
                      className={`es-status-opt ${
                        editStatus === s.value ? `sel-${s.value}` : ''
                      }`}
                      onClick={() => setEditStatus(s.value)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="es-field-label">Resolution Note</div>
                <textarea
                  className="es-textarea"
                  placeholder="Enter resolution details or internal notes..."
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                />
              </div>

              <button
                className={`es-save-btn ${saveSuccess ? 'success' : ''}`}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving…' : saveSuccess ? '✓ Saved!' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}