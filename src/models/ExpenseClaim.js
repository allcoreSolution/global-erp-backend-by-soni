const mongoose = require('mongoose');

const expenseItemSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  category: { type: String, required: true },
  desc: { type: String, default: '' },
  amount: { type: Number, required: true },
  mode: { type: String, default: 'UPI' }
});

const expenseClaimSchema = new mongoose.Schema({
  claimNo: { type: String },
  claimDate: { type: Date, required: true },
  employee: { type: mongoose.Schema.Types.Mixed, required: true }, // Mixed to allow string fallback temporarily
  employeeId: { type: String },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  branch: { type: String },
  department: { type: String },
  
  // Business Purpose
  purpose: { type: String },
  travelFrom: { type: String },
  travelTo: { type: String },
  vehicleMake: { type: String },
  kilometers: { type: Number },
  costPerKm: { type: Number },
  
  // Expenses Array
  expenses: [expenseItemSchema],
  
  // Approvals & Limits
  approver: { type: String },
  expenseLimit: { type: Number },
  exceptionNotes: { type: String },
  
  // Totals
  totalExpense: { type: Number, required: true },
  nonReimbursable: { type: Number, default: 0 },
  advanceTaken: { type: Number, default: 0 },
  reimbursementAmount: { type: Number, default: 0 },
  finalPayable: { type: Number, default: 0 },

  // Status
  status: { type: String, enum: ['Pending', 'Draft', 'Approved', 'Rejected'], default: 'Pending' },
  approvalStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('ExpenseClaim', expenseClaimSchema);
