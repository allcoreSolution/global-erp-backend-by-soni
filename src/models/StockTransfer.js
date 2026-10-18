const mongoose = require('mongoose');

const stockTransferItemSchema = new mongoose.Schema({
  product: { type: String, required: true },
  qty: { type: Number, required: true, default: 0 }
});

const stockTransferSchema = new mongoose.Schema({
  // Basic Information
  transferNo: { type: String, required: true, unique: true },
  voucherNo: { type: String }, // To bypass legacy duplicate index E11000
  date: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  
  // Location Info
  fromWarehouse: { type: String, required: true },
  toWarehouse: { type: String, required: true },

  // Reference Info
  remarks: { type: String, default: '' },

  // Items
  items: [stockTransferItemSchema]
}, { timestamps: true });

const StockTransfer = mongoose.model('StockTransfer', stockTransferSchema);

module.exports = { StockTransfer };
