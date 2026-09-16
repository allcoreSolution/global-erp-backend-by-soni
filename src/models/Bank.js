const mongoose = require('mongoose');

const bankSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  accountNumber: { type: String, required: true, trim: true },
  ifscCode: { type: String, required: true, trim: true },
  branchName: { type: String, trim: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Bank', bankSchema);
