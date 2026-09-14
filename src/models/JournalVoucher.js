const mongoose = require('mongoose');

const journalVoucherItemSchema = new mongoose.Schema({
  type: { type: String, enum: ['Dr', 'Cr'], required: true },
  ledgerAccount: { type: String, required: true },
  debitAmount: { type: Number, default: 0, min: 0 },
  creditAmount: { type: Number, default: 0, min: 0 },
  particularNarration: { type: String, default: '' }
});

const journalVoucherSchema = new mongoose.Schema({
  voucherNo: { type: String, required: true, unique: true, trim: true },
  date: { type: Date, default: Date.now },
  referenceNo: { type: String, default: '' },
  approvalStatus: { type: String, default: 'Pending' },
  generalNarration: { type: String, default: '' },
  attachment: { type: String, default: '' },
  items: [journalVoucherItemSchema],
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

const JournalVoucher = mongoose.model('JournalVoucher', journalVoucherSchema);

module.exports = { JournalVoucher };
