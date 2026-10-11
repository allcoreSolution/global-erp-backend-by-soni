const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
  eventName: { type: String, required: true, trim: true },
  startDate: { type: String, trim: true }, // e.g. YYYY-MM-DD
  endDate: { type: String, trim: true },   // e.g. YYYY-MM-DD
  durationDays: { type: Number, default: 1 },
  holidayDate: { type: String, trim: true }, // fallback/legacy single date support
  classificationType: { type: String, trim: true, default: 'National Holiday' },
  description: { type: String, trim: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

module.exports = mongoose.model('Holiday', holidaySchema);
