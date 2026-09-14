const mongoose = require('mongoose');

// Bank Payment (Payout) Schema
const bankPaymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true, unique: true, trim: true },
  payoutDate: { type: Date, default: Date.now },
  bankAccount: { type: String, required: true }, // Source Bank Account
  party: { type: String, required: true }, // Supplier / Party Selection
  amountDebited: { type: Number, required: true, min: 0 },
  againstInvoice: { type: String }, // Invoice or Advance reference
  referenceNo: { type: String }, // Cheque No or UTR
  bankCharges: { type: Number, default: 0, min: 0 },
  reconciliationStatus: { type: String, default: 'Unreconciled / Pending Clearing' },
  narration: { type: String, default: '' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

const BankPayment = mongoose.model('BankPayment', bankPaymentSchema);

module.exports = { BankPayment };
