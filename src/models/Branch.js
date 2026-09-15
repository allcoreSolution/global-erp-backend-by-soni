const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, trim: true },
  code: { type: String, default: '' },
  name: { type: String, required: true, trim: true },
  type: { type: String, default: 'Regional Office' },
  manager: { type: String, default: '' },
  status: { type: String, default: 'Active' },
  contactPerson: { type: String, default: '' },
  mobile: { type: String, default: '' },
  email: { type: String, default: '', lowercase: true, trim: true },
  phone: { type: String, default: '' },
  address1: { type: String, default: '' },
  address2: { type: String, default: '' },
  country: { type: String, default: 'India' },
  state: { type: String, default: 'Uttar Pradesh' },
  city: { type: String, default: 'Lucknow' },
  district: { type: String, default: '' },
  pincode: { type: String, default: '' },
  gstStatus: { type: String, default: 'Registered' },
  gstin: { type: String, default: '' },
  pan: { type: String, default: '' },
  tan: { type: String, default: '' },
  warehouse: { type: String, default: '' },
  priceList: { type: String, default: '' },
  currency: { type: String, default: 'INR' },
  timezone: { type: String, default: 'Asia/Kolkata' },
  costCenter: { type: String, default: '' },
  profitCenter: { type: String, default: '' },
  ledger: { type: String, default: '' },
  company: { type: String, default: '' }
}, { timestamps: true });

const Branch = mongoose.model('Branch', branchSchema);

module.exports = { Branch };
