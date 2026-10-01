const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  company: { type: String, default: '' }, // acts as the tenant isolation key

  // Basic Information
  deptCode: { type: String, required: true, unique: true },
  deptName: { type: String, required: true },
  deptType: { type: String, default: 'Internal' },
  parentDept: { type: String, default: '' },
  branch: { type: String, default: '' },
  status: { type: String, default: 'Active' },

  // Department Head
  deptHead: { type: String, default: '' },
  assistantManager: { type: String, default: '' },
  reportingDept: { type: String, default: '' },

  // Contact Details
  contactPerson: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  floor: { type: String, default: '' },

  // Department Details
  description: { type: String, default: '' },
  objective: { type: String, default: '' },
  responsibilities: { type: String, default: '' },
  costCenter: { type: String, default: '' },
  profitCenter: { type: String, default: '' },
  budget: { type: String, default: '' },

  // Working Configuration
  workingDays: { type: String, default: 'Mon-Sat' },
  defaultShift: { type: String, default: '' },
  attendanceRequired: { type: String, default: 'Yes' },
  leaveApproval: { type: String, default: 'Manager' },
  expenseApproval: { type: String, default: 'Manager' },

  // Additional Information
  displayOrder: { type: String, default: '' },
  remarks: { type: String, default: '' },
  internalNotes: { type: String, default: '' }
}, { timestamps: true });

const Department = mongoose.model('Department', departmentSchema);

module.exports = { Department };
