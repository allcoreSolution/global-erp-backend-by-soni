const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  empId: { type: String, required: true, unique: true, trim: true },
  fullName: { type: String, required: true, trim: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
  dob: { type: Date },
  phone: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  currentAddress: { type: String, default: '' },
  emergencyRelation: { type: String, required: true },
  emergencyPhone: { type: String, required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = { Employee };
