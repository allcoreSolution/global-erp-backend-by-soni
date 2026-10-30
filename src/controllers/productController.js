const { Product, Category, Brand, Unit, Adjustment, StockCount } = require('../models/Product');

// Product Controllers
const addProduct = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    const companyId = req.user?.companyId || payload.company;
    
    if (companyId) {
      payload.company = companyId;
    }

    // Auto-resolve Brand
    if (payload.brand && !require('mongoose').Types.ObjectId.isValid(payload.brand)) {
      let b = await Brand.findOne({ name: payload.brand, company: companyId });
      if (!b) b = await Brand.findOne({ name: payload.brand });
      if (!b) b = await Brand.create({ name: payload.brand, company: companyId });
      payload.brand = b._id;
    } else if (!payload.brand) {
      delete payload.brand; // prevent invalid cast
    }

    // Auto-resolve Category
    if (payload.category && !require('mongoose').Types.ObjectId.isValid(payload.category)) {
      let c = await Category.findOne({ name: payload.category, company: companyId });
      if (!c) c = await Category.findOne({ name: payload.category });
      if (!c) c = await Category.create({ name: payload.category, company: companyId });
      payload.category = c._id;
    } else if (!payload.category) {
      delete payload.category; // prevent invalid cast
    }

    // Generate unique SKU if missing (required by DB index)
    if (!payload.sku && payload.productCode) {
      payload.sku = payload.productCode;
    }

    const product = await Product.create(payload);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const products = await Product.find(query).populate('brand category');
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!product) {
      res.status(404);
      return next(new Error('Product not found'));
    }
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      res.status(404);
      return next(new Error('Product not found'));
    }
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};
// Categories Controllers
const addCategory = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (!payload.company) {
      if (req.user?.companyId) payload.company = req.user.companyId;
      else delete payload.company;
    }
    if (!payload.branch) delete payload.branch;
    if (!payload.brand || payload.brand === 'None' || payload.brand === '') {
      payload.brand = null;
    }
    const category = await Category.create(payload);
    const populated = await Category.findById(category._id).populate('brand', 'name status');
    res.status(201).json({ success: true, data: populated || category });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ company: req.user?.companyId })
      .populate('brand', 'name status')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    if (req.body.company === '') delete req.body.company;
    if (req.body.branch === '') delete req.body.branch;
    if (req.body.brand === '' || req.body.brand === 'None' || req.body.brand === null) {
      req.body.brand = null;
    }
    
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('brand', 'name status');
    if (!category) {
      res.status(404);
      return next(new Error('Category not found'));
    }
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      res.status(404);
      return next(new Error('Category not found'));
    }
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Brands Controllers
const addBrand = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (!payload.company) {
      if (req.user?.companyId) payload.company = req.user.companyId;
      else delete payload.company;
    }
    if (!payload.branch) delete payload.branch;
    
    if (payload.realFounder && !payload.founder) {
      payload.founder = payload.realFounder;
    } else if (payload.founder && !payload.realFounder) {
      payload.realFounder = payload.founder;
    }

    const brand = await Brand.create(payload);
    res.status(201).json({ success: true, data: brand });
  } catch (error) {
    next(error);
  }
};

const getBrands = async (req, res, next) => {
  try {
    const brands = await Brand.find({ company: req.user?.companyId });
    res.json({ success: true, data: brands });
  } catch (error) {
    next(error);
  }
};

const updateBrand = async (req, res, next) => {
  try {
    if (req.body.company === '') delete req.body.company;
    if (req.body.branch === '') delete req.body.branch;
    
    if (req.body.realFounder && !req.body.founder) {
      req.body.founder = req.body.realFounder;
    } else if (req.body.founder && !req.body.realFounder) {
      req.body.realFounder = req.body.founder;
    }

    const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!brand) {
      res.status(404);
      return next(new Error('Brand not found'));
    }
    res.json({ success: true, data: brand });
  } catch (error) {
    next(error);
  }
};

const deleteBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) {
      res.status(404);
      return next(new Error('Brand not found'));
    }
    res.json({ success: true, message: 'Brand deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Units Controllers
const addUnit = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (!payload.company) {
      if (req.user?.companyId) payload.company = req.user.companyId;
      else delete payload.company;
    }
    const unit = await Unit.create(payload);
    res.status(201).json({ success: true, data: unit });
  } catch (error) {
    next(error);
  }
};

const getUnits = async (req, res, next) => {
  try {
    const units = await Unit.find({ company: req.user?.companyId });
    res.json({ success: true, data: units });
  } catch (error) {
    next(error);
  }
};

const updateUnit = async (req, res, next) => {
  try {
    if (req.body.company === '') delete req.body.company;

    const unit = await Unit.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!unit) {
      res.status(404);
      return next(new Error('Unit not found'));
    }
    res.json({ success: true, data: unit });
  } catch (error) {
    next(error);
  }
};

const deleteUnit = async (req, res, next) => {
  try {
    const unit = await Unit.findByIdAndDelete(req.params.id);
    if (!unit) {
      res.status(404);
      return next(new Error('Unit not found'));
    }
    res.json({ success: true, message: 'Unit deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Adjustments Controllers
const addAdjustment = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    const companyId = req.user?.companyId || payload.company;
    if (companyId) {
      payload.company = companyId;
    } else {
      delete payload.company;
    }

    if (!payload.reference) {
      payload.reference = `ADJ-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    }
    if (!payload.date) {
      payload.date = new Date().toISOString().split('T')[0];
    }

    let calculatedTotalLoss = 0;
    let calculatedTotalGain = 0;
    let calculatedTotalQty = 0;

    // --- AUTOMATIC STOCK & BATCH SYNC LOGIC ---
    if (payload.items && payload.items.length > 0) {
      for (const item of payload.items) {
        const qty = Math.abs(Number(item.quantity) || 0);
        const isSubtract = item.actionType === 'Subtract';
        const qtyDiff = isSubtract ? -qty : qty;
        calculatedTotalQty += qty;

        const itemCost = Number(item.cost || 0);
        const lineTotal = itemCost * qty;
        item.totalCost = lineTotal;

        if (isSubtract) {
          calculatedTotalLoss += lineTotal;
        } else {
          calculatedTotalGain += lineTotal;
        }

        let product = await Product.findOne({ 
          productCode: item.code, 
          company: companyId 
        });
        if (!product) {
          product = await Product.findOne({ productCode: item.code });
        }

        if (product) {
          // 1. Update overall stock
          product.currentStock = (product.currentStock || 0) + qtyDiff;

          // 2. Update warehouse specific stock
          if (payload.warehouse) {
            if (!product.warehouseStocks) product.warehouseStocks = [];
            const whIndex = product.warehouseStocks.findIndex(ws => ws.warehouse === payload.warehouse);
            
            if (whIndex !== -1) {
              product.warehouseStocks[whIndex].stock = (product.warehouseStocks[whIndex].stock || 0) + qtyDiff;
            } else {
              product.warehouseStocks.push({ warehouse: payload.warehouse, stock: qtyDiff });
            }
          }

          // 3. Update Batch stock if batch is specified
          if (item.batch && product.batches && product.batches.length > 0) {
            const bIndex = product.batches.findIndex(b => b.batchNo === item.batch);
            if (bIndex !== -1) {
              if (product.batches[bIndex].stock !== undefined) {
                product.batches[bIndex].stock = (product.batches[bIndex].stock || 0) + qtyDiff;
              }
              if (product.batches[bIndex].remainingQty !== undefined) {
                product.batches[bIndex].remainingQty = Math.max(0, (product.batches[bIndex].remainingQty || 0) + qtyDiff);
              }
            }
          }
          
          await product.save();
        }
      }
    }

    payload.totalQuantity = calculatedTotalQty;
    payload.totalLossCost = calculatedTotalLoss;
    payload.totalGainCost = calculatedTotalGain;
    payload.netAmount = calculatedTotalLoss - calculatedTotalGain;

    const adjustment = await Adjustment.create(payload);

    // --- AUTO-VOUCHER FOR DAY BOOK / AUDIT LOG (Double Entry) ---
    try {
      const Voucher = require('../models/Voucher');
      const AccountLedger = require('../models/AccountLedger');
      
      if (calculatedTotalLoss > 0) {
        let lossAcc = await AccountLedger.findOne({ accountName: 'Stock Loss & Damage Expense', company: companyId });
        if (!lossAcc) {
          lossAcc = await AccountLedger.create({ accountName: 'Stock Loss & Damage Expense', groupType: 'Expense', balanceType: 'Dr', company: companyId });
        }

        let invAcc = await AccountLedger.findOne({ accountName: 'Inventory / Stock on Hand', company: companyId });
        if (!invAcc) {
          invAcc = await AccountLedger.create({ accountName: 'Inventory / Stock on Hand', groupType: 'Asset', balanceType: 'Dr', company: companyId });
        }

        await Voucher.create({
          voucherNo: `V-${adjustment.reference}`,
          date: payload.date,
          voucherType: 'Journal',
          company: companyId,
          status: 'Posted',
          generalNarration: `Stock Adjustment (${payload.lossType || 'Stock Loss'}) - Ref: ${adjustment.reference} in ${payload.warehouse}`,
          entries: [
            {
              account: lossAcc._id,
              debitAmount: calculatedTotalLoss,
              creditAmount: 0,
              narration: `Stock loss/damage/expiry adjustment`
            },
            {
              account: invAcc._id,
              debitAmount: 0,
              creditAmount: calculatedTotalLoss,
              narration: `Inventory asset reduction`
            }
          ]
        });
      }
    } catch (vErr) {
      console.error("Voucher Auto-posting failed for Adjustment:", vErr);
    }
    // -------------------------------------------------------------

    res.status(201).json({ success: true, data: adjustment });
  } catch (error) {
    next(error);
  }
};

const getAdjustments = async (req, res, next) => {
  try {
    const adjustments = await Adjustment.find({ company: req.user?.companyId }).sort({ createdAt: -1 });
    res.json({ success: true, data: adjustments });
  } catch (error) {
    next(error);
  }
};

// Batch Purchase Inward Details Lookup
const getBatchPurchaseInfo = async (req, res, next) => {
  try {
    const { batchNo, productCode } = req.query;
    if (!batchNo) {
      return res.json({ success: true, data: null });
    }

    const { Purchase } = require('../models/Purchase');
    const query = {
      $or: [
        { 'orderItems.batch': batchNo },
        { 'orderItems.code': productCode, 'orderItems.batch': batchNo }
      ]
    };
    if (req.user?.companyId) {
      query.company = req.user.companyId;
    }

    const purchase = await Purchase.findOne(query).sort({ createdAt: -1 }).populate('supplier', 'name phone');
    if (!purchase) {
      return res.json({ success: true, data: null });
    }

    const matchingItem = purchase.orderItems?.find(it => it.batch === batchNo || (productCode && it.code === productCode));
    res.json({
      success: true,
      data: {
        invoiceNo: purchase.invoiceNo || purchase.billNo || purchase.referenceNo || purchase.purchaseNo || '',
        billNo: purchase.billNo || '',
        purchaseDate: purchase.purchaseDate || '',
        supplierName: purchase.supplier?.name || '',
        cost: matchingItem?.netUnitCost || 0,
        mfgDate: matchingItem?.mfgDate || '',
        expDate: matchingItem?.expDate || ''
      }
    });
  } catch (error) {
    next(error);
  }
};

// Stock Count Controllers
const addStockCount = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (!payload.company && req.user?.companyId) {
      payload.company = req.user.companyId;
    }
    if (!payload.reference) {
      payload.reference = `STK-009${Math.floor(10 + Math.random() * 90)}`;
    }
    const stockCount = await StockCount.create(payload);
    res.status(201).json({ success: true, data: stockCount });
  } catch (error) {
    next(error);
  }
};

const getStockCounts = async (req, res, next) => {
  try {
    const stockCounts = await StockCount.find({ company: req.user?.companyId }).sort({ createdAt: -1 });
    res.json({ success: true, data: stockCounts });
  } catch (error) {
    next(error);
  }
};

const updateStockCount = async (req, res, next) => {
  try {
    const stockCount = await StockCount.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!stockCount) {
      res.status(404);
      return next(new Error('StockCount not found'));
    }
    res.json({ success: true, data: stockCount });
  } catch (error) {
    next(error);
  }
};

const deleteStockCount = async (req, res, next) => {
  try {
    const stockCount = await StockCount.findByIdAndDelete(req.params.id);
    if (!stockCount) {
      res.status(404);
      return next(new Error('StockCount not found'));
    }
    res.json({ success: true, message: 'StockCount deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  addCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  addBrand,
  getBrands,
  updateBrand,
  deleteBrand,
  addUnit,
  getUnits,
  updateUnit,
  deleteUnit,
  addAdjustment,
  getAdjustments,
  getBatchPurchaseInfo,
  addStockCount,
  getStockCounts,
  updateStockCount,
  deleteStockCount
};
