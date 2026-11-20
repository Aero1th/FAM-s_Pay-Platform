const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'employee'], default: 'employee' },
  department: { type: String, default: 'Software Engineering' },
  hourlyRate: { type: Number, default: 250 },
  hoursWorked: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'On Leave', 'Inactive'], default: 'Active' },
  profile: {
    avatar: { type: String, default: '' },
    bio: { type: String, default: 'Passionate team member at FAMsPAY.' },
    phone: { type: String, default: '' },
    skills: { type: String, default: '' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Employee', EmployeeSchema);