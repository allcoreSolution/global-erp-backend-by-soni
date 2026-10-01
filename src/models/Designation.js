const mongoose = require('mongoose');

const designationSchema = new mongoose.Schema({
  company: { type: String, default: '' }, // acts as the tenant isolation key

  // Basic Information
  desigCode: { type: String, required: true, unique: true },
  desigName: { type: String, required: true },
  desigType: { type: String, default: 'Managerial' },
  branch: { type: String, default: '' },
  department: { type: String, default: '' },
  parentDesig: { type: String, default: '' },
  status: { type: String, default: 'Active' },

  // Job Details
  jobTitle: { type: String, default: '' },
  jobLevel: { type: String, default: '' },
  jobCategory: { type: String, default: '' },
  employmentType: { type: String, default: 'Permanent' },
  experience: { type: String, default: '' },
  qualification: { type: String, default: '' },
  skills: { type: String, default: '' },
  jobDescription: { type: String, default: '' },
  responsibilities: { type: String, default: '' },

  // Reporting & Authority
  reportsTo: { type: String, default: '' },
  approvalAuthority: { type: String, default: '' },
  teamSize: { type: String, default: '' },
  leaveApproval: { type: String, default: 'Yes' },
  expenseApproval: { type: String, default: 'Yes' },

  // Salary Configuration
  salaryGrade: { type: String, default: '' },
  minSalary: { type: String, default: '' },
  maxSalary: { type: String, default: '' },
  salaryStructure: { type: String, default: '' },
  overtimeApplicable: { type: String, default: 'No' },
  incentiveApplicable: { type: String, default: 'Yes' },

  // Additional Information
  displayOrder: { type: String, default: '' },
  description: { type: String, default: '' },
  remarks: { type: String, default: '' },
  internalNotes: { type: String, default: '' }
}, { timestamps: true });

const Designation = mongoose.model('Designation', designationSchema);

module.exports = { Designation };
