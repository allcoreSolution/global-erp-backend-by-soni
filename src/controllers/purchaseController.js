const { Supplier } = require('../models/Supplier');
const { Purchase } = require('../models/Purchase');
const { Product } = require('../models/Product');

// Purchase controllers
const addPurchase = async (req, res, next) => {
  const { supplierId, items, paymentMode, referenceNo } = req.body;

  try {
    if (!items || items.length === 0) {
      res.status(400);
      return next(new Error('No purchase items provided'));
    }

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      res.status(404);
      return next(new Error('Supplier not found'));
    }

    let subTotal = 0;
    let taxTotal = 0;
    const computedItems = [];

    // Process and add inventory
    for (const item of items) {
      const dbProduct = await Product.findById(item.productId);
      if (!dbProduct) {
        res.status(404);
        return next(new Error(`Product not found: ${item.productId}`));
      }

      const itemPrice = item.price || dbProduct.purchasePrice;
      const itemTaxRate = dbProduct.taxRate || 0;
      
      const itemSubtotal = itemPrice * item.quantity;
      const itemTaxAmount = (itemSubtotal * itemTaxRate) / 100;
      const itemGrand = itemSubtotal + itemTaxAmount;

      subTotal += itemSubtotal;
      taxTotal += itemTaxAmount;

      computedItems.push({
        product: dbProduct._id,
        quantity: item.quantity,
        price: itemPrice,
        taxAmount: itemTaxAmount,
        total: itemGrand
      });

      // Add Stock
      dbProduct.currentStock += item.quantity;
      await dbProduct.save();
    }

    const purchaseNo = `PUR-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const newPurchase = await Purchase.create({
      purchaseNo,
      supplier: supplier._id,
      items: computedItems,
      subTotal,
      taxTotal,
      grandTotal: subTotal + taxTotal,
      paymentMode,
      referenceNo
    });

    res.status(201).json({ success: true, data: newPurchase });
  } catch (error) {
    next(error);
  }
};

const getPurchases = async (req, res, next) => {
  try {
    const purchases = await Purchase.find({ company: req.user?.companyId, company: req.user?.companyId }).populate('supplier').populate('items.product');
    res.json({ success: true, data: purchases });
  } catch (error) {
    next(error);
  }
};

const updatePurchase = async (req, res, next) => {
  try {
    const purchase = await Purchase.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
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

const deletePurchase = async (req, res, next) => {
  try {
    const purchase = await Purchase.findByIdAndDelete(req.params.id);
    if (!purchase) {
      res.status(404);
      return next(new Error('Purchase not found'));
    }
    res.json({ success: true, message: 'Purchase deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addPurchase,
  getPurchases,
  updatePurchase,
  deletePurchase
};
