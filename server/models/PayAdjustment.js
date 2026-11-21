const mongoose = require('mongoose');

const PayAdjustmentSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  employeeName: {
    type: String,
    required: true
  },
  adjustmentType: {
    type: String,
    enum: ['Payraise', 'Paycut'],
    required: true
  },
  previousRate: {
    type: Number,
    required: true
  },
  newRate: {
    type: Number,
    required: true
  },
  amountChange: {
    type: Number,
    required: true
  },
  performanceRating: {
    type: String,
    enum: ['Meets / Exceeds Requirements', 'Below Standard', 'Attendance / Policy Issue'],
    required: true
  },
  requirementNotes: {
    type: String,
    required: true
  },
  adjustedBy: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('PayAdjustment', PayAdjustmentSchema);