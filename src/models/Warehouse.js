const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, default: '' },
  location: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  status: { type: Boolean, default: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' } // Tenant association
}, { timestamps: true });

const Warehouse = mongoose.model('Warehouse', warehouseSchema);

module.exports = { Warehouse };
