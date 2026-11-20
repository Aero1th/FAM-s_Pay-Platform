const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Employee = require('./models/Employee');

const app = express();
app.use(express.json());
app.use(cors());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/famspay';
const JWT_SECRET = process.env.JWT_SECRET || 'famspay_super_secret_key';

mongoose.connect(MONGO_URI)
  .then(() => console.log('🟢 MongoDB Connected Successfully'))
  .catch((err) => console.error('🔴 MongoDB Connection Error:', err));


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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));