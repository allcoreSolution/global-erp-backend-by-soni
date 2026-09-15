const mongoose = require('mongoose');

const stockEntryProductSchema = new mongoose.Schema({
  product: { type: String, required: true },
  sku: { type: String, default: '' },
  batch: { type: String, default: '' },
  expiry: { type: String, default: '' },
  qty: { type: Number, default: 0 },
  rate: { type: Number, default: 0 }
});

const stockEntrySchema = new mongoose.Schema({
  // Basic Information
  stockNo: { type: String, required: true, unique: true },
  stockDate: { type: String, required: true },
  company: { type: String, default: '' },
  branch: { type: String, default: '' },
  warehouseBase: { type: String, default: '' },
  stockType: { type: String, default: 'Opening Stock' },
  
  // Location
  locationWarehouse: { type: String, default: '' },
  rack: { type: String, default: '' },
  bin: { type: String, default: '' },

  // Reference
  supplier: { type: String, default: '' },
  poNo: { type: String, default: '' },
  invoiceNo: { type: String, default: '' },
  
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
