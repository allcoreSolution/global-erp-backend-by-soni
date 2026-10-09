const mongoose = require('mongoose');

const packingSlipProductSchema = new mongoose.Schema({
  productName: { type: String, default: '' },
  productCode: { type: String, default: '' },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  orderedQty: { type: Number, default: 0 },
  packQty: { type: Number, default: 0 },
  batchNo: { type: String, default: '' },
  packagesCount: { type: Number, default: 1 },
  weight: { type: Number, default: 0 }
});

const packingSlipSchema = new mongoose.Schema({
  packingNo: { type: String, required: true, unique: true },
  packingDate: { type: Date, required: true },
  status: { type: String, default: 'Draft' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  
  // Link to Sale (Invoice)
  saleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale', required: true },
  
  // Logistics
  transporter: { type: String, default: '' },
  vehicleNo: { type: String, default: '' },
  
  // Verification
  packedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  remarks: { type: String, default: '' },
  
  items: [packingSlipProductSchema]
}, { timestamps: true });

const PackingSlip = mongoose.model('PackingSlip', packingSlipSchema);

module.exports = { PackingSlip };
