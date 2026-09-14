const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }, // unit selling price
  taxAmount: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true }
});

const saleSchema = new mongoose.Schema({
  invoiceNo: { type: String, required: true, unique: true },
  customerName: { type: String, default: 'Walk-in Customer' },
  customerMobile: { type: String, default: '' },
  items: [saleItemSchema],
  subTotal: { type: Number, required: true },
  discountTotal: { type: Number, default: 0 },
  taxTotal: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  paymentMode: { type: String, enum: ['Cash', 'Card', 'UPI', 'Multiple', 'Credit'], default: 'Cash' },
  paymentStatus: { type: String, enum: ['Paid', 'Unpaid', 'Partially Paid'], default: 'Paid' },
  amountPaid: { type: Number, default: 0 },
  changeReturned: { type: Number, default: 0 },
  salesPerson: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

// Coupon Schema for POS discounts
const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountType: { type: String, enum: ['Percentage', 'FixedAmount'], required: true },
  discountValue: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

const Sale = mongoose.model('Sale', saleSchema);
const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = { Sale, Coupon };
