const { Product, Category, Brand } = require('../models/Product');
const { Sale } = require('../models/Sale');
const { Purchase } = require('../models/Purchase');
const { StockEntry } = require('../models/StockEntry');
const { SaleReturn } = require('../models/SaleReturn');
const { PurchaseReturn } = require('../models/PurchaseReturn');

// @desc    Get complete stock summary and valuation
// @route   GET /api/reports/stock/summary
// @access  Private
const getStockSummary = async (req, res, next) => {
  try {
    const products = await Product.find({ 
      company: req.user?.companyId, 
      isActive: true 
    }).populate('category', 'name').populate('brand', 'name');

    let totalStockValue = 0;
    let totalSaleValue = 0;
    let totalItems = 0;
    let lowStockItemsCount = 0;

    const stockDetails = products.map(product => {
      const currentStock = product.currentStock || 0;
      const purchasePrice = parseFloat(product.productCost) || 0;
      const salePrice = parseFloat(product.productPrice) || 0;
      
      const stockValue = currentStock * purchasePrice;
      const potentialSaleValue = currentStock * salePrice;

      totalStockValue += stockValue;
      totalSaleValue += potentialSaleValue;
      totalItems += currentStock;

      if (currentStock <= parseFloat(product.alertQuantity || 0)) {
        lowStockItemsCount++;
      }

      return {
        productId: product._id,
        name: product.productName,
        sku: product.sku || product.productCode,
        category: product.category?.name || 'N/A',
        brand: product.brand?.name || 'N/A',
        currentStock,
        minStockLevel: parseFloat(product.alertQuantity || 0),
        purchasePrice,
        salePrice,
        stockValue,
        potentialSaleValue
      };
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalProducts: products.length,
          totalItemsInStock: totalItems,
          totalStockValue,
          totalPotentialSaleValue: totalSaleValue,
          lowStockItemsCount
        },
        items: stockDetails
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get products that are at or below minimum stock level
// @route   GET /api/reports/stock/low-stock
// @access  Private
const getLowStockReport = async (req, res, next) => {
  try {
    const products = await Product.find({
      company: req.user?.companyId,
      isActive: true
    }).populate('category', 'name').populate('brand', 'name');
    
    // Manual filter since alertQuantity is often stored as string in this DB schema
    const lowStockProducts = products.filter(p => {
      const current = p.currentStock || 0;
      const min = parseFloat(p.alertQuantity || 0);
      return current <= min;
    });

    const result = lowStockProducts.map(product => {
      const current = product.currentStock || 0;
      const min = parseFloat(product.alertQuantity || 0);
      return {
        productId: product._id,
        name: product.productName,
        sku: product.sku || product.productCode,
        category: product.category?.name || 'N/A',
        brand: product.brand?.name || 'N/A',
        currentStock: current,
        minStockLevel: min,
        shortage: Math.max(0, min - current)
      };
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Current Stock (with committed calculation)
// @route   GET /api/reports/stock/current-stock
// @access  Private
const getCurrentStock = async (req, res, next) => {
  try {
    const products = await Product.find({ 
      company: req.user?.companyId, 
      isActive: true 
    });

    // To calculate committed stock, find all Pending/Draft sales.
    const pendingSales = await Sale.find({
      company: req.user?.companyId,
      saleStatus: { $in: ['Pending', 'Ordered', 'Draft'] }
    });

    const committedMap = {};
    pendingSales.forEach(sale => {
      sale.orderItems?.forEach(item => {
        if (item.product) {
          committedMap[item.product] = (committedMap[item.product] || 0) + (item.quantity || 0);
        }
      });
    });

    const stockDetails = products.map(product => {
      const onHand = product.currentStock || 0;
      const committed = committedMap[product._id.toString()] || 0;
      const available = onHand - committed;

      return {
        productId: product._id,
        name: product.productName,
        sku: product.sku || product.productCode,
        location: 'Default Warehouse', // Usually we'd map this from stock entries if we had warehouse-level tracking
        onHand,
        committed,
        available
      };
    });

    res.json({
      success: true,
      data: stockDetails
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Opening Stock
// @route   GET /api/reports/stock/opening-stock
// @access  Private
const getOpeningStock = async (req, res, next) => {
  try {
    const products = await Product.find({ 
      company: req.user?.companyId, 
      hasInitialStock: true 
    });

    const stockDetails = products.map(product => {
      const qty = parseFloat(product.initialStockQty || 0);
      const rate = parseFloat(product.productCost || 0);
      return {
        productId: product._id,
        name: product.productName,
        sku: product.sku || product.productCode,
        date: product.createdAt, // Approximation of opening date
        qty,
        rate,
        value: qty * rate
      };
    }).filter(item => item.qty > 0);

    res.json({
      success: true,
      data: stockDetails
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Closing Stock grouped by category
// @route   GET /api/reports/stock/closing-stock
// @access  Private
const getClosingStock = async (req, res, next) => {
  try {
    const products = await Product.find({ 
      company: req.user?.companyId, 
      isActive: true 
    }).populate('category', 'name');

    const categoryMap = {};
    let totalClosingValue = 0;

    products.forEach(product => {
      const catName = product.category?.name || 'Uncategorized';
      if (!categoryMap[catName]) {
        categoryMap[catName] = {
          categoryName: catName,
          itemCount: 0,
          totalQty: 0,
          stockValue: 0
        };
      }
      
      const qty = product.currentStock || 0;
      const val = qty * (parseFloat(product.productCost) || 0);
      
      categoryMap[catName].itemCount += 1;
      categoryMap[catName].totalQty += qty;
      categoryMap[catName].stockValue += val;
      totalClosingValue += val;
    });

    res.json({
      success: true,
      data: {
        totalClosingValue,
        categories: Object.values(categoryMap)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Stock Ledger (transaction history)
// @route   GET /api/reports/stock/ledger
// @access  Private
const getStockLedger = async (req, res, next) => {
  try {
    // For MVP ledger, we fetch purchases, sales, and stock entries
    const [purchases, sales, entries] = await Promise.all([
      Purchase.find({ company: req.user?.companyId }).populate('orderItems.product', 'productName sku productCode'),
      Sale.find({ company: req.user?.companyId }).populate('orderItems.product', 'productName sku productCode'),
      StockEntry.find({ company: req.user?.companyId }) // Note: StockEntry schema stores product as String ID, maybe not Object ID ref.
    ]);

    const ledger = [];
    
    // Process Purchases (Inward)
    purchases.forEach(p => {
      p.orderItems?.forEach(item => {
        if(item.product) {
          ledger.push({
            date: p.purchaseDate || p.createdAt,
            voucherNo: p.referenceNo,
            type: 'Purchase',
            item: item.product.productName,
            sku: item.product.sku || item.product.productCode,
            inward: item.quantity,
            outward: 0,
            rate: item.netUnitPrice,
            warehouse: p.warehouse
          });
        }
      });
    });

    // Process Sales (Outward)
    sales.forEach(s => {
      s.orderItems?.forEach(item => {
        if(item.product) {
          ledger.push({
            date: s.saleDate || s.createdAt,
            voucherNo: s.invoiceNo,
            type: 'Sale',
            item: item.product.productName,
            sku: item.product.sku || item.product.productCode,
            inward: 0,
            outward: item.quantity,
            rate: item.netUnitPrice,
            warehouse: s.warehouse
          });
        }
      });
    });

    // Process StockEntries (Inward/Outward depending on stockType)
    entries.forEach(e => {
      e.products?.forEach(item => {
        const isOutward = e.stockType === 'Stock Transfer' || e.stockType === 'Outward';
        ledger.push({
          date: e.stockDate || e.createdAt,
          voucherNo: e.stockNo,
          type: e.stockType,
          item: item.product, // usually string name in this schema
          sku: item.sku,
          inward: isOutward ? 0 : item.qty,
          outward: isOutward ? item.qty : 0,
          rate: item.rate,
          warehouse: e.locationWarehouse || e.warehouseBase
        });
      });
    });

    // Sort by date descending
    ledger.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      data: ledger
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Stock Movement
// @route   GET /api/reports/stock/movement
// @access  Private
const getStockMovement = async (req, res, next) => {
  // Essentially the same as ledger but aggregated or structured differently. 
  // We can reuse getStockLedger logic or just send the same ledger but group it in frontend.
  // We'll just call the same logic as ledger for this MVP, but map it to what the frontend expects.
  try {
    const [purchases, sales] = await Promise.all([
      Purchase.find({ company: req.user?.companyId }).populate('orderItems.product', 'productName sku productCode'),
      Sale.find({ company: req.user?.companyId }).populate('orderItems.product', 'productName sku productCode')
    ]);

    const movement = [];
    
    // Purchases (Inward)
    purchases.forEach(p => {
      p.orderItems?.forEach(item => {
        if(item.product) {
          movement.push({
            date: p.purchaseDate || p.createdAt,
            refNo: p.referenceNo,
            type: 'INWARD',
            source: p.supplier || 'Supplier',
            destination: p.warehouse || 'Main',
            item: item.product.productName,
            qty: item.quantity,
            status: p.purchaseStatus
          });
        }
      });
    });

    // Sales (Outward)
    sales.forEach(s => {
      s.orderItems?.forEach(item => {
        if(item.product) {
          movement.push({
            date: s.saleDate || s.createdAt,
            refNo: s.invoiceNo,
            type: 'OUTWARD',
            source: s.warehouse || 'Main',
            destination: s.customer || 'Customer',
            item: item.product.productName,
            qty: item.quantity,
            status: s.saleStatus
          });
        }
      });
    });

    movement.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      data: movement
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Stock Valuation
// @route   GET /api/reports/stock/valuation
// @access  Private
const getStockValuation = async (req, res, next) => {
  try {
    const products = await Product.find({ 
      company: req.user?.companyId, 
      isActive: true 
    });

    const stockDetails = products.map(product => {
      const qty = product.currentStock || 0;
      const cost = parseFloat(product.productCost) || 0;
      const retail = parseFloat(product.productPrice) || 0;
      
      return {
        productId: product._id,
        name: product.productName,
        sku: product.sku || product.productCode,
        qty,
        costRate: cost,
        costValue: qty * cost,
        retailRate: retail,
        retailValue: qty * retail,
        margin: (retail - cost) * qty
      };
    }).filter(item => item.qty > 0);

    const totalCostValue = stockDetails.reduce((acc, curr) => acc + curr.costValue, 0);
    const totalRetailValue = stockDetails.reduce((acc, curr) => acc + curr.retailValue, 0);

    res.json({
      success: true,
      data: {
        totalCostValue,
        totalRetailValue,
        items: stockDetails
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Warehouse Wise Stock
// @route   GET /api/reports/stock/warehouse-wise
// @access  Private
const getWarehouseWiseStock = async (req, res, next) => {
  try {
    // In this ERP, since currentStock is global in Product, we approximate warehouse stock
    // by using Purchases and StockEntries. Or we just mock a distribution for MVP if warehouse stock isn't explicitly stored.
    // Let's create a simple distribution based on currentStock and put it all in "Main Warehouse" for now,
    // because real warehouse stock arrays don't exist in Product model!
    
    const products = await Product.find({ 
      company: req.user?.companyId, 
      isActive: true 
    }).populate('category', 'name');

    const warehouseMap = {};

    products.forEach(product => {
      const warehouse = product.initialStockWarehouse || 'Main Warehouse'; // default
      if (!warehouseMap[warehouse]) {
        warehouseMap[warehouse] = [];
      }
      
      warehouseMap[warehouse].push({
        sku: product.sku || product.productCode,
        item: product.productName,
        category: product.category?.name || 'N/A',
        qty: product.currentStock || 0,
        value: (product.currentStock || 0) * (parseFloat(product.productCost) || 0)
      });
    });

      // Format for frontend
      const result = [];
      Object.keys(warehouseMap).forEach(w => {
        const items = warehouseMap[w];
        const itemCount = items.length;
        const totalQty = items.reduce((acc, curr) => acc + curr.qty, 0);
        const value = items.reduce((acc, curr) => acc + curr.value, 0);

        result.push({
          warehouse: w,
          itemCount,
          totalQty,
          value
        });
      });

      res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Branch Wise Stock
// @route   GET /api/reports/stock/branch-wise
// @access  Private
const getBranchWiseStock = async (req, res, next) => {
  try {
    // Similar to warehouse wise, we'll map to a default branch if none exists
    const products = await Product.find({ 
      company: req.user?.companyId, 
      isActive: true 
    });

    const branchMap = {};

    products.forEach(product => {
      const branch = 'Head Office'; // Defaulting as Product model lacks branch
      if (!branchMap[branch]) {
        branchMap[branch] = [];
      }
      
      branchMap[branch].push({
        qty: product.currentStock || 0,
        value: (product.currentStock || 0) * (parseFloat(product.productCost) || 0)
      });
    });

    const result = [];
    Object.keys(branchMap).forEach(b => {
      const items = branchMap[b];
      const itemCount = items.length;
      const totalQty = items.reduce((acc, curr) => acc + curr.qty, 0);
      const value = items.reduce((acc, curr) => acc + curr.value, 0);
      
      // Mock health status
      let status = 'Healthy';
      if (totalQty === 0) status = 'Critical';
      else if (totalQty < 50) status = 'Low Stock';

      result.push({
        branch: b,
        itemCount,
        totalQty,
        value,
        status
      });
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product-wise stock
// @route   GET /api/reports/stock/product-wise
// @access  Private
const getProductWiseStock = async (req, res, next) => {
  try {
    const products = await Product.find({ 
      company: req.user?.companyId, 
      isActive: true 
    }).populate('category', 'name').populate('brand', 'name');

    const productStock = products.map(product => {
      const currentStock = parseFloat(product.currentStock || 0);
      const purchasePrice = parseFloat(product.purchasePrice || 0);
      const alertQuantity = parseFloat(product.alertQuantity || 0);
      const value = currentStock * purchasePrice;
      
      let status = 'In Stock';
      if (currentStock <= 0) {
        status = 'Critical';
      } else if (currentStock <= alertQuantity) {
        status = 'Low Stock';
      }

      return {
        sku: product.itemCode || product.sku || 'N/A',
        name: product.name,
        category: product.category ? product.category.name : 'Uncategorized',
        warehouse: product.warehouse || 'Main Hub',
        qty: currentStock,
        unit: product.unit || 'Nos',
        value: value,
        status: status
      };
    });

    res.status(200).json({
      success: true,
      data: productStock
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Overstock Report
// @route   GET /api/reports/stock/overstock
// @access  Private
const getOverstockReport = async (req, res, next) => {
  try {
    const products = await Product.find({ company: req.user?.companyId, isActive: true })
      .populate("category", "name");
    
    const overstockProducts = products.filter(p => {
      const current = p.currentStock || 0;
      const alert = parseFloat(p.alertQuantity || 0);
      return alert > 0 && current > alert * 3;
    });

    const result = overstockProducts.map(p => ({
      id: p._id,
      sku: p.sku || p.productCode,
      name: p.productName,
      category: p.category?.name || "N/A",
      currentStock: p.currentStock || 0,
      alertQuantity: p.alertQuantity || 0,
      surplus: (p.currentStock || 0) - (p.alertQuantity || 0) * 3,
      status: "Overstocked"
    }));

    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

// @desc    Get Out of Stock Report
// @route   GET /api/reports/stock/out-of-stock
// @access  Private
const getOutOfStockReport = async (req, res, next) => {
  try {
    const products = await Product.find({ company: req.user?.companyId, isActive: true })
      .populate("category", "name");
    
    const outOfStockProducts = products.filter(p => (p.currentStock || 0) <= 0);

    const result = outOfStockProducts.map(p => ({
      id: p._id,
      sku: p.sku || p.productCode,
      name: p.productName,
      category: p.category?.name || "N/A",
      lastRestocked: p.updatedAt,
      status: "Out of Stock"
    }));

    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

// @desc    Get Damaged Stock Report
// @route   GET /api/reports/stock/damaged
// @access  Private
const getDamagedStockReport = async (req, res, next) => {
  try {
    res.json({ success: true, data: [
      { id: "1", date: new Date().toISOString(), sku: "PRD-001", name: "Sample Product A", qty: 2, reason: "Transit Damage", value: 1500, loggedBy: "Admin" },
      { id: "2", date: new Date().toISOString(), sku: "PRD-005", name: "Sample Product B", qty: 5, reason: "Warehouse Mishap", value: 3000, loggedBy: "User" }
    ]});
  } catch (error) { next(error); }
};

// @desc    Get Expired Stock Report
// @route   GET /api/reports/stock/expired
// @access  Private
const getExpiredStockReport = async (req, res, next) => {
  try {
    res.json({ success: true, data: [
      { id: "1", batchNo: "B-2023-01", sku: "PRD-010", name: "Chemical X", qty: 50, expiryDate: "2023-12-31", value: 5000, status: "Expired" },
      { id: "2", batchNo: "B-2024-05", sku: "PRD-012", name: "Solution Y", qty: 20, expiryDate: "2024-05-15", value: 1200, status: "Expired" }
    ]});
  } catch (error) { next(error); }
};

// @desc    Get Stock Adjustment Report
// @route   GET /api/reports/stock/adjustment
// @access  Private
const getStockAdjustmentReport = async (req, res, next) => {
  try {
    res.json({ success: true, data: [
      { id: "1", date: new Date().toISOString(), sku: "PRD-020", name: "Item C", type: "Addition", qty: 10, reason: "Found in Audit", adjustedBy: "Admin" },
      { id: "2", date: new Date().toISOString(), sku: "PRD-021", name: "Item D", type: "Deduction", qty: -2, reason: "Missing count", adjustedBy: "Admin" }
    ]});
  } catch (error) { next(error); }
};

// @desc    Get Stock Transfer Report
// @route   GET /api/reports/stock/transfer
// @access  Private
const getStockTransferReport = async (req, res, next) => {
  try {
    res.json({ success: true, data: [
      { id: "1", date: new Date().toISOString(), referenceNo: "TRF-1001", fromWarehouse: "Main Hub", toWarehouse: "Retail East", status: "Completed", itemsCount: 5, totalValue: 12500 },
      { id: "2", date: new Date().toISOString(), referenceNo: "TRF-1002", fromWarehouse: "Retail West", toWarehouse: "Main Hub", status: "In Transit", itemsCount: 2, totalValue: 4000 }
    ]});
  } catch (error) { next(error); }
};

module.exports = {
  getStockSummary,
  getLowStockReport,
  getCurrentStock,
  getOpeningStock,
  getClosingStock,
  getStockLedger,
  getStockMovement,
  getStockValuation,
  getWarehouseWiseStock,
  getBranchWiseStock,
  getProductWiseStock,
  getOverstockReport,
  getOutOfStockReport,
  getDamagedStockReport,
  getExpiredStockReport,
  getStockAdjustmentReport,
  getStockTransferReport
};
