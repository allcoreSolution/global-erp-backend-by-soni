const mongoose = require('mongoose');

const voucherEntrySchema = new mongoose.Schema({
  account: { type: mongoose.Schema.Types.ObjectId, ref: 'AccountLedger', required: true },
  debitAmount: { type: Number, default: 0 },
  creditAmount: { type: Number, default: 0 },
  narration: { type: String, trim: true }
});

const voucherSchema = new mongoose.Schema({
  voucherNo: { type: String, required: true, trim: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  voucherType: { 
    type: String, 
    required: true, 
    enum: ['Receipt', 'Payment', 'Journal', 'Contra', 'Sales', 'Purchase'] 
  },
  entries: [voucherEntrySchema],
  totalDebit: { type: Number, default: 0 },
  totalCredit: { type: Number, default: 0 },
  generalNarration: { type: String, trim: true },
  status: { type: String, enum: ['Draft', 'Posted', 'Cancelled'], default: 'Posted' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

// Pre-save hook to ensure Double-Entry Accounting principles (Debit == Credit)
voucherSchema.pre('save', function() {
  let totalDr = 0;
  let totalCr = 0;
  
  if (this.entries && this.entries.length > 0) {
    this.entries.forEach(entry => {
      totalDr += (entry.debitAmount || 0);
      totalCr += (entry.creditAmount || 0);
    });
  }
  
  this.totalDebit = totalDr;
  this.totalCredit = totalCr;
  
  if (totalDr !== totalCr) {
    throw new Error(`Double Entry validation failed: Total Debit (${totalDr}) must equal Total Credit (${totalCr})`);
  }
});

module.exports = mongoose.model('Voucher', voucherSchema);
