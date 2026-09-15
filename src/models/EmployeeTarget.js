const mongoose = require('mongoose');

const employeeTargetSchema = new mongoose.Schema({
  company: { type: String, default: '' }, // acts as the tenant isolation key

  // Basic Info
  targetNo: { type: String, required: true, unique: true },
  targetName: { type: String, required: true },
  targetType: { type: String, default: 'Individual' },
  branch: { type: String, default: '' },
  department: { type: String, default: '' },
  appraisalCycle: { type: String, default: '' },

  // Employee Assignment
  employee: { type: String, default: '' },
  empId: { type: String, default: '' },
  designation: { type: String, default: '' },
  manager: { type: String, default: '' },

  // Target Details
  targetTitle: { type: String, default: '' },
  category: { type: String, default: 'Sales' },
  kpi: { type: String, default: '' },
  targetValue: { type: String, default: '100' },
  unit: { type: String, default: 'Number' },
  priority: { type: String, default: 'High' },
  weightage: { type: String, default: '20' },
  description: { type: String, default: '' },

  // Target Period
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  frequency: { type: String, default: 'Monthly' },
  milestoneBased: { type: String, default: 'No' },

  // Achievement & Measurement
  measurement: { type: String, default: 'Manual' },
  baseline: { type: String, default: '0' },
  achieved: { type: String, default: '0' },
  rating: { type: String, default: '0' },

  // Review & Approval
  assignedBy: { type: String, default: 'HR Manager' },
  reviewer: { type: String, default: 'Reporting Manager' },
  reviewFrequency: { type: String, default: 'Monthly' },
  approvalStatus: { type: String, default: 'Pending' },
  managerRemarks: { type: String, default: '' },

  // Additional Info
  resources: { type: String, default: '' },
  dependencies: { type: String, default: '' },
  notes: { type: String, default: '' }
}, { timestamps: true });

const EmployeeTarget = mongoose.model('EmployeeTarget', employeeTargetSchema);

module.exports = { EmployeeTarget };
