const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  employeeName: { type: String, default: '' },
  employeeId: { type: String, default: '' },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  day: { type: String, default: '' }, // e.g., 'Monday'
  checkIn: { type: String, default: '-' },
  checkOut: { type: String, default: '-' },
  workingHours: { type: String, default: '-' },
  status: { type: String, enum: ['Present', 'Absent', 'Late', 'Half Day', 'On Leave'], default: 'Present' },
  shift: { type: String, default: '' },
  markedBy: { type: String, enum: ['Self', 'Admin'], default: 'Self' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

// Prevent duplicate attendance for same employee on same date
attendanceSchema.index({ employee: 1, date: 1, company: 1 });
attendanceSchema.index({ user: 1, date: 1, company: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
