import React, { useState } from 'react';
import logoImage from '../assets/logo.png';

export default function AuthPage({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    department: 'Software Engineering',
    role: 'employee'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';

    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Authentication failed');
        return;
      }

      localStorage.setItem('famspay_token', data.token);
      localStorage.setItem('famspay_user', JSON.stringify(data.user));
      onAuthSuccess(data.user);
    } catch (err) {
      setError('Cannot connect to server.');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <img src={logoImage} alt="FAMsPAY" className="auth-logo" />
          <div className="brand-title">
            <span className="brand-fam">FAM’s</span>
            <span className="brand-pay">Pay</span>
          </div>
          <p className="brand-subtitle">HR PAYROLL & EMPLOYEE PORTAL</p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            Create Account
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Francis Lasay"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
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
                <label>Account Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="employee">Employee (View Earnings & Profile)</option>
                  <option value="admin">HR Admin (Manage All Payroll)</option>
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
            {isLogin ? 'Login to Dashboard' : 'Register Account'}
          </button>
        </form>
      </div>
    </div>
  );
}