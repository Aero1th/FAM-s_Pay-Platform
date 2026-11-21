const mongoose = require('mongoose');

const DEFAULT_AVATAR = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXI5UEbkacjL3jxlp8sYB3Bd6qlfR7vSGAWGBMsOicuR3vz5WfaiUYxQBs&s=10';

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
    avatar: { type: String, default: DEFAULT_AVATAR },
    bio: { type: String, default: 'Passionate team member at FAMsPAY.' },
    phone: { type: String, default: '' },
    skills: { type: String, default: '' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Employee', EmployeeSchema);