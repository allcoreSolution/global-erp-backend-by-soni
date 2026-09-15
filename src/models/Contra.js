const mongoose = require('mongoose');

const contraSchema = new mongoose.Schema({
  // Basic Information
  contraNo: { type: String, required: true, unique: true },
  contraDate: { type: String, required: true },
  company: { type: String, default: '' },
  branch: { type: String, default: '' },
  voucherType: { type: String, default: 'Contra' },
  status: { type: String, default: 'Draft' },
  
  // Transfer Details
  fromAccount: { type: String, required: true },
  toAccount: { type: String, required: true },
  amount: { type: Number, required: true, default: 0 },
  transferMode: { type: String, default: 'Cash Withdrawal' },
  referenceNo: { type: String, default: '' },
  transactionDate: { type: String, default: '' },
  bankCharges: { type: Number, default: 0 },
  
  // Accounting Details
  debitAccount: { type: String, default: '' },
  creditAccount: { type: String, default: '' },
  costCenter: { type: String, default: '' },
  narration: { type: String, default: '' },
  
  // Additional Info
  preparedBy: { type: String, default: '' },
  approvedBy: { type: String, default: '' },
  remarks: { type: String, default: '' }
}, { timestamps: true });

const Contra = mongoose.model('Contra', contraSchema);

module.exports = { Contra };
