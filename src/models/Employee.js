const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  // Personal Information
  employeeId: { type: String, required: true, unique: true },
  employeeName: { type: String, required: true },
  dob: { type: String, default: '' },
  gender: { type: String, default: '' },
  maritalStatus: { type: String, default: '' },
  mobile: { type: String, default: '' },
  email: { type: String, default: '' },
  
  // Employment Details
  company: { type: String, default: '' }, // acts as the tenant isolation key
  branch: { type: String, default: '' },
  department: { type: String, default: '' },
  designation: { type: String, default: '' },
  employeeType: { type: String, default: 'Permanent' },
  joiningDate: { type: String, default: '' },
  status: { type: String, default: 'Active' },
  reportingManager: { type: String, default: '' },
  shift: { type: String, default: '' },

  // Address
  currentAddress: { type: String, default: '' },
  currentState: { type: String, default: '' },
  currentCity: { type: String, default: '' },
  currentPincode: { type: String, default: '' },
  sameAsCurrent: { type: Boolean, default: false },
  permanentAddress: { type: String, default: '' },
  
  // Identity & Compliance
  pan: { type: String, default: '' },
  uan: { type: String, default: '' },
  pfNo: { type: String, default: '' },
  esicNo: { type: String, default: '' },
  
  // Bank & Salary
  bank: { type: String, default: '' },
  accountNo: { type: String, default: '' },
  ifsc: { type: String, default: '' },
  salaryType: { type: String, default: 'Monthly' },
  basicSalary: { type: Number, default: 0 },
  hra: { type: Number, default: 0 },
  allowance: { type: Number, default: 0 },
  grossSalary: { type: Number, default: 0 },
  netSalary: { type: Number, default: 0 },
  
  // Emergency Contact
  emergencyName: { type: String, default: '' },
  emergencyRelationship: { type: String, default: '' },
  emergencyMobile: { type: String, default: '' },

  // ERP Login
  createLogin: { type: String, default: 'No' },
  username: { type: String, default: '' },
  role: { type: String, default: '' },
  loginStatus: { type: String, default: 'Active' },
  
  // Profile Picture
  profilePhoto: { type: String, default: '' },
  
  // Remarks
  remarks: { type: String, default: '' }
}, { timestamps: true });

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = { Employee };
