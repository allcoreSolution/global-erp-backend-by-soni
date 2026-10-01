const mongoose = require('mongoose');

const accountLedgerSchema = new mongoose.Schema({
  accountName: { type: String, required: true, trim: true },
  groupType: { 
    type: String, 
    required: true, 
    enum: ['Asset', 'Liability', 'Equity', 'Income', 'Expense'],
    default: 'Asset'
  },
  openingBalance: { type: Number, default: 0 },
  balanceType: { type: String, enum: ['Dr', 'Cr'], default: 'Dr' },
  description: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

module.exports = mongoose.model('AccountLedger', accountLedgerSchema);
