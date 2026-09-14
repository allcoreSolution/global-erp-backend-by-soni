const mongoose = require('mongoose');

// Brand Schema
const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: '' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

// Category Schema
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: '' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  // Basic Info
  productType: { type: String, default: 'Standard' },
  name: { type: String, required: true, trim: true },
  sku: { type: String, required: true, unique: true, trim: true },
  barcode: { type: String, unique: true, sparse: true },
  barcodeSymbology: { type: String, default: 'Code 128' },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  productUnit: { type: String, default: 'pcs' },
  saleUnit: { type: String },
  purchaseUnit: { type: String },
  
  // Pricing & Stock Strategy
  purchasePrice: { type: Number, required: true, default: 0 }, // Product Cost
  profitMarginType: { type: String, default: 'Percentage (%)' },
  profitMargin: { type: Number, default: 0 },
  salePrice: { type: Number, required: true, default: 0 }, // Product Price
  wholesalePrice: { type: Number, default: 0 },
  minStockLevel: { type: Number, default: 5 }, // Alert Quantity
  dailySaleObjective: { type: Number, default: 0 },
  taxRate: { type: Number, default: 0 }, // Product Tax %
  taxMethod: { type: String, default: 'Exclusive' },
  warrantyMonths: { type: Number, default: 0 },
  guaranteeMonths: { type: Number, default: 0 },
  
  // Properties & Flags
  isFeatured: { type: Boolean, default: false },
  isEmbeddedBarcode: { type: Boolean, default: false },
  currentStock: { type: Number, default: 0 }, // Represents Initial Stock or current stock
  isActive: { type: Boolean, default: true },
  
  // Media & Description
  productImage: { type: String, default: '' },
  productDetails: { type: String, default: '' },
  
  // Advanced Config
  hasVariant: { type: Boolean, default: false },
  hasDifferentPriceInWarehouses: { type: Boolean, default: false },
  hasBatchAndExpiry: { type: Boolean, default: false },
  hasImeiOrSerial: { type: Boolean, default: false },
  promotionalPrice: { type: Number, default: 0 },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

const Brand = mongoose.model('Brand', brandSchema);
const Category = mongoose.model('Category', categorySchema);
const Product = mongoose.model('Product', productSchema);

module.exports = { Brand, Category, Product };
