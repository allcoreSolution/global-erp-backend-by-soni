const mongoose = require('mongoose');

const returnItemSchema = new mongoose.Schema({
  product: { type: String, required: true },
  batch: { type: String, default: '' },
  soldQty: { type: Number, default: 1 },
  returnQty: { type: Number, required: true, default: 1 },
  rate: { type: Number, default: 0 },
  amount: { type: Number, default: 0 },
  reason: { type: String, default: 'Size Issue' },
  condition: { type: String, default: 'Good' }
});

const replacementItemSchema = new mongoose.Schema({
  product: { type: String, required: true },
  batch: { type: String, default: '' },
  qty: { type: Number, required: true, default: 1 },
  unit: { type: String, default: 'PCS' },
  rate: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, default: 0 }
});

const saleExchangeSchema = new mongoose.Schema({
  // Basic Details
  exchangeNo: { type: String, required: true, unique: true },
  exchangeDate: { type: String, required: true },
  exchangeType: { type: String, default: 'Full' },
  company: { type: String, default: '' },
  branch: { type: String, default: '' },
  warehouse: { type: String, default: '' },
  status: { type: String, default: 'Draft' },
  invoiceNo: { type: String, default: '' },
  salesOrder: { type: String, default: '' },
  saleDate: { type: String, default: '' },
  customer: { type: String, default: '' },
  salesperson: { type: String, default: '' },
  paymentMethod: { type: String, default: 'UPI' },
  transactionRef: { type: String, default: '' },
  returnWarehouse: { type: String, default: '' },
  replacementWarehouse: { type: String, default: '' },
  restockItem: { type: Boolean, default: true },
  requestedBy: { type: String, default: '' },
  approvedBy: { type: String, default: '' },
  customerRemarks: { type: String, default: '' },

  // Items
  returnItems: [returnItemSchema],
  replacementItems: [replacementItemSchema],

  // Totals
  totals: {
    returnValue: { type: Number, default: 0 },
    replacementValue: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    additionalPayable: { type: Number, default: 0 }
  }
}, { timestamps: true });

const SaleExchange = mongoose.model('SaleExchange', saleExchangeSchema);

module.exports = { SaleExchange };
