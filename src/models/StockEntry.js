const mongoose = require('mongoose');

const stockEntryItemSchema = new mongoose.Schema({
  product: { type: String, required: true }, // Can be an ObjectId ref in the future
  quantity: { type: Number, required: true, min: 0 },
  unit: { type: String, default: 'Nos' },
  batchNo: { type: String, default: '' },
  serialNo: { type: String, default: '' },
  lineReason: { type: String, default: '' }
});

const stockEntrySchema = new mongoose.Schema({
  voucherNo: { type: String, required: true, unique: true, trim: true },
  entryType: { type: String, required: true }, // 'Stock In (+)' or 'Stock Out (-)'
  date: { type: Date, default: Date.now },
  targetWarehouse: { type: String, required: true },
  referenceNo: { type: String, default: '' },
  adjustmentReason: { type: String, required: true },
  remarks: { type: String, default: '' },
  items: [stockEntryItemSchema],
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

const StockEntry = mongoose.model('StockEntry', stockEntrySchema);

module.exports = { StockEntry };
