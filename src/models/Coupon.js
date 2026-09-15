const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  couponCode: { type: String, required: true, unique: true },
  type: { type: String, default: 'Percentage' },
  amount: { type: Number, default: 0 },
  minAmount: { type: Number, default: 0 },
  qty: { type: Number, default: 0 },
  available: { type: Number, default: 0 },
  expiredDate: { type: String, default: '' },
  createdBy: { type: String, default: '' },
  company: { type: String, default: '' }
}, { timestamps: true });

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = { Coupon };
