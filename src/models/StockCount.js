const mongoose = require('mongoose');

const stockCountSchema = new mongoose.Schema({
  stockCountId: { type: String, required: true, unique: true, trim: true },
  warehouse: { type: String, required: true, trim: true },
  category: { type: String, default: '' },
  brand: { type: String, default: '' },
  stockCountType: { type: String, default: 'Full Count' },
  initialFileName: { type: String, default: '' },
  finalFileName: { type: String, default: '' },
  status: { type: String, default: 'Pending' },
  date: { type: Date, default: Date.now },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

const StockCount = mongoose.model('StockCount', stockCountSchema);

module.exports = { StockCount };
