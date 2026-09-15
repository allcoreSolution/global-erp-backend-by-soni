const mongoose = require('mongoose');

const priceRuleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  type: { type: String, default: 'Discount' },
  description: { type: String, default: '' },
  status: { type: String, default: 'Active' },
  branch: { type: String, default: '' },
  customerType: { type: String, default: '' },
  priceList: { type: String, default: '' },
  category: { type: String, default: '' },
  brand: { type: String, default: '' },
  product: { type: String, default: '' },
  condition: { type: String, default: 'Quantity' },
  operator: { type: String, default: 'Greater Than / Equal' },
  conditionValue: { type: Number, default: 0 },
  discountType: { type: String, default: 'Percentage' },
  discountValue: { type: Number, default: 0 },
  maxDiscount: { type: String, default: '' },
  start: { type: String, default: '' },
  end: { type: String, default: '' },
  priority: { type: Number, default: 1 },
  stackDiscount: { type: Boolean, default: false },
  company: { type: String, default: '' }
}, { timestamps: true });

const PriceRule = mongoose.model('PriceRule', priceRuleSchema);

module.exports = { PriceRule };
