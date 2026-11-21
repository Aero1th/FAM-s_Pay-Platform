const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    enum: ['Working Conditions', 'Management', 'Payroll / Benefits', 'Workplace Safety', 'Other'],
    default: 'Working Conditions'
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Submitted', 'Under Review', 'Resolved'],
    default: 'Submitted'
  },
  adminResponse: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', ComplaintSchema);