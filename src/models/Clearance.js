const mongoose = require('mongoose');

// Clearance (Bank Deposit/Reconciliation) Schema
const clearanceSchema = new mongoose.Schema({
  clearanceId: { type: String, required: true, unique: true, trim: true },
  clearanceDate: { type: Date, default: Date.now },
  bankAccount: { type: String, required: true }, // Bank Account info/reference
  party: { type: String, required: true }, // Customer or Party name/reference
  amountDeposited: { type: Number, required: true, min: 0 },
  againstInvoice: { type: String }, // Invoice or Advance reference
  referenceNo: { type: String }, // Cheque No or UTR
  bankCharges: { type: Number, default: 0, min: 0 },
  reconciliationStatus: { type: String, default: 'Unreconciled / Pending Clearing' },
  narration: { type: String, default: '' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

const Clearance = mongoose.model('Clearance', clearanceSchema);

module.exports = { Clearance };
