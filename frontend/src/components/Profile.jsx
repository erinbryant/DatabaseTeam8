import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    workAddress: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const departments = ['Mail Sorting', 'Customer Service', 'Delivery', 'Management', 'Finance', 'IT Support'];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }

      const data = await response.json();
      setUser(data.user);
      setFormData({
        name: data.user.name,
        email: data.user.email,
        phoneNumber: data.user.phoneNumber,
        workAddress: data.user.workAddress
      });
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Update failed');
        return;
      }

      setUser(data.user);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      localStorage.setItem('user', JSON.stringify(data.user));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Update error:', err);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Password change failed');
        return;
      }

      setSuccess('Password changed successfully!');
      setShowChangePassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Password change error:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('employeeId');
    navigate('/login');
  };

  if (loading) return <div className="profile-container"><p>Loading...</p></div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h2>👤 Employee Profile</h2>
          <div className="profile-avatar">{user?.name?.charAt(0)}</div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {!isEditing && !showChangePassword ? (
          <div className="profile-view">
            <div className="profile-section">
              <h3>Basic Information</h3>
              <div className="profile-grid">
                <div className="profile-item">
                  <label>Name</label>
                  <p>{user?.name}</p>
                </div>
                <div className="profile-item">
                  <label>Email</label>
                  <p>{user?.email}</p>
                </div>
                <div className="profile-item">
                  <label>Phone Number</label>
                  <p>{user?.phoneNumber}</p>
                </div>
                <div className="profile-item">
                  <label>Work Address</label>
                  <p>{user?.workAddress}</p>
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h3>Employment Details</h3>
              <div className="profile-grid">
                <div className="profile-item">
                  <label>Employee ID</label>
                  <p>{user?.employeeId}</p>
                </div>
                <div className="profile-item">
                  <label>Department</label>
                  <p>{user?.department}</p>
                </div>
                <div className="profile-item">
                  <label>Position</label>
                  <p>{user?.position}</p>
                </div>
                <div className="profile-item">
                  <label>Hire Date</label>
                  <p>{user?.hireDate ? new Date(user.hireDate).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="button-group">
              <button onClick={() => setIsEditing(true)} className="edit-btn">
                ✏️ Edit Profile
              </button>
              <button onClick={() => setShowChangePassword(true)} className="change-password-btn">
                🔒 Change Password
              </button>
              <button onClick={handleLogout} className="logout-btn">
                🚪 Logout
              </button>
            </div>
          </div>
        ) : showChangePassword ? (
          <form onSubmit={handleChangePassword}>
            <h3>Change Password</h3>
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
                placeholder="Enter your current password"
              />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                placeholder="Enter your new password"
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
                placeholder="Confirm your new password"
              />
            </div>
            <div className="button-group">
              <button type="submit" className="save-btn">Save Password</button>
              <button
                type="button"
                onClick={() => setShowChangePassword(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleUpdateProfile}>
            <h3>Edit Profile</h3>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleFormChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="workAddress">Work Address</label>
              <input
                type="text"
                id="workAddress"
                name="workAddress"
                value={formData.workAddress}
                onChange={handleFormChange}
              />
            </div>
            <div className="button-group">
              <button type="submit" className="save-btn">Save Changes</button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;