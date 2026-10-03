const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  company: { type: String, default: '' },
  value: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('PaymentTerm', schema);
