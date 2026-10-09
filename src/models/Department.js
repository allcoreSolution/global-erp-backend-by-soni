const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  company: { type: String, default: '' }, // acts as the tenant isolation key

  // Basic Information
  deptCode: { type: String, required: true, unique: true },
  deptName: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, default: 'Active' },
}, { timestamps: true });

const Department = mongoose.model('Department', departmentSchema);

module.exports = { Department };
