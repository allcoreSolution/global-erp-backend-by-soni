const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  address: { type: String, trim: true },
  gstNumber: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  subscriptionPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  subscriptionStatus: { type: String, enum: ['Active', 'Expired', 'Suspended'], default: 'Active' },
  subscriptionExpiry: { type: Date },
  logoUrl: { type: String, default: '' },
  themeColor: { type: String, default: '#1e293b' }
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
