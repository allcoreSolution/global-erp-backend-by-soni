const mongoose = require('mongoose');

const paymentInvoiceSchema = new mongoose.Schema({
  invoiceNo: { type: String, required: true },
  invoiceAmount: { type: Number, default: 0 },
  dueAmount: { type: Number, default: 0 },
  adjustAmount: { type: Number, default: 0 }
});

const paymentSchema = new mongoose.Schema({
  // Basic Details
  paymentNo: { type: String, required: true, unique: true },
  paymentDate: { type: String, required: true },
  paymentType: { type: String, default: 'Supplier' },
  company: { type: String, default: '' },
  branch: { type: String, default: '' },
  status: { type: String, default: 'Draft' },

  // Party Details
  supplierParty: { type: String, default: '' },
  supplierType: { type: String, default: 'Supplier' },
  contactNumber: { type: String, default: '' },
  invoiceNo: { type: String, default: '' },
  purchaseOrder: { type: String, default: '' },

  // Payment Details
  paymentAmount: { type: Number, required: true, default: 0 },
  paymentMethod: { type: String, default: 'Bank' },
  paidFromAccount: { type: String, default: '' },
  transactionRef: { type: String, default: '' },
  bankName: { type: String, default: '' },
  paymentDateDetail: { type: String, default: '' },
  chequeNo: { type: String, default: '' },
  chequeDate: { type: String, default: '' },

  // Deductions & Accounting
  paymentAccount: { type: String, default: '' },
  supplierLedger: { type: String, default: '' },
  costCenter: { type: String, default: '' },
  tdsDeduction: { type: Number, default: 0 },
  otherDeduction: { type: Number, default: 0 },

  // Additional Info
  paidBy: { type: String, default: '' },
  approvedBy: { type: String, default: '' },
  paymentPurpose: { type: String, default: '' },
  remarks: { type: String, default: '' },

  // Invoices Adjustment
  invoices: [paymentInvoiceSchema],

  // Totals
  totals: {
    payment: { type: Number, default: 0 },
    adjusted: { type: Number, default: 0 },
    unadjusted: { type: Number, default: 0 },
    netPayment: { type: Number, default: 0 }
  }
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = { Payment };
