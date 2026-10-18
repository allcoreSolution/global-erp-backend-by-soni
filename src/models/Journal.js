const mongoose = require('mongoose');

const journalEntryRowSchema = new mongoose.Schema({
  account: { type: String, required: true },
  costCenter: { type: String, default: '' },
  description: { type: String, default: '' },
  debit: { type: Number, default: 0 },
  credit: { type: Number, default: 0 }
});

const journalSchema = new mongoose.Schema({
  // Basic Information
  journalNo: { type: String, required: true, unique: true },
  journalDate: { type: String, required: true },
  financialYear: { type: String, default: '2023-24' },
  referenceNo: { type: String, default: '' },
  
  // Reference Details
  referenceType: { type: String, default: '' },
  customerSupplier: { type: String, default: '' },
  invoiceNo: { type: String, default: '' },
  
  // Tax / Adjustment
  taxConfig: { type: String, default: '' },
  tdsAmount: { type: Number, default: 0 },
  
  // Additional Info
  narration: { type: String, default: '' },
  preparedBy: { type: String, default: '' },
  approvedBy: { type: String, default: '' },

  // Entries List (Dr & Cr)
  entries: [journalEntryRowSchema],

  // Totals
  totals: {
    debit: { type: Number, default: 0 },
    credit: { type: Number, default: 0 }
  }
}, { timestamps: true });

const Journal = mongoose.model('Journal', journalSchema);

module.exports = { Journal };
