const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerCode: { type: String, required: true, unique: true, trim: true },
  customerName: { type: String, required: true, trim: true },
  customerType: { type: String, default: 'Retailer' },
  customerCategory: { type: String, default: 'Regular' },
  isActive: { type: Boolean, default: true },
  gstin: { type: String, default: '' },
  pan: { type: String, default: '' },
  bankDetails: {
    bankName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' }
  },
  openingBalance: { type: Number, default: 0 },
  balanceType: { type: String, enum: ['Dr (Receivable)', 'Cr (Payable)'], default: 'Dr (Receivable)' },
  creditLimit: { type: Number, default: 0 },
  creditPeriod: { type: Number, default: 0 }, // in Days
  paymentTerms: { type: String, default: 'Due on Receipt' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

const Customer = mongoose.model('Customer', customerSchema);

module.exports = { Customer };
