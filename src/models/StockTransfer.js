const mongoose = require('mongoose');

const stockTransferItemSchema = new mongoose.Schema({
  product: { type: String, required: true },
  qty: { type: Number, required: true, default: 0 },
  unit: { type: String, default: 'Nos' },
  batch: { type: String, default: '' },
  serial: { type: String, default: '' }
});

const stockTransferSchema = new mongoose.Schema({
  // Basic Information
  transferNo: { type: String, required: true, unique: true },
  date: { type: String, required: true },
  company: { type: String, default: '' },
  status: { type: String, default: 'Pending' },
  
  // Location Info
  fromWarehouse: { type: String, required: true },
  toWarehouse: { type: String, required: true },

  // Reference Info
  reference: { type: String, default: '' },
  reason: { type: String, default: '' },
  remarks: { type: String, default: '' },

  // Items
  items: [stockTransferItemSchema]
}, { timestamps: true });

const StockTransfer = mongoose.model('StockTransfer', stockTransferSchema);

module.exports = { StockTransfer };
