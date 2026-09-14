const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  zip: { type: String, default: '' }
}, { _id: false });

const historySchema = new mongoose.Schema({
  invoiceNo: { type: String },
  receiptNo: { type: String },
  creditNoteNo: { type: String },
  date: { type: String },
  amount: { type: Number },
  status: { type: String },
  mode: { type: String },
  refNo: { type: String },
  reason: { type: String }
}, { _id: false });

const customerSchema = new mongoose.Schema({
  customerCode: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  ownerName: { type: String, default: '' },
  businessName: { type: String, default: '' },
  type: { type: String, default: 'Retailer' },
  category: { type: String, default: 'Regular' },
  status: { type: Boolean, default: true },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  gstin: { type: String, default: '' },
  pan: { type: String, default: '' },
  
  billingAddress: { type: addressSchema, default: () => ({}) },
  shippingAddress: { type: addressSchema, default: () => ({}) },
  
  salesRep: { type: String, default: '' },
  paymentTerms: { type: String, default: 'Due on Receipt' },
  creditLimit: { type: Number, default: 0 },
  creditPeriod: { type: Number, default: 0 },
  openingBalance: { type: Number, default: 0 },
  balanceType: { type: String, enum: ['Dr', 'Cr', 'Dr (Receivable)', 'Cr (Payable)'], default: 'Dr' },
  priceList: { type: String, default: '' },
  discount: { type: Number, default: 0 },
  taxType: { type: String, default: '' },
  
  territory: { type: String, default: '' },
  warehouseName: { type: String, default: '' },
  warehouseAddress: { type: String, default: '' },
  warehouseCapacity: { type: String, default: '' },
  stockLocation: { type: String, default: '' },
  
  assignedRegion: { type: String, default: '' },
  commission: { type: Number, default: 0 },
  logisticsWarehouse: { type: String, default: '' },
  deliveryVehicle: { type: String, default: '' },
  deliveryPerson: { type: String, default: '' },
  transporter: { type: String, default: '' },
  deliveryCharges: { type: Number, default: 0 },
  
  bankName: { type: String, default: '' },
  bankAccount: { type: String, default: '' },
  bankIfsc: { type: String, default: '' },
  
  salesHistory: [historySchema],
  paymentHistory: [historySchema],
  salesReturnHistory: [historySchema],
  
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

const Customer = mongoose.model('Customer', customerSchema);

module.exports = { Customer };
