const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  employeeId: { type: String, trim: true }, // e.g. EMP-001
  employeeName: { type: String, required: true, trim: true },
  leaveType: { type: String, required: true, trim: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  durationDays: { type: Number, default: 1 },
  reason: { type: String, trim: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approverName: { type: String, trim: true, default: '' },
  approvedAt: { type: Date },
  adminRemarks: { type: String, trim: true, default: '' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);

