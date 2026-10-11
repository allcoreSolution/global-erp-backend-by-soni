const mongoose = require('mongoose');
const { Purchase } = require('../models/Purchase');
const { Product, Brand, Category } = require('../models/Product');

// ─────────────────────────────────────────────────────
// HELPER: Product dhundho ya auto-banao, stock update karo (No Transactions - Localhost Safe)
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
        existingBrand = await Brand.findOne({ name: brandId });
      }
      if (!existingBrand) {
        const createdBrands = await Brand.create([{ name: brandId, company: companyId }]);
        existingBrand = createdBrands[0];
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
        const createdCats = await Category.create([{ name: categoryId, company: companyId }]);
        existingCat = createdCats[0];
      }
      categoryId = existingCat._id;
    }

    const createdProds = await Product.create([{
      productName: item.name || 'Unknown Product',
      productCode: autoCode,
      sku: autoCode,
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
    }]);
    dbProduct = createdProds[0];

    console.log(`✅ Auto-created product: ${dbProduct.productName} (${autoCode})`);
  }

  if (!dbProduct) return null; // reverse ke time product na mile toh skip

  // Step 4: Race condition prevent karne ke liye $inc use karo aur direct update karo
  const updateData = { $inc: { currentStock: stockChange } };
  
  if (!isReverse && item.netUnitCost) {
    updateData.$set = { productCost: String(item.netUnitCost) };
  }

  // Update DB directly to prevent race condition lost updates
  await Product.updateOne({ _id: dbProduct._id }, updateData);

  // Update warehouse stock array safely using findOneAndUpdate and array filters
  if (warehouseId) {
    const wid = String(warehouseId);
    // Check if warehouse entry exists
    const hasWarehouse = await Product.findOne({ 
      _id: dbProduct._id, 
      "warehouseStocks.warehouse": wid 
    });

    if (hasWarehouse) {
      await Product.updateOne(
        { _id: dbProduct._id, "warehouseStocks.warehouse": wid },
        { $inc: { "warehouseStocks.$.stock": stockChange } }
      );
    } else if (!isReverse) {
      await Product.updateOne(
        { _id: dbProduct._id },
        { $push: { warehouseStocks: { warehouse: wid, stock: qty } } }
      );
    }
  }

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
      throw new Error('Koi bhi item nahi diya purchase mein!');
    }

    const processedItems = [];
    for (const item of orderItems) {
      const productId = await processStockForItem(item, warehouse, companyId, false);
      processedItems.push({
        ...item,
        product: productId || item.product
      });
    }

    // Calculate total if not provided
    let calculatedTotal = 0;
    processedItems.forEach(item => {
      calculatedTotal += (Number(item.netUnitCost) || 0) * (Number(item.quantity) || 0);
    });
    const finalGrandTotal = Number(req.body.grandTotal) || calculatedTotal;

    // Purchase number generate karo
    const purchaseNo = req.body.referenceNo || `PUR-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const createdPurchases = await Purchase.create([{
      ...req.body,
      orderItems: processedItems,
      purchaseNo: purchaseNo,
      referenceNo: purchaseNo,
      grandTotal: finalGrandTotal,
      company: companyId
    }]);

    const newPurchase = createdPurchases[0];

    // ✅ MUNIM JI KI ENTRY: Supplier ka udhaar (balance) badhao
    if (newPurchase.supplier && newPurchase.paymentStatus !== 'Paid') {
      const { Supplier } = require('../models/Supplier');
      await Supplier.updateOne(
        { _id: newPurchase.supplier },
        { $inc: { balance: finalGrandTotal } }
      );
    }

    res.status(201).json({
      success: true,
      data: createdPurchases[0],
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
    const { supplierName, branchName } = req.query;
    let filter = {};

    if (supplierName) {
      const { Supplier } = require('../models/Supplier');
      const supplierDoc = await Supplier.findOne({ companyName: supplierName });
      if (supplierDoc) {
        filter.supplier = supplierDoc._id;
      } else {
        return res.json({ success: true, data: [] });
      }
    }

    if (branchName) {
      const { Branch } = require('../models/Branch');
      const branchDoc = await Branch.findOne({ name: branchName });
      if (branchDoc) {
        filter.branch = branchDoc._id;
      } else {
        return res.json({ success: true, data: [] });
      }
    }
    
    const purchases = await Purchase.find(filter)
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
// GET SINGLE PURCHASE (For Edit Page)
// ─────────────────────────────────────────────────────
const getPurchaseById = async (req, res, next) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('supplier')
      .populate('warehouse')
      .populate('branch')
      .populate({
        path: 'orderItems.product',
        select: 'productName productCode'
      });

    if (!purchase) {
      res.status(404);
      return next(new Error('Purchase not found'));
    }

    res.json({ success: true, data: purchase });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────
// UPDATE PURCHASE — Basic update
// ─────────────────────────────────────────────────────
const updatePurchase = async (req, res, next) => {
  try {
    const oldPurchase = await Purchase.findById(req.params.id);
    if (!oldPurchase) {
      res.status(404);
      throw new Error('Purchase nahi mili!');
    }

    const { orderItems, warehouse } = req.body;
    const companyId = req.user?.companyId || req.body.company || oldPurchase.company;

    if (!orderItems || orderItems.length === 0) {
      res.status(400);
      throw new Error('Koi bhi item nahi diya edit purchase mein!');
    }

    // 1. REVERSE old stock (subtract from warehouse)
    for (const item of oldPurchase.orderItems) {
      await processStockForItem(item, oldPurchase.warehouse, oldPurchase.company, true);
    }

    // 2. APPLY new stock (add to warehouse)
    const processedItems = [];
    for (const item of orderItems) {
      const productId = await processStockForItem(item, warehouse, companyId, false);
      processedItems.push({
        ...item,
        product: productId || item.product
      });
    }

    // 3. Update Document
    const updatedPurchase = await Purchase.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        orderItems: processedItems,
        company: companyId
      },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: updatedPurchase, message: 'Purchase update ho gayi aur stock adjust ho gaya!' });
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
      throw new Error('Purchase nahi mili!');
    }

    // ✅ Pehle stock REVERSE karo
    for (const item of purchase.orderItems) {
      await processStockForItem(item, purchase.warehouse, purchase.company, true);
    }

    // ✅ MUNIM JI KI ENTRY: Supplier ka udhaar (balance) wapas ghatao
    if (purchase.supplier && purchase.paymentStatus !== 'Paid') {
      const { Supplier } = require('../models/Supplier');
      const purchaseAmount = Number(purchase.grandTotal) || 0;
      await Supplier.updateOne(
        { _id: purchase.supplier },
        { $inc: { balance: -purchaseAmount } }
      );
    }

    // Phir purchase delete karo
    await Purchase.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Purchase delete ho gayi aur stock wapas ho gaya!' });
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
      throw new Error('Import ke liye koi item nahi mila!');
    }

    const processedItems = [];
    for (const item of orderItems) {
      const productId = await processStockForItem(item, warehouse, companyId, false);
      processedItems.push({ ...item, product: productId || item.product });
    }

    const purchaseNo = `IMP-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const newPurchases = await Purchase.create([{
      ...req.body,
      orderItems: processedItems,
      referenceNo: purchaseNo,
      purchaseDate: new Date().toISOString(),
      company: companyId
    }]);

    res.status(201).json({ success: true, data: newPurchases[0], message: 'Purchase import ho gayi!' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addPurchase,
  getPurchases,
  getPurchaseById,
  updatePurchase,
  deletePurchase,
  importPurchase
};
