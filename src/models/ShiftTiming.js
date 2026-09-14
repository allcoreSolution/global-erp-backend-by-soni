const mongoose = require('mongoose');

const shiftTimingSchema = new mongoose.Schema({
  shiftName: { type: String, required: true, trim: true },
  clockInTime: { type: String, required: true, trim: true },
  clockOutTime: { type: String, required: true, trim: true },
  gracePeriodMins: { type: Number, default: 15 },
  weeklyOffDay: { type: String, default: 'Sunday', trim: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

module.exports = mongoose.model('ShiftTiming', shiftTimingSchema);
