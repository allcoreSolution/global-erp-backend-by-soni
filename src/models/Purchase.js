const mongoose = require('mongoose');
const { Supplier } = require('./Supplier');

// Purchase Schema
const purchaseItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  taxAmount: { type: Number, default: 0 },
  total: { type: Number, required: true }
});

const purchaseSchema = new mongoose.Schema({
  purchaseNo: { type: String, required: true, unique: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  items: [purchaseItemSchema],
  subTotal: { type: Number, required: true },
  taxTotal: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  paymentMode: { type: String, enum: ['Cash', 'Bank Transfer', 'UPI', 'Credit'], default: 'Cash' },
  referenceNo: { type: String, default: '' }, // Invoice from supplier
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = { Supplier, Purchase };
