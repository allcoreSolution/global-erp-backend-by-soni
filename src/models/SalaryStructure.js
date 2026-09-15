const mongoose = require('mongoose');

const componentSchema = new mongoose.Schema({
  component: { type: String, required: true },
  type: { type: String, required: true }, // 'Fixed', '% Basic', '%'
  amount: { type: Number, required: true },
  calculatedValue: { type: Number, default: 0 }
});

const salaryStructureSchema = new mongoose.Schema({
  // Basic Info
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  company: { type: String, default: '' }, // acts as the tenant isolation key
  branch: { type: String, default: '' },
  department: { type: String, default: '' },
  designation: { type: String, default: '' },
  employeeType: { type: String, default: 'Permanent' },
  currency: { type: String, default: 'INR' },
  effectiveFrom: { type: String, default: '' },
  status: { type: String, default: 'Active' },
  
  // Payroll Rules
  workingDays: { type: String, default: '30' },
  overtime: { type: String, default: 'No' },
  lop: { type: String, default: 'Yes' },
  leaveDeduction: { type: String, default: 'Yes' },
  lateDeduction: { type: String, default: 'No' },
  bonus: { type: String, default: 'No' },
  
  // Tax & Compliance
  pfApplicable: { type: String, default: 'Yes' },
  esicApplicable: { type: String, default: 'Yes' },
  ptApplicable: { type: String, default: 'Yes' },
  tdsApplicable: { type: String, default: 'Yes' },
  
  // Accounting
  salaryExpenseAccount: { type: String, default: '' },
  salaryPayableAccount: { type: String, default: '' },
  pfPayableAccount: { type: String, default: '' },
  tdsPayableAccount: { type: String, default: '' },
  
  // Arrays
  earnings: [componentSchema],
  deductions: [componentSchema],

  // Totals
  totals: {
    basic: { type: Number, default: 0 },
    grossEarnings: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 },
    netSalary: { type: Number, default: 0 },
    employerCost: { type: Number, default: 0 },
    ctc: { type: Number, default: 0 }
  },

  // Remarks
  remarks: { type: String, default: '' }
}, { timestamps: true });

const SalaryStructure = mongoose.model('SalaryStructure', salaryStructureSchema);

module.exports = { SalaryStructure };
