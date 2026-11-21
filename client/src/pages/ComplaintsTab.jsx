import React, { useState, useEffect } from 'react';

export default function ComplaintsTab({ currentUser }) {
  const [complaints, setComplaints] = useState([]);
  const [form, setForm] = useState({
    category: 'Working Conditions',
    subject: '',
    message: '',
    isAnonymous: false
  });
  const [statusMsg, setStatusMsg] = useState('');
  const [responses, setResponses] = useState({});

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchComplaints();
    }
  }, [currentUser?.role]);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('famspay_token');
      const res = await fetch('http://localhost:5000/api/complaints', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setComplaints(data);
      }
    } catch (err) {
      console.error('Error loading complaints:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('famspay_token');
      const res = await fetch('http://localhost:5000/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          employeeId: currentUser._id,
          authorName: currentUser.name,
          category: form.category,
          subject: form.subject,
          message: form.message,
          isAnonymous: form.isAnonymous
        })
      });
      const saved = await res.json();
      if (res.ok && currentUser.role === 'admin') {
        setComplaints([saved, ...complaints]);
      }
      setForm({
        category: 'Working Conditions',
        subject: '',
        message: '',
        isAnonymous: false
      });
      setStatusMsg('Submission sent to HR/Management.');
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      console.error('Error submitting complaint:', err);
    }
  };

  const handleReviewUpdate = async (id, nextStatus) => {
    const adminResponse = responses[id];
    try {
      const token = localStorage.getItem('famspay_token');
      const res = await fetch(`http://localhost:5000/api/complaints/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: nextStatus,
          ...(adminResponse !== undefined ? { adminResponse } : {})
        })
      });
      const updated = await res.json();
      if (res.ok) {
        setComplaints(complaints.map((c) => (c._id === id ? updated : c)));
      }
    } catch (err) {
      console.error('Error updating complaint:', err);
    }
  };

  return (
    <div className="complaints-layout">
      {/* Submit Complaint / Review Form (Visible to all logged-in users) */}
      <div className="card form-card">
        <h2>📢 Submit Review or Complaint</h2>
        {statusMsg && <div className="success-banner">{statusMsg}</div>}

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label>Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="Working Conditions">Working Conditions</option>
              <option value="Management">Management</option>
              <option value="Payroll / Benefits">Payroll / Benefits</option>
              <option value="Workplace Safety">Workplace Safety</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Subject</label>
            <input
              type="text"
              placeholder="Brief summary of your review or concern"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              required
            />
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Details</label>
            <textarea
              rows="4"
              placeholder="Share feedback on working conditions, management, or team environment..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="custom-textarea"
              required
            />
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={form.isAnonymous}
                onChange={(e) => setForm({ ...form, isAnonymous: e.target.checked })}
              />
              <span>Submit anonymously (hides your name from the board)</span>
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Submit Entry</button>
          </div>
        </form>
      </div>

      {/* Submissions Inbox / Feed — HR Admin Only */}
      {currentUser.role === 'admin' && (
        <div className="card table-card">
          <h2>🗂️ Employee Feedback & Complaints Inbox (HR Admin Only)</h2>

          {complaints.length === 0 ? (
            <p className="empty-row">No reviews or complaints submitted yet.</p>
          ) : (
            <div className="complaint-list">
              {complaints.map((item) => (
                <div key={item._id} className="complaint-item">
                  <div className="complaint-top">
                    <div>
                      <strong className="complaint-subject">{item.subject}</strong>
                      <div className="complaint-meta">
                        <span>By: {item.authorName}</span> • <span>{item.category}</span>
                      </div>
                    </div>
                    <span
                      className={`badge ${
                        item.status === 'Resolved'
                          ? 'badge-active'
                          : item.status === 'Under Review'
                          ? 'badge-leave'
                          : 'badge-inactive'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="complaint-message">{item.message}</p>

                  {item.adminResponse && (
                    <div className="admin-reply-box">
                      <strong>HR / Management Response:</strong> {item.adminResponse}
                    </div>
                  )}

                  <div className="admin-review-controls">
                    <input
                      type="text"
                      placeholder="Write a response..."
                      value={responses[item._id] ?? item.adminResponse ?? ''}
                      onChange={(e) =>
                        setResponses({ ...responses, [item._id]: e.target.value })
                      }
                    />
                    <button
                      type="button"
                      className="btn-sm btn-edit"
                      onClick={() => handleReviewUpdate(item._id, 'Under Review')}
                    >
                      Under Review
                    </button>
                    <button
                      type="button"
                      className="btn-sm btn-primary"
                      onClick={() => handleReviewUpdate(item._id, 'Resolved')}
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}