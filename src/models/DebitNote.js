const mongoose = require('mongoose');

const debitNoteItemSchema = new mongoose.Schema({
  product: { type: String, required: true },
  batch: { type: String, default: '' },
  qty: { type: Number, required: true, default: 0 },
  rate: { type: Number, required: true, default: 0 },
  taxPercent: { type: Number, default: 0 },
  amount: { type: Number, required: true, default: 0 }
});

const debitNoteSchema = new mongoose.Schema({
  // Basic Information
  debitNoteNo: { type: String, required: true, unique: true },
  date: { type: String, required: true },
  company: { type: String, default: '' },
  branch: { type: String, default: '' },
  type: { type: String, default: 'Purchase Return' },
  status: { type: String, default: 'Draft' },
  
  // Supplier Details
  supplier: { type: String, default: '' },
  supplierCode: { type: String, default: '' },
  contact: { type: String, default: '' },
  mobile: { type: String, default: '' },

  // Original Purchase Details
  originalInvoiceNo: { type: String, default: '' },
  originalInvoiceDate: { type: String, default: '' },
  poNo: { type: String, default: '' },
  grnNo: { type: String, default: '' },
  
  // Items Array
  items: [debitNoteItemSchema],

  // Summary Inputs (Tax & Discount)
  discount: { type: Number, default: 0 },
  cgst: { type: Number, default: 0 },
  sgst: { type: Number, default: 0 },
  igst: { type: Number, default: 0 },
  roundOff: { type: Number, default: 0 },
  
  // Adjustment / Settlement
  adjustmentType: { type: String, default: 'Adjust Against Invoice' },
  adjustInvoiceNo: { type: String, default: '' },
  adjustAmount: { type: Number, default: 0 },
  remainingAmount: { type: Number, default: 0 },
  
  // Accounting
  supplierLedger: { type: String, default: '' },
  purchaseReturnLedger: { type: String, default: '' },
  taxAccount: { type: String, default: '' },
  costCenter: { type: String, default: '' },
  
  // Remarks
  remarks: { type: String, default: '' },

  // Summary
  summary: {
    subTotal: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 }
  }
}, { timestamps: true });

const DebitNote = mongoose.model('DebitNote', debitNoteSchema);

module.exports = { DebitNote };
