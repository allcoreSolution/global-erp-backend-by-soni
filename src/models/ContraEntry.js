const mongoose = require('mongoose');

// Contra Entry (Bank-to-Cash / Cash-to-Bank Transfer) Schema
const contraEntrySchema = new mongoose.Schema({
  voucherNumber: { type: String, required: true, unique: true, trim: true },
  date: { type: Date, default: Date.now },
  transferMode: { type: String, required: true }, // e.g., 'Cash Deposit (Cash to Bank)'
  fromAccount: { type: String, required: true }, // Source Ledger
  toAccount: { type: String, required: true }, // Destination Ledger
  amount: { type: Number, required: true, min: 0 },
  referenceNo: { type: String }, // Cheque or UTR
  attachment: { type: String }, // File path to slip copy
  narration: { type: String, default: '' }, // Detailed notes,
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

const ContraEntry = mongoose.model('ContraEntry', contraEntrySchema);

module.exports = { ContraEntry };
