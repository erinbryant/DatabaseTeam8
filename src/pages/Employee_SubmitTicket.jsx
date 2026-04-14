import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './css/Employee_SubmitTicket.css'
import { authFetch } from '../authFetch'

function Employee_SubmitTicket() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    userId: '',
    packageId: '',
    employeeId: '',
    issueType: '',
    description: '',
  })

  const [successMessage, setSuccessMessage] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Dropdown data
  const [customers, setCustomers] = useState([])
  const [packages, setPackages] = useState([])
  const [employees, setEmployees] = useState([])

  useEffect(() => {
    authFetch('/api/customers')
      .then((r) => r.json())
      .then((data) => {
        setCustomers(Array.isArray(data) ? data : [])
      })
      .catch(() => setCustomers([]))

    authFetch('/api/packages')
      .then((r) => r.json())
      .then((data) => setPackages(Array.isArray(data) ? data : []))
      .catch(() => setPackages([]))

    
    authFetch('/api/employees')
      .then((r) => r.json())
      .then((data) => setEmployees(Array.isArray(data) ? data : []))
      .catch(() => setEmployees([]))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    try {
      const response = await authFetch('/api/support-tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          User_ID: formData.userId,
          Package_ID: formData.packageId,
          Assigned_Employee_ID: formData.employeeId,
          Issue_Type: Number(formData.issueType),
          Description: formData.description,
          submittedAt: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        setSuccessMessage(true)
        setFormData({
          userId: '',
          packageId: '',
          employeeId: '',
          issueType: '',
          description: '',
        })
        setTimeout(() => setSuccessMessage(false), 5000)
      } else {
        const data = await response.json().catch(() => ({}))
        setErrorMessage(data?.message || 'Failed to submit ticket. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting ticket:', error)
      setErrorMessage('Failed to submit ticket. Please try again.')
    }
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <button onClick={() => navigate('/employee-support')} className="back-btn">
          ← Back
        </button>
        <h1>Support Ticket</h1>
      </div>

      {successMessage && (
        <div className="success-message">✓ Ticket submitted successfully!</div>
      )}

      {errorMessage && <div className="error-message">⚠ {errorMessage}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="userId">Customer ID *</label>
          <input 
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="packageId">Package ID *</label>
          <input 
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
              required
          />
        </div>

        <div className="form-group">
          <label htmlFor="employeeId">Employee ID *</label>
          <input
            type="text"
            id="employeeId"
            name="employeeId"
            value={formData.employeeId}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="issueType">Issue Category *</label>
          <select
            id="issueType"
            name="issueType"
            value={formData.issueType}
            onChange={handleChange}
            required
          >
            <option value="">-- Select --</option>
            <option value="0">Lost Package</option>
            <option value="1">Damaged Package</option>
            <option value="2">Delivery Delay</option>
            <option value="3">Wrong Address</option>
            <option value="4">Missing Item</option>
            <option value="5">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">Submit Ticket</button>
      </form>
    </div>
  )
}

export default Employee_SubmitTicket