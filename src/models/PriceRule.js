const mongoose = require('mongoose');

const priceRuleSchema = new mongoose.Schema({
  ruleCode: { type: String, required: true, unique: true, trim: true },
  productName: { type: String, required: true, trim: true },
  priceType: { type: String, default: 'Fixed' },
  price: { type: Number, default: 0 },
  discountPercentage: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  minQuantity: { type: Number, default: 1 },
  maxQuantity: { type: Number, default: 9999 },
  effectiveFrom: { type: Date },
  effectiveTo: { type: Date },
  isActive: { type: Boolean, default: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

const PriceRule = mongoose.model('PriceRule', priceRuleSchema);

module.exports = { PriceRule };
