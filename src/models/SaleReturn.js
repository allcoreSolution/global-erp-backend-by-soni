const mongoose = require('mongoose');

const saleReturnItemSchema = new mongoose.Schema({
  product: { type: String, required: true },
  condition: { type: String, default: 'Good' },
  quantity: { type: Number, required: true, default: 1 },
  unitPrice: { type: Number, required: true, default: 0 },
  returnTotal: { type: Number, required: true, default: 0 }
});

const saleReturnSchema = new mongoose.Schema({
  returnNumber: { type: String, required: true, unique: true },
  returnDate: { type: String, required: true },
  customerName: { type: String, required: true },
  invoiceNumber: { type: String, required: true },
  returnReason: { type: String, default: 'Defective Product' },
  status: { type: String, default: 'Pending' },
  refundMethod: { type: String, default: 'Original Payment Method' },
  restockingFee: { type: Number, default: 0 },
  totalRefundAmount: { type: Number, default: 0 },
  remarks: { type: String, default: '' },
  items: [saleReturnItemSchema],
  company: { type: String, default: '' }
}, { timestamps: true });

const SaleReturn = mongoose.model('SaleReturn', saleReturnSchema);

module.exports = { SaleReturn };
