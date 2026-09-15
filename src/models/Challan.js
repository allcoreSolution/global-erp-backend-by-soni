const mongoose = require('mongoose');

const challanItemSchema = new mongoose.Schema({
  product: { type: String, default: '' },
  sku: { type: String, default: '' },
  batch: { type: String, default: '' },
  qty: { type: String, default: '' },
  unit: { type: String, default: '' },
  rate: { type: String, default: '' }
});

const challanSchema = new mongoose.Schema({
  challanNo: { type: String, required: true, unique: true },
  challanDate: { type: String, default: '' },
  challanType: { type: String, default: 'Delivery' },
  company: { type: String, default: '' },
  branch: { type: String, default: '' },
  warehouse: { type: String, default: '' },
  salesOrder: { type: String, default: '' },
  invoiceNo: { type: String, default: '' },
  packingSlip: { type: String, default: '' },
  customer: { type: String, default: '' },
  contactPerson: { type: String, default: '' },
  mobileNo: { type: String, default: '' },
  billingAddress: { type: String, default: '' },
  shippingAddress: { type: String, default: '' },
  sameAsBilling: { type: Boolean, default: false },
  items: [challanItemSchema],
  transportMode: { type: String, default: 'Road' },
  transporter: { type: String, default: '' },
  vehicleNo: { type: String, default: '' },
  driverName: { type: String, default: '' },
  driverMobile: { type: String, default: '' },
  lrGrNo: { type: String, default: '' },
  ewayBillNo: { type: String, default: '' },
  dispatchDate: { type: String, default: '' },
  expectedDate: { type: String, default: '' },
  deliveryStatus: { type: String, default: 'Pending' },
  receivedBy: { type: String, default: '' },
  deliveryDate: { type: String, default: '' },
  deliveryRemarks: { type: String, default: '' },
  preparedBy: { type: String, default: '' },
  approvedBy: { type: String, default: '' },
  notes: { type: String, default: '' }
}, { timestamps: true });

const Challan = mongoose.model('Challan', challanSchema);

module.exports = { Challan };
