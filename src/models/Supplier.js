const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street1: { type: String, default: '' },
  street2: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  zip: { type: String, default: '' },
  country: { type: String, default: '' }
}, { _id: false });

const supplierSchema = new mongoose.Schema({
  supplierCode: { type: String, required: true, unique: true, trim: true },
  type: { type: String, default: 'Manufacturer' },
  companyName: { type: String, required: true, trim: true },
  contactPerson: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  category: { type: String, default: 'Raw Materials' },
  status: { type: Boolean, default: true },
  
  gstStatus: { type: String, default: 'Registered' },
  gstin: { type: String, default: '' },
  pan: { type: String, default: '' },
  taxPreference: { type: String, default: 'Taxable' },
  tdsApplicable: { type: Boolean, default: false },
  
  billingAddress: { type: addressSchema, default: () => ({}) },
  shippingAddress: { type: addressSchema, default: () => ({}) },
  
  banks: { type: Array, default: [] },
  
  paymentTerms: { type: String, default: 'Net 30' },
  creditLimit: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  purchasePriceList: { type: String, default: '' },
  discount: { type: Number, default: 0 },
  additionalDiscount: { type: Number, default: 0 },
  
  documents: {
    gstCert: { type: String, default: null },
    panCard: { type: String, default: null },
    cheque: { type: String, default: null },
    hsnCode: { type: String, default: null },
    other: { type: String, default: null }
  },
  
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

const Supplier = mongoose.model('Supplier', supplierSchema);

module.exports = { Supplier };
