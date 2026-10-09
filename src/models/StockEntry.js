const mongoose = require('mongoose');

const stockEntryProductSchema = new mongoose.Schema({
  product: { type: String, required: true },
  qty: { type: Number, default: 0 },
  rate: { type: Number, default: 0 }
});

const stockEntrySchema = new mongoose.Schema({
  // Basic Information
  stockNo: { type: String, required: true, unique: true },
  voucherNo: { type: String }, // Required to bypass old MongoDB unique index E11000
  stockDate: { type: String, required: true },
  branch: { type: String, default: '' },
  warehouseBase: { type: String, default: '' },
  stockType: { type: String, default: 'Opening Stock' },
  
  // Remarks
  remarks: { type: String, default: '' },

  // Products
  products: [stockEntryProductSchema],

  // Summary
  summary: {
    totalQty: { type: Number, default: 0 },
    stockValue: { type: Number, default: 0 }
  }
}, { timestamps: true });

const StockEntry = mongoose.model('StockEntry', stockEntrySchema);

module.exports = { StockEntry };
