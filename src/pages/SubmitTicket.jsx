import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/SubmitTicket.css';
import { authFetch } from '../authFetch'
import {
  validateAll,
  validateTrackingNumber,
  validateTicketDescription,
  validateRequired,
} from '../Validation'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function SubmitTicket() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    // name: '',
    // email: '',
    packageId: '',
    issueType: '',
    description: ''
  });

  const [packages, setPackages] = useState([])
  const [successMessage, setSuccessMessage] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    authFetch('/api/customer/my-packages')
      .then((res) => {
        if (res.status === 401) {
          navigate('/login')
          throw new Error('Unauthorized')
        }
        if (!res.ok) throw new Error('Failed to load packages')
        return res.json()
      })
      // .then((data) => setPackages(Array.isArray(data) ? data : []))
      .then((data) => {
        // console.log('packages data:', data) // check this in the browser console
        setPackages(Array.isArray(data) ? data : [])
      })
      .catch((err) => setErrorMessage(err.message))
  }, [navigate])

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('')

    const validationError = validateAll([
      [formData.packageId, validateTrackingNumber],
      [formData.issueType, validateRequired, 'Issue category'],
      [formData.description, validateTicketDescription],
    ])

    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    try {
      const response = await authFetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Tracking_Number: formData.packageId,
          Issue_Type: Number(formData.issueType),
          Description: formData.description,
        }),
      })

      if (response.ok) {
        setSuccessMessage(true)
        setFormData({ packageId: '', issueType: '', description: '' })
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
        <button onClick={() => navigate('/customer_home')} className="back-btn">
          ← Back
        </button>
        <h1>Support Ticket</h1>
      </div>

      {successMessage && (
        <div className="success-message">
          ✓ Ticket submitted successfully!
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* <div className="form-group">
          <label htmlFor="name">Full Name *</label>
          <input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div> */}

        <div className="form-group">
          <label htmlFor="packageId">Package ID *</label>
          <select
            id="packageId"
            name="packageId"
            value={formData.packageId}
            onChange={handleChange}
            required
          >
            <option value="">-- Select a Package --</option>
            {packages.map((pkg) => (
              <option key={pkg.Tracking_Number} value={pkg.Tracking_Number}>
                {pkg.Tracking_Number}
              </option>
            ))}
          </select>
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
            <option value="1">Failed transaction</option>
            <option value="2">Payment issue</option>
            <option value="3">Delivery issue</option>
            <option value="4">Other</option>
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
  );
}

export default SubmitTicket;