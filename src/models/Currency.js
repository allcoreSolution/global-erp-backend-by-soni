const mongoose = require('mongoose');

const currencySchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true }, // e.g. USD, INR
  name: { type: String, required: true }, // e.g. US Dollar, Indian Rupee
  symbol: { type: String, default: '' }, // e.g. $, ₹
  exchangeRate: { type: Number, default: 1 },
  company: { type: String, default: '' } // Tenant association
}, { timestamps: true });

const Currency = mongoose.model('Currency', currencySchema);

module.exports = { Currency };
