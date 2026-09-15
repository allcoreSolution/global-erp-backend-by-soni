const { Purchase } = require('../models/Purchase');
const { Product } = require('../models/Product');

// Purchase controllers
const addPurchase = async (req, res, next) => {
  try {
    const { orderItems } = req.body;

    if (!orderItems || orderItems.length === 0) {
      res.status(400);
      return next(new Error('No purchase items provided'));
    }

    // Process and add inventory
    for (const item of orderItems) {
      if (item.code) {
        const dbProduct = await Product.findOne({ code: item.code });
        if (dbProduct) {
          // Add Stock
          dbProduct.currentStock = (dbProduct.currentStock || 0) + Number(item.quantity);
          await dbProduct.save();
        }
      }
    }

    let purchaseNo = req.body.referenceNo;
    if (!purchaseNo) {
      purchaseNo = `PUR-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const newPurchase = await Purchase.create({
      ...req.body,
      referenceNo: purchaseNo,
      company: req.user?.companyId || req.body.company
    });

    res.status(201).json({ success: true, data: newPurchase });
  } catch (error) {
    next(error);
  }
};

const getPurchases = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const purchases = await Purchase.find(query);
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

const importPurchase = async (req, res, next) => {
  try {
    // In a real application, if multer is used, req.file would contain the CSV file.
    // For now, assuming the frontend parses the CSV and sends the items in req.body.orderItems
    // along with the other purchase details.
    
    const { orderItems } = req.body;

    if (!orderItems || orderItems.length === 0) {
      res.status(400);
      return next(new Error('No purchase items provided for import'));
    }

    // Process and add inventory
    for (const item of orderItems) {
      if (item.code) {
        const dbProduct = await Product.findOne({ code: item.code });
        if (dbProduct) {
          // Add Stock
          dbProduct.currentStock = (dbProduct.currentStock || 0) + Number(item.quantity || 1);
          await dbProduct.save();
        }
      }
    }

    let purchaseNo = `IMP-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const newPurchase = await Purchase.create({
      ...req.body,
      referenceNo: purchaseNo,
      purchaseDate: new Date().toISOString(),
      company: req.user?.companyId || req.body.company
    });

    res.status(201).json({ success: true, data: newPurchase, message: 'Purchase imported successfully' });
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
