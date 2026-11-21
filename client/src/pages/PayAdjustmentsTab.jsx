import React, { useState, useEffect } from 'react';

export default function PayAdjustmentsTab({ currentUser, employees, onRefreshEmployees }) {
  const [logs, setLogs] = useState([]);
  const [selectedId, setSelectedId] = useState(employees[0]?._id || '');
  const [adjustmentType, setAdjustmentType] = useState('Payraise');
  const [amountChange, setAmountChange] = useState('25');
  const [performanceRating, setPerformanceRating] = useState('Meets / Exceeds Requirements');
  const [requirementNotes, setRequirementNotes] = useState('');
  const [forceOverride, setForceOverride] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  useEffect(() => {
    if (employees.length > 0 && !selectedId) {
      setSelectedId(employees[0]._id);
    }
  }, [employees, selectedId]);

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchLogs();
    }
  }, [currentUser?.role]);

  const selectedEmployee = employees.find((emp) => emp._id === selectedId);
  const meetsPayraiseReq =
    selectedEmployee &&
    Number(selectedEmployee.hoursWorked || 0) >= 160 &&
    selectedEmployee.status === 'Active';

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('famspay_token');
      const res = await fetch('http://localhost:5000/api/pay-adjustments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setLogs(data);
      }
    } catch (err) {
      console.error('Error loading pay adjustment logs:', err);
    }
  };

  const handleTypeChange = (nextType) => {
    setAdjustmentType(nextType);
    setPerformanceRating(
      nextType === 'Payraise' ? 'Meets / Exceeds Requirements' : 'Below Standard'
    );
    setFeedback({ type: '', text: '' });
  };

  const handleApplyAdjustment = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', text: '' });

    try {
      const token = localStorage.getItem('famspay_token');
      const res = await fetch('http://localhost:5000/api/pay-adjustments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          employeeId: selectedId,
          adjustmentType,
          amountChange: Number(amountChange),
          performanceRating,
          requirementNotes,
          adjustedBy: currentUser?.name || 'HR Admin',
          forceOverride
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: 'error', text: data.error || 'Failed to apply adjustment.' });
        return;
      }

      setLogs([data.adjustment, ...logs]);
      setRequirementNotes('');
      setForceOverride(false);
      setFeedback({
        type: 'success',
        text: `${adjustmentType} applied to ${data.adjustment.employeeName}: ₱${data.adjustment.previousRate}/hr → ₱${data.adjustment.newRate}/hr.`
      });

      if (onRefreshEmployees) {
        onRefreshEmployees();
      }
    } catch (err) {
      console.error('Error applying pay adjustment:', err);
      setFeedback({ type: 'error', text: 'Network error while saving adjustment.' });
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="card table-card">
        <h2>🔒 Restricted Access</h2>
        <p className="empty-row">
          Payraise and Paycut evaluations are restricted to HR Admin accounts.
        </p>
      </div>
    );
  }

  return (
    <div className="complaints-layout">
      <div className="card form-card">
        <h2>💹 Payraise & Paycut Evaluation (HR Admin)</h2>

        {feedback.text && (
          <div className={feedback.type === 'success' ? 'success-banner' : 'error-banner'}>
            {feedback.text}
          </div>
        )}

        <form onSubmit={handleApplyAdjustment} className="form-grid">
          <div className="form-group">
            <label>Target Employee</label>
            <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} ({emp.department}) — ₱{emp.hourlyRate}/hr | {emp.hoursWorked} hrs
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Adjustment Type</label>
            <select value={adjustmentType} onChange={(e) => handleTypeChange(e.target.value)}>
              <option value="Payraise">Payraise (Meets Requirement)</option>
              <option value="Paycut">Paycut (Below Standard / Issue)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Rate Adjustment Amount (₱ / hr)</label>
            <input
              type="number"
              min="1"
              step="1"
              value={amountChange}
              onChange={(e) => setAmountChange(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Performance Evaluation</label>
            <select
              value={performanceRating}
              onChange={(e) => setPerformanceRating(e.target.value)}
            >
              <option value="Meets / Exceeds Requirements">Meets / Exceeds Requirements</option>
              <option value="Below Standard">Below Standard</option>
              <option value="Attendance / Policy Issue">Attendance / Policy Issue</option>
            </select>
          </div>

          {selectedEmployee && (
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <div className="requirement-box">
                <div>
                  <strong>Requirement Check:</strong>{' '}
                  {selectedEmployee.hoursWorked} hrs logged (Target: ≥ 160 hrs) • Status:{' '}
                  <strong>{selectedEmployee.status}</strong> • Current Rate:{' '}
                  <strong>₱{selectedEmployee.hourlyRate}/hr</strong>
                </div>
                <span className={`badge ${meetsPayraiseReq ? 'badge-active' : 'badge-leave'}`}>
                  {meetsPayraiseReq ? 'Eligible for Standard Raise' : 'Below Raise Threshold'}
                </span>
              </div>
            </div>
          )}

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Evaluation Notes / Justification (Required for Audit Log)</label>
            <textarea
              rows="3"
              placeholder="Document KPI performance, attendance hours, or reason for paycut/payraise..."
              value={requirementNotes}
              onChange={(e) => setRequirementNotes(e.target.value)}
              className="custom-textarea"
              required
            />
          </div>

          {adjustmentType === 'Payraise' && !meetsPayraiseReq && (
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={forceOverride}
                  onChange={(e) => setForceOverride(e.target.checked)}
                />
                <span>HR Override: Approve payraise even though hours/status are below standard</span>
              </label>
            </div>
          )}

          <div className="form-actions">
            <button
              type="submit"
              className={`btn ${adjustmentType === 'Payraise' ? 'btn-primary' : 'btn-danger'}`}
            >
              Apply {adjustmentType}
            </button>
          </div>
        </form>
      </div>

      {/* Audit Log Table */}
      <div className="card table-card">
        <h2>📜 Pay Adjustment Audit Log</h2>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>Rate Change</th>
                <th>Evaluation</th>
                <th>Notes</th>
                <th>Approved By</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-row">No pay adjustments recorded yet.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id}>
                    <td><strong>{log.employeeName}</strong></td>
                    <td>
                      <span
                        className={`badge ${
                          log.adjustmentType === 'Payraise' ? 'badge-active' : 'badge-inactive'
                        }`}
                      >
                        {log.adjustmentType}
                      </span>
                    </td>
                    <td>
                      ₱{log.previousRate}/hr → <strong>₱{log.newRate}/hr</strong>{' '}
                      <span className="muted-delta">
                        ({log.adjustmentType === 'Payraise' ? '+' : '-'}₱{log.amountChange})
                      </span>
                    </td>
                    <td>{log.performanceRating}</td>
                    <td>{log.requirementNotes}</td>
                    <td>{log.adjustedBy}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}