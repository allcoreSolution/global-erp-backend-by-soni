const mongoose = require('mongoose');

const debitNoteItemSchema = new mongoose.Schema({
  product: { type: String, required: true },
  qty: { type: Number, required: true, default: 0 },
  rate: { type: Number, required: true, default: 0 },
  amount: { type: Number, required: true, default: 0 }
});

const debitNoteSchema = new mongoose.Schema({
  // Basic Information
  debitNoteNo: { type: String, required: true, unique: true },
  voucherNo: { type: String }, // To bypass legacy duplicate index E11000
  noteNo: { type: String }, // To bypass legacy duplicate index noteNo_1
  date: { type: String, required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  branch: { type: String, default: '' },
  type: { type: String, default: 'Purchase Return' },
  status: { type: String, default: 'Draft' },
  
  // Supplier Details
  supplier: { type: String, default: '' },

  // Original Purchase Details
  originalInvoiceNo: { type: String, default: '' },
  originalInvoiceDate: { type: String, default: '' },
  
  // Items Array
  items: [debitNoteItemSchema],

  // Summary Inputs (Tax & Discount)
  discount: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  

  
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
