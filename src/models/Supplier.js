const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  supplierCode: { type: String, required: true, unique: true, trim: true },
  supplierName: { type: String, required: true, trim: true },
  supplierType: { type: String, default: 'Manufacturer' },
  category: { type: String, default: 'Raw Materials' },
  isActive: { type: Boolean, default: true },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  gstin: { type: String, default: '' },
  pan: { type: String, default: '' },
  companyName: { type: String, default: '' },
  openingBalance: { type: Number, default: 0 },
  address: {
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    street: { type: String, default: '' }
  },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

const Supplier = mongoose.model('Supplier', supplierSchema);

module.exports = { Supplier };
