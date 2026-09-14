const mongoose = require('mongoose');

const creditNoteItemSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  rate: { type: Number, required: true, min: 0 },
  taxRate: { type: Number, required: true, min: 0 },
  taxableAmount: { type: Number, required: true, min: 0 },
  gstAmount: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 }
});

const creditNoteSchema = new mongoose.Schema({
  noteNo: { type: String, required: true, unique: true, trim: true },
  date: { type: Date, default: Date.now },
  customer: { type: String, required: true }, // Amit Sharma (Retail)
  invoiceRef: { type: String, required: true },
  items: [creditNoteItemSchema],
  reason: { type: String, required: true },
  status: { type: String, default: 'Pending' }, // Pending (Draft Approval)
  totalTaxableValue: { type: Number, required: true, min: 0 },
  totalGst: { type: Number, required: true, min: 0 },
  grandTotal: { type: Number, required: true, min: 0 },
  attachment: { type: String, default: '' },
  narration: { type: String, default: '' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

const CreditNote = mongoose.model('CreditNote', creditNoteSchema);

module.exports = { CreditNote };
