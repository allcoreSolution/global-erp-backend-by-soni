const mongoose = require('mongoose');

const expenseClaimSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  claimDate: { type: Date, required: true },
  category: { type: String, required: true }, // Travel, Food, Lodging, Office Supplies
  amount: { type: Number, required: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

module.exports = mongoose.model('ExpenseClaim', expenseClaimSchema);
