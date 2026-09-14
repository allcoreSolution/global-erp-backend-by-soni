const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  branchCode: { type: String, required: true, unique: true, trim: true },
  branchName: { type: String, required: true, trim: true },
  branchType: { type: String, default: 'Retail Store' },
  gstin: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '', lowercase: true, trim: true },
  address: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

const Branch = mongoose.model('Branch', branchSchema);

module.exports = { Branch };
