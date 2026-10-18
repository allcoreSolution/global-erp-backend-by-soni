const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  code: { type: String, default: '' },
  quantity: { type: Number, required: true, min: 1 },
  netUnitPrice: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  taxPercent: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
});

const saleSchema = new mongoose.Schema({
  invoiceNo: { type: String, required: true, unique: true },
  saleDate: { type: String, default: '' },
  referenceNo: { type: String, default: '' },
  biller: { type: String, default: '' },

  // ✅ Fixed: Proper ObjectId references (Hierarchy: Company → Branch → Warehouse)
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', default: null },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', default: null },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },

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
  documentUrl: { type: String, default: '' },
  subTotal: { type: Number, default: 0 },
  discountTotal: { type: Number, default: 0 },
  taxTotal: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  paymentMode: { type: String, enum: ['Cash', 'Card', 'UPI', 'Multiple', 'Credit'], default: 'Cash' },
  amountPaid: { type: Number, default: 0 },
  changeReturned: { type: Number, default: 0 },
  salesPerson: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Sale = mongoose.model('Sale', saleSchema);

module.exports = { Sale };
