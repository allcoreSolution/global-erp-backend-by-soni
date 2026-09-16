const mongoose = require('mongoose');

const priceMappingSchema = new mongoose.Schema({
  mappingType: { 
    type: String, 
    required: true, 
    enum: ['Customer', 'Product', 'Branch'] 
  },
  mappingId: { type: String, required: true }, // e.g. MAP-101
  targetName: { type: String, required: true },
  priceListName: { type: String, required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true }
}, { timestamps: true });

module.exports = mongoose.model('PriceMapping', priceMappingSchema);
