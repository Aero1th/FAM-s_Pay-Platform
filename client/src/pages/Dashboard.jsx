import React, { useState } from 'react';

const DEFAULT_AVATAR = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXI5UEbkacjL3jxlp8sYB3Bd6qlfR7vSGAWGBMsOicuR3vz5WfaiUYxQBs&s=10';

export default function Dashboard({ currentUser, onUserUpdate }) {
  const [profileForm, setProfileForm] = useState({
    name: currentUser.name || '',
    department: currentUser.department || 'Software Engineering',
    avatar: currentUser.profile?.avatar || DEFAULT_AVATAR,
    bio: currentUser.profile?.bio || '',
    phone: currentUser.profile?.phone || '',
    skills: currentUser.profile?.skills || ''
  });
  const [savedMsg, setSavedMsg] = useState('');

  const grossPay = Number(currentUser.hourlyRate || 0) * Number(currentUser.hoursWorked || 0);
  const estimatedTax = grossPay * 0.1;
  const netPay = grossPay - estimatedTax;

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: profileForm.name,
        department: profileForm.department,
        profile: {
          avatar: profileForm.avatar.trim() || DEFAULT_AVATAR,
          bio: profileForm.bio,
          phone: profileForm.phone,
          skills: profileForm.skills
        }
      };

      const res = await fetch(`http://localhost:5000/api/employees/${currentUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const updatedUser = await res.json();
      localStorage.setItem('famspay_user', JSON.stringify(updatedUser));
      onUserUpdate(updatedUser);
      setSavedMsg('Profile updated successfully!');
      setTimeout(() => setSavedMsg(''), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  return (
    <div className="portal-grid">
      {/* Live Earnings Summary Cards */}
      <div className="earnings-row">
        <div className="stat-card">
          <span className="stat-label">Hourly Rate</span>
          <div className="stat-value">₱{Number(currentUser.hourlyRate).toLocaleString()}</div>
          <span className="stat-sub">Base Contract Rate</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Hours Logged</span>
          <div className="stat-value">{currentUser.hoursWorked} hrs</div>
          <span className="stat-sub">Current Pay Period</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Gross Earnings</span>
          <div className="stat-value">₱{grossPay.toLocaleString()}</div>
          <span className="stat-sub">Before Deductions</span>
        </div>

        <div className="stat-card highlight-card">
          <span className="stat-label">Estimated Net Pay</span>
          <div className="stat-value text-green">₱{netPay.toLocaleString()}</div>
          <span className="stat-sub">After 10% Standard Tax</span>
        </div>
      </div>

      {/* Custom Profile Preview & Editor */}
      <div className="profile-layout">
        {/* Live Profile Preview Card */}
        <div className="card profile-preview-card">
          <div className="avatar-circle">
            <img
              src={profileForm.avatar || DEFAULT_AVATAR}
              alt="Avatar"
              className="avatar-img"
              onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
            />
          </div>
          <h3 className="profile-name">{profileForm.name}</h3>
          <span className="badge badge-active">{currentUser.status}</span>
          <p className="profile-dept">{profileForm.department}</p>
          <p className="profile-bio">{profileForm.bio || 'No bio set yet.'}</p>

          <div className="profile-meta">
            <div><strong>Email:</strong> {currentUser.email}</div>
            {profileForm.phone && <div><strong>Phone:</strong> {profileForm.phone}</div>}
          </div>

          {profileForm.skills && (
            <div className="skills-list">
              {profileForm.skills.split(',').map((skill, idx) => (
                <span key={idx} className="skill-tag">{skill.trim()}</span>
              ))}
            </div>
          )}
        </div>

        {/* Customize Profile Form */}
        <div className="card form-card">
          <h2>🎨 Customize Your Profile</h2>
          {savedMsg && <div className="success-banner">{savedMsg}</div>}

          <form onSubmit={handleProfileSave} className="form-grid">
            <div className="form-group">
              <label>Display Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                placeholder="e.g. +63 912 345 6789"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Profile Avatar Image URL</label>
              <input
                type="url"
                placeholder="https://example.com/my-photo.jpg"
                value={profileForm.avatar}
                onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Skills (comma-separated)</label>
              <input
                type="text"
                placeholder="e.g. React, Node.js, UI Design, Python"
                value={profileForm.skills}
                onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>About / Bio</label>
              <textarea
                rows="3"
                placeholder="Write a short bio about your role..."
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                className="custom-textarea"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Save Profile Changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}