const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  driverCode: { type: String, required: true, unique: true },
  driverName: { type: String, required: true },
  mobile: { type: String, default: '' },
  altMobile: { type: String, default: '' },
  email: { type: String, default: '' },
  dob: { type: String, default: '' },
  gender: { type: String, default: 'Select' },
  status: { type: String, default: 'Active' },
  
  licenceNo: { type: String, default: '' },
  licenceType: { type: String, default: 'Commercial' },
  licenceCategory: { type: String, default: 'HMV' },
  issueDate: { type: String, default: '' },
  expiryDate: { type: String, default: '' },
  
  company: { type: String, default: 'Select' },
  branch: { type: String, default: 'Select' },
  employeeId: { type: String, default: '' },
  joiningDate: { type: String, default: '' },
  driverType: { type: String, default: 'Permanent' },
  salaryType: { type: String, default: 'Monthly' },
  
  vehicleNo: { type: String, default: 'Select' },
  vehicleType: { type: String, default: '' },
  assignmentDate: { type: String, default: '' },
  isPrimary: { type: Boolean, default: false },
  
  emergencyName: { type: String, default: '' },
  emergencyRelation: { type: String, default: '' },
  emergencyMobile: { type: String, default: '' },
  
  bankName: { type: String, default: '' },
  accountNumber: { type: String, default: '' },
  ifsc: { type: String, default: '' },
  upiId: { type: String, default: '' },
  paymentMode: { type: String, default: 'Bank Transfer' },
  
  experience: { type: String, default: '' },
  skills: { type: String, default: '' },
  remarks: { type: String, default: '' }
}, { timestamps: true });

const Driver = mongoose.model('Driver', driverSchema);

module.exports = { Driver };
