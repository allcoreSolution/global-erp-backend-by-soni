const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  id: { type: String, required: true, trim: true },
  code: { type: String, default: '' },
  name: { type: String, required: true, trim: true },
  manager: { type: String, default: '' },
  status: { type: String, default: 'Active' },
  contactPerson: { type: String, default: '' },
  mobile: { type: String, default: '' },
  email: { type: String, default: '', lowercase: true, trim: true },
  phone: { type: String, default: '' },
  address1: { type: String, default: '' },
  address2: { type: String, default: '' },
  state: { type: String, default: 'Uttar Pradesh' },
  city: { type: String, default: 'Lucknow' },
  district: { type: String, default: '' },
  pincode: { type: String, default: '' },
  gstStatus: { type: String, default: 'Registered' },
  gstin: { type: String, default: '' },
  pan: { type: String, default: '' },
  tan: { type: String, default: '' },

  // ✅ Fixed: Proper ObjectId reference to Company
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },
  documentUrl: { type: String, default: '' }
}, { timestamps: true });

// Compound index to ensure branch IDs are unique only PER COMPANY
branchSchema.index({ company: 1, id: 1 }, { unique: true });

const Branch = mongoose.model('Branch', branchSchema);

module.exports = { Branch };
