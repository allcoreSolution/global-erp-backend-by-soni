const mongoose = require('mongoose');

const invoiceAdjustmentSchema = new mongoose.Schema({
  invoiceNo: { type: String, required: true },
  invoiceAmount: { type: Number, default: 0 },
  dueAmount: { type: Number, default: 0 },
  adjustAmount: { type: Number, default: 0 }
});

const receiptSchema = new mongoose.Schema({
  // Basic Details
  receiptNo: { type: String, required: true, unique: true },
  receiptDate: { type: String, required: true },
  receiptType: { type: String, default: 'Customer' },
  company: { type: String, default: '' },
  branch: { type: String, default: '' },
  status: { type: String, default: 'Draft' },

  // Party Details
  customerParty: { type: String, default: '' },
  customerType: { type: String, default: 'Retailer' },
  contactNumber: { type: String, default: '' },
  referenceInvoice: { type: String, default: '' },
  referenceOrder: { type: String, default: '' },

  // Payment Details
  paymentAmount: { type: Number, required: true, default: 0 },
  paymentMethod: { type: String, default: 'UPI' },
  account: { type: String, default: '' },
  transactionRef: { type: String, default: '' },
  paymentDate: { type: String, default: '' },
  bankName: { type: String, default: '' },
  chequeNo: { type: String, default: '' },
  chequeDate: { type: String, default: '' },

  // Accounting
  receiptAccount: { type: String, default: '' },
  customerLedger: { type: String, default: '' },
  costCenter: { type: String, default: '' },
  tdsAdjustment: { type: String, default: '' },
  exchangeRate: { type: String, default: '1.00' },

  // Additional Info
  receivedBy: { type: String, default: '' },
  approvedBy: { type: String, default: '' },
  remarks: { type: String, default: '' },

  // Invoices Adjustment
  invoices: [invoiceAdjustmentSchema],

  // Totals
  totals: {
    received: { type: Number, default: 0 },
    adjusted: { type: Number, default: 0 },
    unadjusted: { type: Number, default: 0 }
  }
}, { timestamps: true });

const Receipt = mongoose.model('Receipt', receiptSchema);

module.exports = { Receipt };
