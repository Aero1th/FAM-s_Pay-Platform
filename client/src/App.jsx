import React, { useState, useEffect } from 'react';
import './App.css';
import logoImage from './assets/logo.png';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ComplaintsTab from './pages/ComplaintsTab';
import PayAdjustmentsTab from './pages/PayAdjustmentsTab';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('portal'); // 'portal' or 'admin'
  const [employees, setEmployees] = useState([]);

  const [form, setForm] = useState({
    name: '',
    email: '',
    department: 'Software Engineering',
    hourlyRate: '',
    hoursWorked: '',
    status: 'Active'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('famspay_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/employees');
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('famspay_token');
    localStorage.removeItem('famspay_user');
    setCurrentUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const res = await fetch(`http://localhost:5000/api/employees/${currentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
        const updated = await res.json();
        setEmployees(employees.map(emp => emp._id === currentId ? updated : emp));
        if (currentUser && currentUser._id === currentId) {
          setCurrentUser(updated);
          localStorage.setItem('famspay_user', JSON.stringify(updated));
        }
        setIsEditing(false);
        setCurrentId(null);
      } else {
        const res = await fetch('http://localhost:5000/api/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
        const saved = await res.json();
        setEmployees([saved, ...employees]);
      }
      setForm({ name: '', email: '', department: 'Software Engineering', hourlyRate: '', hoursWorked: '', status: 'Active' });
    } catch (err) {
      console.error('Error saving employee:', err);
    }
  };

  const handleEdit = (emp) => {
    setIsEditing(true);
    setCurrentId(emp._id);
    setForm({
      name: emp.name,
      email: emp.email,
      department: emp.department,
      hourlyRate: emp.hourlyRate,
      hoursWorked: emp.hoursWorked,
      status: emp.status
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this employee record?')) {
      try {
        await fetch(`http://localhost:5000/api/employees/${id}`, { method: 'DELETE' });
        setEmployees(employees.filter(emp => emp._id !== id));
      } catch (err) {
        console.error('Error deleting employee:', err);
      }
    }
  };

  // Show Login/Signup screen if not logged in
  if (!currentUser) {
    return <AuthPage onAuthSuccess={(user) => { setCurrentUser(user); fetchEmployees(); }} />;
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="logo-brand-container">
          <div className="custom-logo">
            <img src={logoImage} alt="FAM'sPay Logo" className="logo-img" />
            <div className="logo-divider"></div>
          </div>
          <div className="brand-text-group">
            <div className="brand-title">
              <span className="brand-fam">FAM’s</span>
              <span className="brand-pay">Pay</span>
            </div>
            <div className="brand-subtitle">HR PAYROLL MANAGER</div>
          </div>
        </div>

        <div className="nav-controls">
          <button
            className={`nav-btn ${activeTab === 'complaints' ? 'active' : ''}`}
            onClick={() => setActiveTab('complaints')}
          >
            Complaints & Reviews
          </button>

          <button
            className={`nav-btn ${activeTab === 'portal' ? 'active' : ''}`}
            onClick={() => setActiveTab('portal')}
          >
            My Earnings & Profile
          </button>
          {currentUser.role === 'admin' && (
            <>
              <button
                className={`nav-btn ${activeTab === 'pay-adjustments' ? 'active' : ''}`}
                onClick={() => setActiveTab('pay-adjustments')}
              >
                Payraise & Paycut
              </button>
              <button
                className={`nav-btn ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => setActiveTab('admin')}
              >
                HR Payroll Manager
              </button>
            </>
          )}
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* View Switcher */}

      
      {activeTab === 'portal' ? (
        <Dashboard
          currentUser={currentUser}
          onUserUpdate={(updated) => {
          setCurrentUser(updated);
          fetchEmployees();
        }}
        />
      ) : activeTab === 'complaints' ? (
        <ComplaintsTab currentUser={currentUser} />
      ) : activeTab === 'pay-adjustments' ? (
        <PayAdjustmentsTab
          currentUser={currentUser}
          employees={employees}
          onRefreshEmployees={fetchEmployees}
        />
      ) : (
        <>
          {/* Admin Form */}
          <div className="card form-card">
            <h2>{isEditing ? '✏️ Edit Employee Record' : '➕ Add New Employee'}</h2>
            <form onSubmit={handleSubmit} className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text" placeholder="e.g. John Doe" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} required
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email" placeholder="e.g. john@company.com" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} required
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="IT Support">IT Support</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="form-group">
                <label>Hourly Rate (₱)</label>
                <input
                  type="number" placeholder="e.g. 350" value={form.hourlyRate}
                  onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })} required
                />
              </div>
              <div className="form-group">
                <label>Hours Worked</label>
                <input
                  type="number" placeholder="e.g. 160" value={form.hoursWorked}
                  onChange={(e) => setForm({ ...form, hoursWorked: e.target.value })} required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className={`btn ${isEditing ? 'btn-warning' : 'btn-primary'}`}>
                  {isEditing ? 'Update Employee Record' : 'Save Employee Record'}
                </button>
              </div>
            </form>
          </div>

          {/* Admin Directory Table */}
          <div className="card table-card">
            <h2>📋 Employee Directory & Payroll Records</h2>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Hourly Rate</th>
                    <th>Hours</th>
                    <th>Gross Pay</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp._id}>
                      <td>
                        <strong className="emp-name">{emp.name}</strong>
                        <span className="emp-email">{emp.email}</span>
                      </td>
                      <td>{emp.department}</td>
                      <td>
                        <span className={`badge ${emp.status === 'Active' ? 'badge-active' : emp.status === 'On Leave' ? 'badge-leave' : 'badge-inactive'}`}>
                          {emp.status}
                        </span>
                      </td>
                      <td>₱{Number(emp.hourlyRate).toLocaleString()}</td>
                      <td>{emp.hoursWorked} hrs</td>
                      <td className="gross-pay">
                        ₱{(Number(emp.hourlyRate) * Number(emp.hoursWorked)).toLocaleString()}
                      </td>
                      <td className="text-center">
                        <button onClick={() => handleEdit(emp)} className="btn-sm btn-edit">Edit</button>
                        <button onClick={() => handleDelete(emp._id)} className="btn-sm btn-delete">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}