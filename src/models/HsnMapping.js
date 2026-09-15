const mongoose = require('mongoose');

const hsnMappingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, trim: true },
  hsnCode: { type: String, required: true, trim: true },
  hsnType: { type: String, default: 'HSN' },
  description: { type: String, default: '' },
  category: { type: String, default: '' },
  product: { type: String, default: '' },
  unit: { type: String, default: '' },
  taxConfig: { type: String, default: '' },
  gstRate: { type: Number, default: 0 },
  cgst: { type: Number, default: 0 },
  sgst: { type: Number, default: 0 },
  igst: { type: Number, default: 0 },
  cess: { type: Number, default: 0 },
  effectiveFrom: { type: String, default: '' },
  effectiveTo: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  company: { type: String, default: '' }
}, { timestamps: true });

const HsnMapping = mongoose.model('HsnMapping', hsnMappingSchema);

module.exports = { HsnMapping };
