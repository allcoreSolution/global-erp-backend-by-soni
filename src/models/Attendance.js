const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  checkIn: { type: String, default: '-' },
  checkOut: { type: String, default: '-' },
  status: { type: String, enum: ['Present', 'Absent', 'Late', 'On Leave'], default: 'Present' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

// Prevent duplicate attendance for same employee on same date
attendanceSchema.index({ employee: 1, date: 1, company: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
