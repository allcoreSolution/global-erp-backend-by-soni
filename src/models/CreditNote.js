const mongoose = require('mongoose');

const creditNoteItemSchema = new mongoose.Schema({
  product: { type: String, required: true },
  batch: { type: String, default: '' },
  qty: { type: Number, required: true, default: 0 },
  rate: { type: Number, required: true, default: 0 },
  taxPercent: { type: Number, default: 0 },
  amount: { type: Number, required: true, default: 0 }
});

const creditNoteSchema = new mongoose.Schema({
  // Basic Information
  creditNoteNo: { type: String, required: true, unique: true },
  date: { type: String, required: true },
  company: { type: String, default: '' },
  branch: { type: String, default: '' },
  type: { type: String, default: 'Sales Return' },
  status: { type: String, default: 'Draft' },
  
  // Customer Details
  customer: { type: String, default: '' },
  customerCode: { type: String, default: '' },
  customerType: { type: String, default: '' },
  mobile: { type: String, default: '' },

  // Original Sales Details
  originalInvoiceNo: { type: String, default: '' },
  originalInvoiceDate: { type: String, default: '' },
  orderNo: { type: String, default: '' },
  challan: { type: String, default: '' },
  
  // Items Array
  items: [creditNoteItemSchema],

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
  refundAmount: { type: Number, default: 0 },
  remainingCredit: { type: Number, default: 0 },
  
  // Accounting
  customerLedger: { type: String, default: '' },
  salesReturnLedger: { type: String, default: '' },
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

const CreditNote = mongoose.model('CreditNote', creditNoteSchema);

module.exports = { CreditNote };
