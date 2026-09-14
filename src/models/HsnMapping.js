const mongoose = require('mongoose');

const hsnMappingSchema = new mongoose.Schema({
  mappingId: { type: String, required: true, unique: true, trim: true },
  hsnSacCode: { type: String, required: true, trim: true },
  taxCategory: { type: String, default: '' },
  salesTaxSlab: { type: String, required: true },
  purchaseTaxSlab: { type: String, required: true },
  taxExemptionReason: { type: String, default: 'No Exemption' },
  isActive: { type: Boolean, default: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

const HsnMapping = mongoose.model('HsnMapping', hsnMappingSchema);

module.exports = { HsnMapping };
