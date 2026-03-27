import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/Auth.css';
 
export default function Profile() {
  const [user, setUser]                             = useState(null);
  const [isEditing, setIsEditing]                   = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [error, setError]                           = useState('');
  const [success, setSuccess]                       = useState('');
  const [loading, setLoading]                       = useState(true);
  const navigate = useNavigate();
 
  const [formData, setFormData] = useState({
    Email_Address: '',
    Phone_Number: ''
  });
 
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
 
  useEffect(() => { fetchProfile(); }, []);
 
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }
 
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
        Email_Address: data.user.Email_Address || '',
        Phone_Number:  data.user.Phone_Number  || ''
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };
 
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };
 
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (!response.ok) { setError(data.message || 'Update failed'); return; }
      setUser(data.user);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      localStorage.setItem('user', JSON.stringify(data.user));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };
 
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match'); return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword:     passwordData.newPassword
        })
      });
      const data = await response.json();
      if (!response.ok) { setError(data.message || 'Password change failed'); return; }
      setSuccess('Password changed successfully!');
      setShowChangePassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };
 
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    localStorage.removeItem('rememberMe');
    navigate('/login');
  };
 
  if (loading) return <div className="profile-container"><p>Loading...</p></div>;
  if (!user)   return <div className="profile-container"><p>Could not load profile.</p></div>;
 
  return (
    <div className="profile-container">
      <div className="profile-card">
 
        <div className="profile-header">
          <h2>👤 Employee Profile</h2>
          <div className="profile-avatar">
            {user.First_Name?.charAt(0)}{user.Last_Name?.charAt(0)}
          </div>
        </div>
 
        {error   && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
 
        {/* ── VIEW MODE ── */}
        {!isEditing && !showChangePassword && (
          <div className="profile-view">
 
            <div className="profile-section">
              <h3>Basic Information</h3>
              <div className="profile-grid">
                <div className="profile-item">
                  <label>Name</label>
                  <p>{user.First_Name} {user.Middle_Name} {user.Last_Name}</p>
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
                  <label>Post Office</label>
                  <p>{user.Office_City}, {user.Office_State}</p>
                </div>
              </div>
            </div>
 
            <div className="profile-section">
              <h3>Employment Details</h3>
              <div className="profile-grid">
                <div className="profile-item">
                  <label>Employee ID</label>
                  <p>{user.Employee_ID}</p>
                </div>
                <div className="profile-item">
                  <label>Department</label>
                  <p>{user.Department_Name}</p>
                </div>
                <div className="profile-item">
                  <label>Position</label>
                  <p>{user.Role_Name}</p>
                </div>
                <div className="profile-item">
                  <label>Supervisor</label>
                  <p>{user.Supervisor || 'None'}</p>
                </div>
                <div className="profile-item">
                  <label>Salary</label>
                  <p>${parseFloat(user.Salary || 0).toLocaleString()}</p>
                </div>
                <div className="profile-item">
                  <label>Hours Worked</label>
                  <p>{user.Hours_Worked} hrs</p>
                </div>
              </div>
            </div>
 
            <div className="button-group">
              <button onClick={() => setIsEditing(true)} className="edit-btn">✏️ Edit Profile</button>
              <button onClick={() => setShowChangePassword(true)} className="change-password-btn">🔒 Change Password</button>
              <button onClick={() => navigate('/employee_home')} className="edit-btn">🏠 Home</button>
              <button onClick={handleLogout} className="logout-btn">🚪 Logout</button>
            </div>
          </div>
        )}
 
        {/* ── CHANGE PASSWORD ── */}
        {showChangePassword && (
          <form onSubmit={handleChangePassword}>
            <h3>Change Password</h3>
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input type="password" id="currentPassword" name="currentPassword"
                value={passwordData.currentPassword} onChange={handlePasswordChange}
                required placeholder="Enter your current password" />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input type="password" id="newPassword" name="newPassword"
                value={passwordData.newPassword} onChange={handlePasswordChange}
                required placeholder="Enter your new password" />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input type="password" id="confirmPassword" name="confirmPassword"
                value={passwordData.confirmPassword} onChange={handlePasswordChange}
                required placeholder="Confirm your new password" />
            </div>
            <div className="button-group">
              <button type="submit" className="save-btn">Save Password</button>
              <button type="button" onClick={() => setShowChangePassword(false)} className="cancel-btn">Cancel</button>
            </div>
          </form>
        )}
 
        {/* ── EDIT PROFILE ── */}
        {isEditing && (
          <form onSubmit={handleUpdateProfile}>
            <h3>Edit Profile</h3>
            <div className="form-group">
              <label htmlFor="Email_Address">Email</label>
              <input type="email" id="Email_Address" name="Email_Address"
                value={formData.Email_Address} onChange={handleFormChange} />
            </div>
            <div className="form-group">
              <label htmlFor="Phone_Number">Phone Number</label>
              <input type="tel" id="Phone_Number" name="Phone_Number"
                value={formData.Phone_Number} onChange={handleFormChange} />
            </div>
            <div className="button-group">
              <button type="submit" className="save-btn">Save Changes</button>
              <button type="button" onClick={() => setIsEditing(false)} className="cancel-btn">Cancel</button>
            </div>
          </form>
        )}
 
      </div>
    </div>
  );
}
 