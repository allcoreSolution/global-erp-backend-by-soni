const mongoose = require('mongoose');

const priceListSchema = new mongoose.Schema({
  priceListCode: { type: String, required: true, unique: true, trim: true },
  priceListName: { type: String, required: true, trim: true },
  targetCustomerType: { type: String, default: 'Retailer' },
  isActive: { type: Boolean, default: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

const PriceList = mongoose.model('PriceList', priceListSchema);

module.exports = { PriceList };
