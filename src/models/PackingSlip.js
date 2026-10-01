const mongoose = require('mongoose');

const packingSlipProductSchema = new mongoose.Schema({
  product: { type: String, default: '' },
  batch: { type: String, default: '' },
  qty: { type: String, default: '' },
  package: { type: String, default: '' },
  weight: { type: String, default: '' }
});

const packingSlipSchema = new mongoose.Schema({
  packingNo: { type: String, required: true, unique: true },
  packingDate: { type: String, default: '' },
  status: { type: String, default: 'Pending' },
  company: { type: String, default: '' },
  branch: { type: String, default: '' },
  warehouse: { type: String, default: '' },
  salesOrder: { type: String, default: '' },
  deliveryChallan: { type: String, default: '' },
  invoice: { type: String, default: '' },
  customer: { type: String, default: '' },
  customerType: { type: String, default: '' },
  salesperson: { type: String, default: '' },
  billingAddress: { type: String, default: '' },
  shippingAddress: { type: String, default: '' },
  contact: { type: String, default: '' },
  mobile: { type: String, default: '' },
  transporter: { type: String, default: '' },
  vehicleNo: { type: String, default: '' },
  products: [packingSlipProductSchema],
  packedBy: { type: String, default: '' },
  verifiedBy: { type: String, default: '' },
  remarks: { type: String, default: '' }
}, { timestamps: true });

const PackingSlip = mongoose.model('PackingSlip', packingSlipSchema);

module.exports = { PackingSlip };
