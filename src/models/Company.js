const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  website: { type: String, trim: true },
  address: { type: String, trim: true },
  gstNumber: { type: String, trim: true },
  pan: { type: String, trim: true },
  cin: { type: String, trim: true },
  tan: { type: String, trim: true },
  financialYear: { type: String, trim: true, default: '2024-2025' },
  currency: { type: String, trim: true, default: 'INR (₹)' },
  dateFormat: { type: String, trim: true, default: 'YYYY-MM-DD' },
  invoicePrefix: { type: String, trim: true, default: 'INV/' },
  terms: { type: String, trim: true, default: 'Payment is due within 30 days of receiving invoice.' },
  signature: { type: String, trim: true, default: 'Authorized Signatory - CEO' },
  isActive: { type: Boolean, default: true },
  subscriptionPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  subscriptionStatus: { type: String, enum: ['Active', 'Expired', 'Suspended'], default: 'Active' },
  subscriptionExpiry: { type: Date },
  logoUrl: { type: String, default: '' },
  themeColor: { type: String, default: '#1e293b' }
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
