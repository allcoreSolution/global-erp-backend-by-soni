const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  // भाग A: कानूनी और बेसिक जानकारी (Legal & Basic Details)
  name: { type: String, required: true, trim: true },
  code: { type: String, trim: true }, // e.g. APD, SH
  businessType: { type: String, trim: true, default: 'Pharmaceutical wholesale and distribution' },
  constitution: { type: String, trim: true, default: 'Proprietorship' }, // Proprietorship, Partnership, Pvt Ltd, LLP, Public Ltd
  ownerName: { type: String, trim: true, default: '' },

  // भाग B: टैक्स और फार्मा ड्रग लाइसेंस (Tax & Pharma Licence)
  gstin: { type: String, trim: true },
  panNumber: { type: String, trim: true, default: '' },
  drugLicenceNo: { type: String, trim: true, default: '' },
  dl20b: { type: String, trim: true, default: '' }, // Wholesale DL 20B
  dl21b: { type: String, trim: true, default: '' }, // Wholesale DL 21B
  fssaiNo: { type: String, trim: true, default: '' }, // Food & Nutrition supplement license
  drugLicenceValidity: { type: String, trim: true, default: '' }, // Expiry date for alerts

  // भाग C: पता और संपर्क (Address & Contact)
  address: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  pincode: { type: String, trim: true, default: '' },
  phone: { type: String, trim: true },
  whatsapp: { type: String, trim: true, default: '' },
  email: { type: String, trim: true, lowercase: true },
  website: { type: String, trim: true },

  // भाग D: बिल प्रिंटिंग और बैंक डिटेल्स (Invoice & Banking)
  logoUrl: { type: String, default: '' },
  bankName: { type: String, trim: true, default: '' },
  accountNumber: { type: String, trim: true, default: '' },
  ifscCode: { type: String, trim: true, default: '' },
  branchName: { type: String, trim: true, default: '' },
  upiId: { type: String, trim: true, default: '' }, // UPI ID for Dynamic QR code generation
  invoicePrefix: { type: String, trim: true, default: 'INV/' }, // e.g. APD/, SH-
  terms: { type: String, trim: true, default: 'Payment is due within 30 days of receiving invoice.' },
  signature: { type: String, trim: true, default: 'Authorized Signatory - CEO' },
  themeColor: { type: String, default: '#1e293b' },

  // Operational Settings
  billingCycle: { type: String, enum: ['monthly', 'yearly', 'lifetime', 'trial'], default: 'monthly' },
  maxUsers: { type: Number, default: 10 },
  maxBranches: { type: Number, default: 2 },
  financialYear: { type: String, trim: true, default: '2024-2025' },
  currency: { type: String, trim: true, default: 'INR (₹)' },
  dateFormat: { type: String, trim: true, default: 'YYYY-MM-DD' },
  valuationMethod: { type: String, enum: ['FIFO', 'Average', 'LIFO'], default: 'FIFO' },
  dispatchMethod: { type: String, enum: ['FEFO', 'FIFO', 'LIFO'], default: 'FEFO' },
  negativeStockAllowed: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },

  // Subscription Details
  subscriptionPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  subscriptionStatus: { type: String, enum: ['Active', 'Expired', 'Suspended'], default: 'Active' },
  subscriptionExpiry: { type: Date },

  // Multi-Tenant Isolation & Creator Ownership
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  creatorRole: { type: String, enum: ['SuperAdmin', 'Admin'], default: 'SuperAdmin' }
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
