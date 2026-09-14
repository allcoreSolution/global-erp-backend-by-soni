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
  legalName: { type: String, default: '' },
  contactPerson: { type: String, default: '' },
  phone: { type: String, default: '' },
  alternateMobile: { type: String, default: '' },
  email: { type: String, default: '' },
  website: { type: String, default: '' },
  category: { type: String, default: 'Raw Materials' },
  status: { type: Boolean, default: true },
  
  gstStatus: { type: String, default: 'Registered' },
  gstin: { type: String, default: '' },
  pan: { type: String, default: '' },
  tan: { type: String, default: '' },
  msme: { type: String, default: '' },
  taxPreference: { type: String, default: 'Taxable' },
  tdsApplicable: { type: Boolean, default: false },
  tdsSection: { type: String, default: '' },
  placeOfSupply: { type: String, default: '' },
  
  billingAddress: { type: addressSchema, default: () => ({}) },
  shippingAddress: { type: addressSchema, default: () => ({}) },
  
  contacts: { type: Array, default: [] },
  banks: { type: Array, default: [] },
  
  paymentTerms: { type: String, default: 'Net 30' },
  creditLimit: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  purchasePriceList: { type: String, default: '' },
  defaultWarehouse: { type: String, default: '' },
  deliveryTerms: { type: String, default: '' },
  freightTerms: { type: String, default: '' },
  leadTime: { type: Number, default: 0 },
  moq: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  additionalDiscount: { type: Number, default: 0 },
  priceValidity: { type: String, default: '' },
  purchaseRep: { type: String, default: '' },
  
  products: { type: Array, default: [] },
  
  documents: {
    gstCert: { type: String, default: null },
    panCard: { type: String, default: null },
    msmeCert: { type: String, default: null },
    cheque: { type: String, default: null },
    companyCert: { type: String, default: null },
    agreement: { type: String, default: null },
    other: { type: String, default: null }
  },
  
  performance: {
    supplierRating: { type: Number, default: 0 },
    qualityRating: { type: Number, default: 0 },
    deliveryRating: { type: Number, default: 0 },
    onTimeDelivery: { type: Number, default: 0 },
    rejectionPercent: { type: Number, default: 0 },
    avgDeliveryTime: { type: Number, default: 0 },
    totalPurchase: { type: Number, default: 0 },
    outstandingAmount: { type: Number, default: 0 },
    lastPurchaseDate: { type: String, default: '' }
  },
  
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

const Supplier = mongoose.model('Supplier', supplierSchema);

module.exports = { Supplier };
