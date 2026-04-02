import React, { useState } from 'react';
import './css/SubmitTicket.css';

const API_BASE = import.meta.env.VITE_API_URL || ''

function SubmitTicket() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    transactionId: '',
    category: '',
    description: ''
  });

  const [successMessage, setSuccessMessage] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE}/api/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          submittedAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        setSuccessMessage(true);
        setFormData({
          name: '',
          email: '',
          transactionId: '',
          category: '',
          description: ''
        });

        setTimeout(() => setSuccessMessage(false), 5000);
      }
    } catch (error) {
      console.error('Error submitting ticket:', error);
    }
  };

  return (
    <div className="form-container">
      <h1>Support Ticket</h1>

      {successMessage && (
        <div className="success-message">
          ✓ Ticket submitted successfully!
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name *</label>
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
          <label htmlFor="email">Email *</label>
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
          <label htmlFor="transactionId">Transaction ID *</label>
          <input
            type="text"
            id="transactionId"
            name="transactionId"
            value={formData.transactionId}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Issue Category *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">-- Select --</option>
            <option value="transaction-failed">Transaction Failed</option>
            <option value="payment-issue">Payment Issue</option>
            <option value="delivery-issue">Delivery Issue</option>
            <option value="other">Other</option>
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
          ></textarea>
        </div>

        <button type="submit">Submit Ticket</button>
      </form>
    </div>
  );
}

export default SubmitTicket;
