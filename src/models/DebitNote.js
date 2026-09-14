const mongoose = require('mongoose');

const debitNoteItemSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  rate: { type: Number, required: true, min: 0 },
  taxRate: { type: Number, required: true, min: 0 },
  taxableAmount: { type: Number, required: true, min: 0 },
  gstAmount: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 }
});

const debitNoteSchema = new mongoose.Schema({
  noteNo: { type: String, required: true, unique: true, trim: true },
  date: { type: Date, default: Date.now },
  supplier: { type: String, required: true },
  invoiceRef: { type: String, required: true },
  items: [debitNoteItemSchema],
  reason: { type: String, required: true },
  status: { type: String, default: 'Pending' }, // Pending (Draft Approval)
  totalTaxableValue: { type: Number, required: true, min: 0 },
  totalGst: { type: Number, required: true, min: 0 },
  grandTotal: { type: Number, required: true, min: 0 },
  attachment: { type: String, default: '' },
  narration: { type: String, default: '' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

const DebitNote = mongoose.model('DebitNote', debitNoteSchema);

module.exports = { DebitNote };
