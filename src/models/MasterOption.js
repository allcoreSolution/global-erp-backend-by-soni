const mongoose = require('mongoose');

const masterOptionSchema = new mongoose.Schema({
  company: { type: String, default: '' },
  category: { type: String, required: true },
  label: { type: String, required: true },
  value: { type: String, required: true }
}, { timestamps: true });

const MasterOption = mongoose.model('MasterOption', masterOptionSchema);

module.exports = { MasterOption };
