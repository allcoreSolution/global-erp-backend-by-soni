const mongoose = require('mongoose');

const salaryStructureSchema = new mongoose.Schema({
  gradeName: { type: String, required: true, trim: true },
  basicSalary: { type: Number, required: true },
  hra: { type: Number, default: 0 },
  da: { type: Number, default: 0 },
  otherAllowances: { type: Number, default: 0 },
  pfDeduction: { type: Number, default: 0 },
  esiDeduction: { type: Number, default: 0 },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

// Optional: Virtual property for gross salary
salaryStructureSchema.virtual('grossSalary').get(function() {
  return this.basicSalary + this.hra + this.da + this.otherAllowances;
});

// Optional: Virtual property for net salary
salaryStructureSchema.virtual('netSalary').get(function() {
  return this.grossSalary - (this.pfDeduction + this.esiDeduction);
});

// Ensure virtuals are included in JSON response
salaryStructureSchema.set('toJSON', { virtuals: true });
salaryStructureSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('SalaryStructure', salaryStructureSchema);
