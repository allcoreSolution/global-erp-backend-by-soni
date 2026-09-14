const mongoose = require('mongoose');

const designationSchema = new mongoose.Schema({
  roleCode: { type: String, required: true, unique: true, trim: true },
  designationName: { type: String, required: true, trim: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  reportingManager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  jobDescription: { type: String, default: '' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

module.exports = mongoose.model('Designation', designationSchema);
