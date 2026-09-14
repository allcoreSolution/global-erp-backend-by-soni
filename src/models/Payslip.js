const mongoose = require('mongoose');

const payslipSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: String, required: true },
  year: { type: String, required: true },
  workingDays: { type: Number, default: 0 },
  paidDays: { type: Number, default: 0 },
  basicSalary: { type: Number, default: 0 },
  hra: { type: Number, default: 0 },
  da: { type: Number, default: 0 },
  otherAllowances: { type: Number, default: 0 },
  pfDeduction: { type: Number, default: 0 },
  esiDeduction: { type: Number, default: 0 },
  loanDeduction: { type: Number, default: 0 },
  grossEarnings: { type: Number, default: 0 },
  totalDeductions: { type: Number, default: 0 },
  netPay: { type: Number, default: 0 },
  status: { type: String, enum: ['Generated', 'Paid'], default: 'Generated' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

// Prevent duplicate payslip for same employee for same month/year
payslipSchema.index({ employee: 1, month: 1, year: 1, company: 1 }, { unique: true });

module.exports = mongoose.model('Payslip', payslipSchema);
