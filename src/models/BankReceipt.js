const mongoose = require('mongoose');

const bankReceiptInvoiceSchema = new mongoose.Schema({
  invoiceNo: { type: String, required: true },
  invoiceAmount: { type: Number, default: 0 },
  dueAmount: { type: Number, default: 0 },
  adjustAmount: { type: Number, default: 0 }
});

const bankReceiptSchema = new mongoose.Schema({
  // Basic Details
  receiptNo: { type: String, required: true, unique: true },
  receiptDate: { type: String, required: true },
  company: { type: String, default: '' },
  branch: { type: String, default: '' },
  bankAccount: { type: String, default: '' },
  receiptType: { type: String, default: 'Customer Receipt' },

  // Party Details
  customerParty: { type: String, default: '' },
  customerType: { type: String, default: 'Retailer' },
  invoiceNo: { type: String, default: '' },
  contactNumber: { type: String, default: '' },

  // Payment Details
  amount: { type: Number, required: true, default: 0 },
  method: { type: String, default: 'NEFT' },
  bankName: { type: String, default: '' },
  utrNo: { type: String, default: '' },
  transactionDate: { type: String, default: '' },
  chequeNo: { type: String, default: '' },

  // Accounting Details
  bankLedger: { type: String, default: '' },
  customerLedger: { type: String, default: '' },
  tdsAmount: { type: Number, default: 0 },
  otherDeduction: { type: Number, default: 0 },

  // Additional Info
  receivedBy: { type: String, default: '' },
  approvedBy: { type: String, default: '' },
  remarks: { type: String, default: '' },

  // Invoices Adjustment
  invoices: [bankReceiptInvoiceSchema],

  // Totals
  totals: {
    received: { type: Number, default: 0 },
    adjusted: { type: Number, default: 0 },
    unadjusted: { type: Number, default: 0 }
  }
}, { timestamps: true });

const BankReceipt = mongoose.model('BankReceipt', bankReceiptSchema);

module.exports = { BankReceipt };
