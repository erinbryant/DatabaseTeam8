import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/Auth.css';

const API_BASE = import.meta.env.VITE_API_URL || ''

export default function CustomerProfile() {
  const [user, setUser]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    Email_Address: '',
    Phone_Number:  '',
    House_Number:  '',
    Street:        '',
    City:          '',
    State:         '',
    Zip_First3:    '',
    Zip_Last2:     '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    fetch(`${API_BASE}/api/customer/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setUser(data.user);
        setFormData({
          Email_Address: data.user.Email_Address || '',
          Phone_Number:  data.user.Phone_Number  || '',
          House_Number:  data.user.House_Number  || '',
          Street:        data.user.Street        || '',
          City:          data.user.City          || '',
          State:         data.user.State         || '',
          Zip_First3:    data.user.Zip_First3    || '',
          Zip_Last2:     data.user.Zip_Last2     || '',
        });
        setLoading(false);
      })
      .catch(() => { setError('Failed to load profile'); setLoading(false); })
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/customer/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) { setError(data.message || 'Update failed'); return; }

      setUser(data.user);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    navigate('/login');
  };

  if (loading) return <div className="profile-container"><p>Loading...</p></div>;
  if (!user)   return <div className="profile-container"><p>{error || 'Could not load profile.'}</p></div>;

  return (
    <div className="profile-container">
      <div className="profile-card">

        <div className="profile-header">
          <h2>👤 Customer Profile</h2>
          <div className="profile-avatar">
            {user.First_Name?.charAt(0)}{user.Last_Name?.charAt(0)}
          </div>
        </div>

        {error   && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* ── VIEW MODE ── */}
        {!isEditing && (
          <div className="profile-view">
            <div className="profile-section">
              <h3>Basic Information</h3>
              <div className="profile-grid">
                <div className="profile-item">
                  <label>Name</label>
                  <p>{user.First_Name} {user.Last_Name}</p>
                </div>
                <div className="profile-item">
                  <label>Email</label>
                  <p>{user.Email_Address}</p>
                </div>
                <div className="profile-item">
                  <label>Phone Number</label>
                  <p>{user.Phone_Number || 'N/A'}</p>
                </div>
                <div className="profile-item">
                  <label>Address</label>
                  <p>
                    {user.House_Number} {user.Street}<br />
                    {user.City}, {user.State} {user.Zip_First3}{user.Zip_Last2}
                  </p>
                </div>
              </div>
            </div>

            <div className="button-group">
              <button onClick={() => setIsEditing(true)} className="edit-btn">
                ✏️ Edit Profile
              </button>
              <button onClick={() => navigate('/customer_home')} className="edit-btn">
                🏠 Home
              </button>
              <button onClick={handleLogout} className="logout-btn">
                🚪 Logout
              </button>
            </div>
          </div>
        )}

        {/* ── EDIT MODE ── */}
        {isEditing && (
          <form onSubmit={handleUpdateProfile}>
            <h3>Edit Profile</h3>

            <div className="form-group">
              <label htmlFor="Email_Address">Email</label>
              <input
                type="email" id="Email_Address" name="Email_Address"
                value={formData.Email_Address} onChange={handleFormChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="Phone_Number">Phone Number</label>
              <input
                type="tel" id="Phone_Number" name="Phone_Number"
                value={formData.Phone_Number} onChange={handleFormChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="House_Number">House Number</label>
                <input
                  type="text" id="House_Number" name="House_Number"
                  value={formData.House_Number} onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="Street">Street</label>
                <input
                  type="text" id="Street" name="Street"
                  value={formData.Street} onChange={handleFormChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="City">City</label>
                <input
                  type="text" id="City" name="City"
                  value={formData.City} onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="State">State</label>
                <input
                  type="text" id="State" name="State"
                  value={formData.State} onChange={handleFormChange}
                  maxLength={2} placeholder="TX"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="Zip_First3">Zip (First 3)</label>
                <input
                  type="text" id="Zip_First3" name="Zip_First3"
                  value={formData.Zip_First3} onChange={handleFormChange}
                  maxLength={3} placeholder="770"
                />
              </div>
              <div className="form-group">
                <label htmlFor="Zip_Last2">Zip (Last 2)</label>
                <input
                  type="text" id="Zip_Last2" name="Zip_Last2"
                  value={formData.Zip_Last2} onChange={handleFormChange}
                  maxLength={2} placeholder="01"
                />
              </div>
            </div>

            <div className="button-group">
              <button type="submit" className="save-btn">Save Changes</button>
              <button type="button" onClick={() => setIsEditing(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}