const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
  eventName: { type: String, required: true, trim: true },
  holidayDate: { type: String, required: true, trim: true }, // or Date, but using String based on user's dd-mm-yyyy example
  classificationType: { type: String, trim: true, default: 'National Holiday' },
  description: { type: String, trim: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

module.exports = mongoose.model('Holiday', holidaySchema);
