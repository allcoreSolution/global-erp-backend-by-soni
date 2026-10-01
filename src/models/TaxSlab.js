const mongoose = require('mongoose');

const taxSlabSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  type: { type: String, default: 'GST' },
  rate: { type: Number, default: 18 },
  status: { type: String, default: 'Active' },
  gstType: { type: String, default: 'CGST + SGST' },
  cgst: { type: Number, default: 9 },
  sgst: { type: Number, default: 9 },
  igst: { type: Number, default: 18 },
  cess: { type: Number, default: 0 },
  transactionSales: { type: Boolean, default: true },
  transactionPurchase: { type: Boolean, default: true },
  transactionReturn: { type: Boolean, default: false },
  applyOn: { type: String, default: 'Product' },
  hsnSac: { type: String, default: '' },
  category: { type: String, default: '' },
  calculation: { type: String, default: 'On Discounted Price' },
  inclusive: { type: Boolean, default: false },
  placeState: { type: String, default: 'Uttar Pradesh' },
  taxTreatment: { type: String, default: 'Intra-State' },
  inputLedger: { type: String, default: '' },
  outputLedger: { type: String, default: '' },
  effectiveFrom: { type: String, default: '' },
  effectiveTo: { type: String, default: '' },
  reverseCharge: { type: Boolean, default: false },
  taxExempt: { type: Boolean, default: false },
  zeroRated: { type: Boolean, default: false },
  company: { type: String, default: '' }
}, { timestamps: true });

const TaxSlab = mongoose.model('TaxSlab', taxSlabSchema);

module.exports = { TaxSlab };
