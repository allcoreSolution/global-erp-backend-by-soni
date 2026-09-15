const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  code: { type: String, default: '' },
  quantity: { type: Number, required: true, min: 1 },
  netUnitPrice: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  taxPercent: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' } // Optional ref
});

const saleSchema = new mongoose.Schema({
  invoiceNo: { type: String, required: true, unique: true },
  saleDate: { type: String, default: '' },
  referenceNo: { type: String, default: '' },
  biller: { type: String, default: '' },
  warehouse: { type: String, default: '' },
  customer: { type: String, default: 'Walk-in Customer' },
  customerMobile: { type: String, default: '' },
  currency: { type: String, default: 'INR' },
  exchangeRate: { type: String, default: '1' },
  orderItems: [saleItemSchema],
  orderTax: { type: String, default: 'No Tax' },
  discountType: { type: String, default: 'Flat' },
  discountValue: { type: String, default: '0.00' },
  shippingCost: { type: String, default: '0' },
  saleStatus: { type: String, default: 'Completed' },
  paymentStatus: { type: String, default: 'Paid' },
  saleNote: { type: String, default: '' },
  staffNote: { type: String, default: '' },
  subTotal: { type: Number, default: 0 },
  discountTotal: { type: Number, default: 0 },
  taxTotal: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  paymentMode: { type: String, enum: ['Cash', 'Card', 'UPI', 'Multiple', 'Credit'], default: 'Cash' },
  amountPaid: { type: Number, default: 0 },
  changeReturned: { type: Number, default: 0 },
  salesPerson: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  company: { type: String, default: '' }
}, { timestamps: true });

const Sale = mongoose.model('Sale', saleSchema);

module.exports = { Sale };
