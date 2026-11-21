const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Employee = require('./models/Employee');
const Complaint = require('./models/Complaint');
const PayAdjustment = require('./models/PayAdjustment');

const app = express();
app.use(express.json());
app.use(cors());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/famspay';
const JWT_SECRET = process.env.JWT_SECRET || 'famspay_super_secret_key';

mongoose.connect(MONGO_URI)
  .then(() => console.log('🟢 MongoDB Connected Successfully'))
  .catch((err) => console.error('🔴 MongoDB Connection Error:', err));

// --- AUTH ROUTES ---

// 1. SIGNUP
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, department, role } = req.body;
    const existing = await Employee.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email is already registered.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Employee({
      name,
      email,
      password: hashedPassword,
      department: department || 'Software Engineering',
      role: role || 'employee',
      hourlyRate: 300,
      hoursWorked: 160
    });

    const savedUser = await newUser.save();
    const token = jwt.sign({ id: savedUser._id, role: savedUser.role }, JWT_SECRET, { expiresIn: '1d' });

    const userObj = savedUser.toObject();
    delete userObj.password;
    res.status(201).json({ token, user: userObj });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Employee.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password.' });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    const userObj = user.toObject();
    delete userObj.password;
    res.json({ token, user: userObj });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- EMPLOYEE & PROFILE ROUTES ---

// 3. GET all employees
app.get('/api/employees', async (req, res) => {
  try {
    const employees = await Employee.find().select('-password').sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. POST a new employee (Admin)
app.post('/api/employees', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password || 'default123', 10);
    const newEmployee = new Employee({ ...req.body, password: hashedPassword });
    const saved = await newEmployee.save();
    const obj = saved.toObject();
    delete obj.password;
    res.status(201).json(obj);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 5. PUT (Update) employee or customize profile
app.put('/api/employees/:id', async (req, res) => {
  try {
    const updated = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select('-password');
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 6. DELETE an employee
app.delete('/api/employees/:id', async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- COMPLAINTS & REVIEWS ROUTES ---

// 7. GET all complaints/reviews (masks author if anonymous)
app.get('/api/complaints', async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    const sanitized = complaints.map((item) => {
      const obj = item.toObject();
      if (obj.isAnonymous) {
        obj.authorName = 'Anonymous Employee';
      }
      return obj;
    });
    res.json(sanitized);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. POST a new complaint or review
app.post('/api/complaints', async (req, res) => {
  try {
    const { employeeId, authorName, isAnonymous, category, subject, message } = req.body;
    const newComplaint = new Complaint({
      employeeId,
      authorName,
      isAnonymous: Boolean(isAnonymous),
      category,
      subject,
      message
    });
    const saved = await newComplaint.save();
    const obj = saved.toObject();
    if (obj.isAnonymous) {
      obj.authorName = 'Anonymous Employee';
    }
    res.status(201).json(obj);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 9. PUT update complaint status or admin response
app.put('/api/complaints/:id', async (req, res) => {
  try {
    const { status, adminResponse } = req.body;
    const updated = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status, adminResponse },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Complaint not found' });
    const obj = updated.toObject();
    if (obj.isAnonymous) {
      obj.authorName = 'Anonymous Employee';
    }
    res.json(obj);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Helper middleware to verify JWT and extract user info
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

// 1. GET all complaints/reviews (Admin only)
app.get('/api/complaints', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: HR Admin access required.' });
    }

    const complaints = await Complaint.find().sort({ createdAt: -1 });
    const sanitized = complaints.map((item) => {
      const obj = item.toObject();
      if (obj.isAnonymous) {
        obj.authorName = 'Anonymous Employee';
      }
      return obj;
    });
    res.json(sanitized);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PAYRAISE & PAYCUT ROUTES (HR ADMIN) ---

// 1. GET pay adjustment audit log (Admin only)
app.get('/api/pay-adjustments', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: HR Admin access required.' });
    }

    const logs = await PayAdjustment.find().sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. POST apply a Payraise or Paycut with requirement check & audit log (Admin only)
app.post('/api/pay-adjustments', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: HR Admin access required.' });
    }

    const {
      employeeId,
      adjustmentType,
      amountChange,
      performanceRating,
      requirementNotes,
      adjustedBy,
      forceOverride
    } = req.body;

    const numericChange = Number(amountChange);
    if (!employeeId || !['Payraise', 'Paycut'].includes(adjustmentType)) {
      return res.status(400).json({ error: 'Invalid employee or adjustment type.' });
    }
    if (!numericChange || numericChange <= 0) {
      return res.status(400).json({ error: 'Adjustment amount must be greater than 0.' });
    }
    if (!requirementNotes || !requirementNotes.trim()) {
      return res.status(400).json({ error: 'Requirement evaluation notes are required for audit logging.' });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    // Requirement check: Payraise requires >= 160 hours and Active status unless overridden by HR
    const meetsPayraiseRequirement = employee.hoursWorked >= 160 && employee.status === 'Active';
    if (adjustmentType === 'Payraise' && !meetsPayraiseRequirement && !forceOverride) {
      return res.status(400).json({
        error: `Employee does not meet standard payraise requirements (${employee.hoursWorked} hrs worked, status: ${employee.status}). Enable HR Override to apply anyway.`
      });
    }

    const previousRate = Number(employee.hourlyRate || 0);
    const computedNewRate =
      adjustmentType === 'Payraise'
        ? previousRate + numericChange
        : Math.max(0, previousRate - numericChange);

    const actualDelta = computedNewRate - previousRate;

    employee.hourlyRate = computedNewRate;
    await employee.save();

    const auditRecord = new PayAdjustment({
      employeeId: employee._id,
      employeeName: employee.name,
      adjustmentType,
      previousRate,
      newRate: computedNewRate,
      amountChange: Math.abs(actualDelta),
      performanceRating:
        performanceRating ||
        (adjustmentType === 'Payraise' ? 'Meets / Exceeds Requirements' : 'Below Standard'),
      requirementNotes: requirementNotes.trim(),
      adjustedBy: adjustedBy || 'HR Admin'
    });

    const savedLog = await auditRecord.save();
    const updatedEmployee = employee.toObject();
    delete updatedEmployee.password;

    res.status(201).json({
      adjustment: savedLog,
      employee: updatedEmployee
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));