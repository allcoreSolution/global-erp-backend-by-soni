const mongoose = require('mongoose');

const returnItemSchema = new mongoose.Schema({
  product: { type: String, required: true },
  batch: { type: String, default: '' },
  purchasedQty: { type: Number, default: 0 },
  returnQty: { type: Number, required: true, default: 1 },
  rate: { type: Number, default: 0 },
  taxPercent: { type: Number, default: 0 },
  amount: { type: Number, default: 0 }
});

const purchaseReturnSchema = new mongoose.Schema({
  // Basic Details
  returnNo: { type: String, required: true, unique: true },
  returnDate: { type: String, required: true },
  returnType: { type: String, default: 'Partial' },
  company: { type: String, default: '' },
  branch: { type: String, default: '' },
  warehouse: { type: String, default: '' },
  status: { type: String, default: 'Draft' },

  // Purchase Ref Info
  purchaseInvoice: { type: String, default: '' },
  purchaseOrder: { type: String, default: '' },
  purchaseDate: { type: String, default: '' },
  supplier: { type: String, default: '' },
  supplierInvoiceNo: { type: String, default: '' },
  grnNo: { type: String, default: '' },

  // Logistics & Dispatch
  returnWarehouse: { type: String, default: '' },
  dispatchDate: { type: String, default: '' },
  transporter: { type: String, default: '' },
  vehicleNo: { type: String, default: '' },
  lrNo: { type: String, default: '' },
  stockAdjustment: { type: Boolean, default: true },

  // Accounting (Debit Note)
  debitNoteNo: { type: String, default: '' },
  settlementType: { type: String, default: 'Credit Note' },
  adjustAgainstInvoice: { type: Boolean, default: false },
  supplierRefund: { type: Boolean, default: false },

  // Authorisation & Extra
  requestedBy: { type: String, default: '' },
  approvedBy: { type: String, default: '' },
  remarks: { type: String, default: '' },
  returnReason: { type: String, default: 'Damaged Goods' },
  itemCondition: { type: String, default: 'Damaged' },

  // Items
  items: [returnItemSchema],

  // Totals
  totals: {
    goodsValue: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    returnTotal: { type: Number, default: 0 }
  }
}, { timestamps: true });

const PurchaseReturn = mongoose.model('PurchaseReturn', purchaseReturnSchema);

module.exports = { PurchaseReturn };
