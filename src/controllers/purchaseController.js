const mongoose = require('mongoose');
const { Purchase } = require('../models/Purchase');
const { Product, Brand, Category } = require('../models/Product');

// ─────────────────────────────────────────────────────
// HELPER: Product dhundho ya auto-banao, stock update karo
// ─────────────────────────────────────────────────────
const processStockForItem = async (item, warehouseId, companyId, isReverse = false) => {
  const qty = Number(item.quantity) || 0;
  const stockChange = isReverse ? -qty : qty;

  let dbProduct = null;

  // Step 1: ObjectId se dhundho (agar frontend ne _id bheja)
  if (item.product) {
    dbProduct = await Product.findById(item.product);
  }

  // Step 2: Product code se dhundho
  if (!dbProduct && item.code) {
    dbProduct = await Product.findOne({ productCode: item.code });
  }

  // Step 3: ❌ Product nahi mila → AUTO-CREATE karo (sirf purchase ke time, reverse ke time nahi)
  if (!dbProduct && !isReverse) {
    const autoCode = item.code || `AUTO-${Date.now()}`;
    const autoCost = String(item.netUnitCost || item.cost || 0);
    const autoPrice = String(
      item.productPrice ||
      (parseFloat(autoCost) * 1.25).toFixed(2) // default 25% margin
    );

    // Handle Brand Auto-Create
    let brandId = item.brand || null;
    if (brandId && !mongoose.Types.ObjectId.isValid(brandId)) {
      let existingBrand = await Brand.findOne({ name: brandId, company: companyId });
      if (!existingBrand) {
        // Fallback to searching without company if global, but here we scope to company
        existingBrand = await Brand.findOne({ name: brandId });
      }
      if (!existingBrand) {
        existingBrand = await Brand.create({ name: brandId, company: companyId });
      }
      brandId = existingBrand._id;
    }

    // Handle Category Auto-Create
    let categoryId = item.category || null;
    if (categoryId && !mongoose.Types.ObjectId.isValid(categoryId)) {
      let existingCat = await Category.findOne({ name: categoryId, company: companyId });
      if (!existingCat) {
        existingCat = await Category.findOne({ name: categoryId });
      }
      if (!existingCat) {
        existingCat = await Category.create({ name: categoryId, company: companyId });
      }
      categoryId = existingCat._id;
    }

    dbProduct = await Product.create({
      productName: item.name || 'Unknown Product',
      productCode: autoCode,
      sku: autoCode, // Set unique sku to avoid duplicate null errors
      productCost: autoCost,
      productPrice: autoPrice,
      hsnNumber: item.hsnNumber || '',
      brand: brandId,
      category: categoryId,
      warrantyValue: item.warrantyValue || null,
      warrantyUnit: item.warrantyUnit || 'Months',
      guaranteeValue: item.guaranteeValue || null,
      guaranteeUnit: item.guaranteeUnit || 'Months',
      alertQuantity: item.alertQuantity || 0,
      currentStock: 0,
      warehouseStocks: [],
      isActive: true,
      company: companyId || null
    });

    console.log(`✅ Auto-created product: ${dbProduct.productName} (${autoCode})`);
  }

  if (!dbProduct) return null; // reverse ke time product na mile toh skip

  // Step 4: currentStock update karo
  dbProduct.currentStock = Math.max(0, (dbProduct.currentStock || 0) + stockChange);

  // Step 5: warehouseStocks update karo (warehouse-wise tracking)
  if (warehouseId) {
    const wid = String(warehouseId);
    const whEntry = dbProduct.warehouseStocks.find(w => String(w.warehouse) === wid);
    if (whEntry) {
      whEntry.stock = Math.max(0, (whEntry.stock || 0) + stockChange);
    } else if (!isReverse) {
      dbProduct.warehouseStocks.push({ warehouse: wid, stock: qty });
    }
  }

  // Step 6: Cost price update karo (latest purchase price se)
  if (!isReverse && item.netUnitCost) {
    dbProduct.productCost = String(item.netUnitCost);
  }

  await dbProduct.save();
  return dbProduct._id; // product ka ObjectId return karo
};

// ─────────────────────────────────────────────────────
// ADD PURCHASE — Maal aaya, stock badho, product auto-bano
// ─────────────────────────────────────────────────────
const addPurchase = async (req, res, next) => {
  try {
    const { orderItems, warehouse, branch } = req.body;
    const companyId = req.user?.companyId || req.body.company;

    if (!orderItems || orderItems.length === 0) {
      res.status(400);
      return next(new Error('Koi bhi item nahi diya purchase mein!'));
    }

    // Har item ke liye stock update + auto-create
    const processedItems = [];
    for (const item of orderItems) {
      const productId = await processStockForItem(item, warehouse, companyId, false);
      processedItems.push({
        ...item,
        product: productId || item.product // auto-created product ka ID lagao
      });
    }

    // Purchase number generate karo
    const purchaseNo = req.body.referenceNo ||
      `PUR-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    // Purchase record save karo
    const newPurchase = await Purchase.create({
      ...req.body,
      orderItems: processedItems,
      purchaseNo: purchaseNo,
      referenceNo: purchaseNo,
      company: companyId
    });

    res.status(201).json({
      success: true,
      data: newPurchase,
      message: `Purchase saved! ${processedItems.length} item(s) ka stock update ho gaya.`
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────
// GET PURCHASES — Saari purchases dikhao
// ─────────────────────────────────────────────────────
const getPurchases = async (req, res, next) => {
  try {
    const purchases = await Purchase.find()
      .populate('warehouse', 'name code')
      .populate('branch', 'name')
      .populate('supplier', 'companyName supplierCode phone')
      .populate({
        path: 'orderItems.product',
        select: 'productName productCode currentStock brand category',
        populate: [
          { path: 'brand', select: 'name' },
          { path: 'category', select: 'name' }
        ]
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: purchases });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────
// UPDATE PURCHASE — Basic update (stock changes nahi)
// ─────────────────────────────────────────────────────
const updatePurchase = async (req, res, next) => {
  try {
    const purchase = await Purchase.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!purchase) {
      res.status(404);
      return next(new Error('Purchase nahi mili!'));
    }
    res.json({ success: true, data: purchase });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────
// DELETE PURCHASE — Stock wapas karo phir delete karo
// ─────────────────────────────────────────────────────
const deletePurchase = async (req, res, next) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) {
      res.status(404);
      return next(new Error('Purchase nahi mili!'));
    }

    // ✅ Pehle stock REVERSE karo
    for (const item of purchase.orderItems) {
      await processStockForItem(item, purchase.warehouse, purchase.company, true);
    }

    // Phir purchase delete karo
    await Purchase.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Purchase delete ho gayi aur stock wapas ho gaya!'
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────
// IMPORT PURCHASE (CSV se)
// ─────────────────────────────────────────────────────
const importPurchase = async (req, res, next) => {
  try {
    const { orderItems, warehouse } = req.body;
    const companyId = req.user?.companyId || req.body.company;

    if (!orderItems || orderItems.length === 0) {
      res.status(400);
      return next(new Error('Import ke liye koi item nahi mila!'));
    }

    const processedItems = [];
    for (const item of orderItems) {
      const productId = await processStockForItem(item, warehouse, companyId, false);
      processedItems.push({ ...item, product: productId || item.product });
    }

    const purchaseNo = `IMP-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const newPurchase = await Purchase.create({
      ...req.body,
      orderItems: processedItems,
      referenceNo: purchaseNo,
      purchaseDate: new Date().toISOString(),
      company: companyId
    });

    res.status(201).json({
      success: true,
      data: newPurchase,
      message: 'Purchase import ho gayi!'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addPurchase,
  getPurchases,
  updatePurchase,
  deletePurchase,
  importPurchase
};


