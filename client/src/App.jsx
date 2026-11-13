import React, { useState } from 'react';
import './App.css';
import logoImage from './assets/logo.png';

export default function App() {
  // Initial Mock State (READ)
  const [employees, setEmployees] = useState([
    { id: 1, name: 'Francis Lasay', email: 'francis@company.com', department: 'Software Engineering', hourlyRate: 350, hoursWorked: 160, status: 'Active' },
    { id: 2, name: 'Clifford Galvez', email: 'clifford@company.com', department: 'IT Support', hourlyRate: 280, hoursWorked: 150, status: 'Active' },
    { id: 3, name: 'Robi Luna', email: 'robi@company.com', department: 'UI/UX Design', hourlyRate: 300, hoursWorked: 140, status: 'On Leave' },
  ]);

  // Form State
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

  // CREATE & UPDATE Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      setEmployees(employees.map(emp => emp.id === currentId ? { ...emp, ...form, hourlyRate: Number(form.hourlyRate), hoursWorked: Number(form.hoursWorked) } : emp));
      setIsEditing(false);
      setCurrentId(null);
    } else {
      const newEmployee = {
        id: Date.now(),
        ...form,
        hourlyRate: Number(form.hourlyRate),
        hoursWorked: Number(form.hoursWorked)
      };
      setEmployees([...employees, newEmployee]);
    }
    setForm({ name: '', email: '', department: 'Software Engineering', hourlyRate: '', hoursWorked: '', status: 'Active' });
  };

  // EDIT Handler (Pre-fill Form)
  const handleEdit = (emp) => {
    setIsEditing(true);
    setCurrentId(emp.id);
    setForm({
      name: emp.name,
      email: emp.email,
      department: emp.department,
      hourlyRate: emp.hourlyRate,
      hoursWorked: emp.hoursWorked,
      status: emp.status
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to remove this employee record?')) {
      setEmployees(employees.filter(emp => emp.id !== id));
    }
  };

  return (
    <div className="app-container">
      
      {/* Header with Custom Logo and Branding */}
      <header className="app-header">
        <div className="logo-brand-container">
          
          {/* Logo Graphic Container */}
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
        
        <div className="system-badge">Web Application Development</div>
      </header>

      {/* CREATE / UPDATE Form */}
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
            <select 
              value={form.department} 
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            >
              <option value="Software Engineering">Software Engineering</option>
              <option value="IT Support">IT Support</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Finance">Finance</option>
            </select>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select 
              value={form.status} 
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
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

      {/* READ Table */}
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
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center empty-row">No employee records found.</td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id}>
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
                    <td>₱{emp.hourlyRate.toLocaleString()}</td>
                    <td>{emp.hoursWorked} hrs</td>
                    <td className="gross-pay">
                      ₱{(emp.hourlyRate * emp.hoursWorked).toLocaleString()}
                    </td>
                    <td className="text-center">
                      <button onClick={() => handleEdit(emp)} className="btn-sm btn-edit">Edit</button>
                      <button onClick={() => handleDelete(emp.id)} className="btn-sm btn-delete">Delete</button>
                    </td>
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