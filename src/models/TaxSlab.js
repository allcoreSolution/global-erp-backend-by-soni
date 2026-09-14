const mongoose = require('mongoose');

const taxSlabSchema = new mongoose.Schema({
  taxCode: { type: String, required: true, unique: true, trim: true },
  taxName: { type: String, required: true, trim: true },
  gstRate: { type: Number, required: true, min: 0 },
  cessRate: { type: Number, default: 0, min: 0 },
  cgst: { type: Number, default: 0 },
  sgst: { type: Number, default: 0 },
  igst: { type: Number, default: 0 },
  isInclusive: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

const TaxSlab = mongoose.model('TaxSlab', taxSlabSchema);

module.exports = { TaxSlab };
