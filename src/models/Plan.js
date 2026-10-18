const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, default: 0 },
  durationDays: { type: Number, required: true, default: 30 },
  billingCycle: { type: String, default: '1 Month' }, // e.g. 1 Month, 3 Months, 1 Year
  subtitle: { type: String, default: '' },
  themeColor: { type: String, default: 'peach' }, // peach, emerald, cyan, violet
  iconType: { type: String, default: 'flower' }, // flower, clover, diamond, star
  isPopular: { type: Boolean, default: false },
  features: [{ type: String }],
  // Dynamic feature toggling & permissions for the plan
  allowedModules: [{ type: String, trim: true }],
  modulePermissions: [{
    module: { type: String, required: true },
    view: { type: Boolean, default: true },
    create: { type: Boolean, default: true },
    edit: { type: Boolean, default: true },
    delete: { type: Boolean, default: true }
  }],
  // Quota & Limits
  maxUsers: { type: Number, default: 10 },
  maxBranches: { type: Number, default: 1 },
  maxWarehouses: { type: Number, default: 1 },
  maxInvoicesPerMonth: { type: Number, default: 0 }, // 0 = unlimited
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Plan', planSchema);
