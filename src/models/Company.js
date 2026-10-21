const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  website: { type: String, trim: true },
  address: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  gstin: { type: String, trim: true },
  billingCycle: { type: String, enum: ['monthly', 'yearly', 'lifetime', 'trial'], default: 'monthly' },
  maxUsers: { type: Number, default: 10 },
  maxBranches: { type: Number, default: 2 },
  financialYear: { type: String, trim: true, default: '2024-2025' },
  currency: { type: String, trim: true, default: 'INR (₹)' },
  dateFormat: { type: String, trim: true, default: 'YYYY-MM-DD' },
  invoicePrefix: { type: String, trim: true, default: 'INV/' },
  terms: { type: String, trim: true, default: 'Payment is due within 30 days of receiving invoice.' },
  signature: { type: String, trim: true, default: 'Authorized Signatory - CEO' },
  ownerName: { type: String, trim: true, default: '' },
  constitution: { type: String, trim: true, default: 'Proprietorship' },
  drugLicenceNo: { type: String, trim: true, default: '' },
  drugLicenceValidity: { type: String, trim: true, default: '' },
  valuationMethod: { type: String, enum: ['FIFO', 'Average', 'LIFO'], default: 'FIFO' },
  dispatchMethod: { type: String, enum: ['FEFO', 'FIFO', 'LIFO'], default: 'FEFO' },
  isActive: { type: Boolean, default: true },
  subscriptionPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  subscriptionStatus: { type: String, enum: ['Active', 'Expired', 'Suspended'], default: 'Active' },
  subscriptionExpiry: { type: Date },
  logoUrl: { type: String, default: '' },
  themeColor: { type: String, default: '#1e293b' }
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
