const mongoose = require('mongoose');

// Brand Schema
const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  image: { type: String, default: '' },
  description: { type: String, default: '' },
  status: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  branch: { type: String, default: '' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

// Category Schema
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  parent: { type: String, default: 'None' },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  status: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
  numProducts: { type: Number, default: 0 },
  stockQty: { type: Number, default: 0 },
  worthPrice: { type: Number, default: 0 },
  worthCost: { type: Number, default: 0 },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

// Unit Schema
const unitSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  baseUnit: { type: String, default: 'None' },
  operator: { type: String, default: 'None' },
  operationValue: { type: String, default: '1' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

// Adjustment Schema
const adjustmentSchema = new mongoose.Schema({
  warehouse: { type: String, required: true },
  documentName: { type: String, default: null },
  items: [{
    name: { type: String },
    code: { type: String },
    cost: { type: Number },
    quantity: { type: Number }
  }],
  note: { type: String, default: '' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

// StockCount Schema
const stockCountSchema = new mongoose.Schema({
  date: { type: String },
  reference: { type: String },
  warehouse: { type: String },
  category: { type: String },
  brand: { type: String },
  type: { type: String, default: 'Full Stock Count' },
  initialFile: { type: String },
  finalFile: { type: String },
  rack: { type: String },
  countedBy: { type: String },
  verifiedBy: { type: String },
  countingDateTime: { type: String },
  remarks: { type: String },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  // Basic Info
  productType: { type: String, default: 'Standard' },
  productName: { type: String, required: true, trim: true },
  productCode: { type: String, required: true, unique: true, trim: true },
  barcodeSymbology: { type: String, default: 'Code 128' },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  productUnit: { type: String, default: '' },
  saleUnit: { type: String, default: '' },
  purchaseUnit: { type: String, default: '' },
  
  // Pricing & Stock Strategy
  productCost: { type: String, default: '0' },
  profitMarginType: { type: String, default: 'Percentage (%)' },
  profitMargin: { type: String, default: '0' },
  productPrice: { type: String, default: '0' },
  wholesalePrice: { type: String, default: '0' },
  dailySaleObjective: { type: String, default: '0' },
  alertQuantity: { type: String, default: '0' },
  productTax: { type: String, default: 'No Tax' },
  taxMethod: { type: String, default: 'Exclusive' },
  warrantyValue: { type: String, default: '' },
  warrantyUnit: { type: String, default: 'Months' },
  guaranteeValue: { type: String, default: '' },
  guaranteeUnit: { type: String, default: 'Months' },
  
  // Properties & Flags
  isFeatured: { type: Boolean, default: false },
  isEmbeddedBarcode: { type: Boolean, default: false },
  hasInitialStock: { type: Boolean, default: false },
  initialStockQty: { type: String, default: '' },
  initialStockWarehouse: { type: String, default: '' },
  currentStock: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  
  // Media & Description
  productImage: { type: String, default: '' },
  productDetails: { type: String, default: '' },
  
  // Advanced Config
  hasVariant: { type: Boolean, default: false },
  hasDifferentPricePerWarehouse: { type: Boolean, default: false },
  hasBatchAndExpiry: { type: Boolean, default: false },
  hasImeiOrSerial: { type: Boolean, default: false },
  hasPromoPrice: { type: Boolean, default: false },
  
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

const Brand = mongoose.model('Brand', brandSchema);
const Category = mongoose.model('Category', categorySchema);
const Unit = mongoose.model('Unit', unitSchema);
const Adjustment = mongoose.model('Adjustment', adjustmentSchema);
const StockCount = mongoose.model('StockCount', stockCountSchema);
const Product = mongoose.model('Product', productSchema);

module.exports = { Brand, Category, Unit, Adjustment, StockCount, Product };
