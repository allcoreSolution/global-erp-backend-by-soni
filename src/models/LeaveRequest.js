const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  employeeName: { type: String, required: true, trim: true },
  leaveType: { type: String, required: true, trim: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  reason: { type: String, trim: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
