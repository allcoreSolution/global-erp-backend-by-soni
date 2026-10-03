const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  netUnitCost: { type: Number, default: 0 },
  profitMargin: { type: Number, default: 0 },
  profitMarginType: { type: String, default: 'Percentage' },
  productPrice: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  taxPercent: { type: Number, default: 0 },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
});

const purchaseSchema = new mongoose.Schema({
  // Basic Details
  purchaseDate: { type: String, required: true },
  referenceNo: { type: String, default: '' },
  purchaseNo: { type: String, unique: true, sparse: true },

  // ✅ Fixed: Proper ObjectId references (Hierarchy: Company → Branch → Warehouse)
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', default: null },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', default: null },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', default: null },

  // Terms & Status
  paymentTerm: { type: String, default: '30' },
  dueDate: { type: String, default: '' },
  purchaseStatus: { type: String, default: 'Received' },
  paymentStatus: { type: String, default: 'Due' },

  // Currency & Documents
  currency: { type: String, default: 'INR' },
  exchangeRate: { type: String, default: '1' },
  documentFile: { type: String, default: '' },

  // Items
  orderItems: [orderItemSchema],

  // Footer Totals
  orderTax: { type: String, default: 'No Tax' },
  discountValue: { type: Number, default: 0 },
  shippingCost: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  note: { type: String, default: '' },

}, { timestamps: true });

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = { Purchase };
