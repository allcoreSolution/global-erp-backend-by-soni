const mongoose = require('mongoose');

const stockTransferItemSchema = new mongoose.Schema({
  product: { type: String, required: true },
  unit: { type: String, default: '' },
  sourceStock: { type: Number, default: 0 },
  destinationStock: { type: Number, default: 0 },
  qty: { type: Number, required: true, default: 0 }
});

const stockTransferSchema = new mongoose.Schema({
  // Basic Information
  transferNo: { type: String, required: true, trim: true },
  voucherNo: { type: String }, // To bypass legacy duplicate index E11000
  date: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  
  // Location Info
  fromWarehouse: { type: String, required: true },
  toWarehouse: { type: String, required: true },

  // Reference Info
  reference: { type: String, default: '' },
  reason: { type: String, default: '' },
  remarks: { type: String, default: '' },
  totalQty: { type: Number, default: 0 },

  // Tenant / Company Info
  company: { type: String, default: '' },

  // Items
  items: [stockTransferItemSchema]
}, { timestamps: true });

stockTransferSchema.index({ company: 1, transferNo: 1 });

const StockTransfer = mongoose.model('StockTransfer', stockTransferSchema);

module.exports = { StockTransfer };
