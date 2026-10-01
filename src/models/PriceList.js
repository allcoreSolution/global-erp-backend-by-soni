const mongoose = require('mongoose');

const priceListSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  priceType: { type: String, default: 'Sales' },
  applicableFor: { type: String, default: 'Retailer' },
  customerType: { type: String, default: 'Retailer' },
  currency: { type: String, default: 'INR' },
  branch: { type: String, default: '' },
  effectiveFrom: { type: String, default: '' },
  effectiveTo: { type: String, default: '' },
  defaultPriceList: { type: Boolean, default: false },
  status: { type: Boolean, default: true },
  notes: { type: String, default: '' },
  productPricing: [{
    product: { type: String },
    sku: { type: String },
    unit: { type: String },
    basePrice: { type: String },
    discount: { type: String },
    tax: { type: String }
  }],
  quantityPricing: [{
    minQty: { type: Number },
    maxQty: { type: Number },
    price: { type: String }
  }],
  company: { type: String, default: '' }
}, { timestamps: true });

const PriceList = mongoose.model('PriceList', priceListSchema);

module.exports = { PriceList };
