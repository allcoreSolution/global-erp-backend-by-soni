const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  deptCode: { type: String, required: true, unique: true, trim: true },
  departmentName: { type: String, required: true, trim: true },
  deptHead: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  budgetAllocation: { type: Number, default: 0 },
  employeesCount: { type: Number, default: 0 },
  description: { type: String, default: '' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
