const mongoose = require('mongoose');

const bankPaymentInvoiceSchema = new mongoose.Schema({
  invoiceNo: { type: String, required: true },
  invoiceAmount: { type: Number, default: 0 },
  dueAmount: { type: Number, default: 0 },
  adjustAmount: { type: Number, default: 0 }
});

const bankPaymentSchema = new mongoose.Schema({
  // Basic Details
  paymentNo: { type: String, required: true, unique: true },
  paymentDate: { type: String, required: true },
  company: { type: String, default: '' },
  branch: { type: String, default: '' },
  bankAccount: { type: String, default: '' },
  paymentType: { type: String, default: 'Supplier' },

  // Party Details
  supplierParty: { type: String, default: '' },
  supplierType: { type: String, default: 'Supplier' },
  invoiceNo: { type: String, default: '' },
  poNo: { type: String, default: '' },

  // Bank Payment Details
  amount: { type: Number, required: true, default: 0 },
  method: { type: String, default: 'NEFT' },
  bankName: { type: String, default: '' },
  utrNo: { type: String, default: '' },
  transactionDate: { type: String, default: '' },
  chequeNo: { type: String, default: '' },

  // Deductions & Accounting
  tdsAmount: { type: Number, default: 0 },
  bankCharges: { type: Number, default: 0 },
  otherDeduction: { type: Number, default: 0 },
  supplierLedger: { type: String, default: '' },
  bankLedger: { type: String, default: '' },

  // Additional Info
  paidBy: { type: String, default: '' },
  approvedBy: { type: String, default: '' },
  remarks: { type: String, default: '' },

  // Invoices Adjustment
  invoices: [bankPaymentInvoiceSchema],

  // Totals
  totals: {
    payment: { type: Number, default: 0 },
    adjusted: { type: Number, default: 0 },
    unadjusted: { type: Number, default: 0 },
    netPayment: { type: Number, default: 0 }
  }
}, { timestamps: true });

const BankPayment = mongoose.model('BankPayment', bankPaymentSchema);

module.exports = { BankPayment };
