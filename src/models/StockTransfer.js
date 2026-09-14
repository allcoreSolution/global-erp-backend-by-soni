const mongoose = require('mongoose');

const stockTransferItemSchema = new mongoose.Schema({
  product: { type: String, required: true }, // Can be ObjectId ref
  quantity: { type: Number, required: true, min: 0 },
  unit: { type: String, default: 'Nos' },
  batchNo: { type: String, default: '' },
  serialNo: { type: String, default: '' }
});

const stockTransferSchema = new mongoose.Schema({
  transferNo: { type: String, required: true, unique: true, trim: true },
  date: { type: Date, default: Date.now },
  fromWarehouse: { type: String, required: true },
  toWarehouse: { type: String, required: true },
  shippingReference: { type: String, default: '' },
  transferReason: { type: String, required: true },
  remarks: { type: String, default: '' },
  items: [stockTransferItemSchema],
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

const StockTransfer = mongoose.model('StockTransfer', stockTransferSchema);

module.exports = { StockTransfer };
