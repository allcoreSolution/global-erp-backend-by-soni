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
        minStock: min,              // ✅ FIX: minStockLevel → minStock
        shortage: Math.max(0, min - current)
      };
    });

    res.json({ success: true, data: result });
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
      isActive: true
    }).populate('category', 'name');

    const stockDetails = products.map(product => {
      // initialStockQty prefer karo, nahi hai toh currentStock use karo
      const openingQty = parseFloat(product.initialStockQty || 0) || (product.currentStock || 0);
      const rate = parseFloat(product.productCost || 0);
      return {
        productId: product._id,
        name: product.productName || '',
        sku: product.sku || product.productCode || '',
        category: product.category?.name || 'N/A',
        date: product.createdAt,
        openingQty,
        rate,
        openingValue: openingQty * rate
      };
    }).filter(item => item.openingQty > 0); // sirf wo products jo stock mein hain

    res.json({ success: true, data: stockDetails });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Closing Stock — item-level list
// @route   GET /api/reports/stock/closing-stock
// @access  Private
const getClosingStock = async (req, res, next) => {
  try {
    const products = await Product.find({
      company: req.user?.companyId,
      isActive: true
    }).populate('category', 'name');

    let totalClosingValue = 0;

    const items = products.map(product => {
      const closingQty = product.currentStock || 0;
      const rate = parseFloat(product.productCost) || 0;
      const closingValue = closingQty * rate;
      totalClosingValue += closingValue;

      return {
        productId: product._id,
        name: product.productName || '',
        sku: product.sku || product.productCode || '',
        category: product.category?.name || 'N/A',
        closingQty,
        rate,
        closingValue
      };
    });

    res.json({
      success: true,
      data: {
        totalClosingValue,
        items
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
    const [purchases, sales, entries] = await Promise.all([
      Purchase.find({ company: req.user?.companyId }).populate('orderItems.product', 'productName sku productCode'),
      Sale.find({ company: req.user?.companyId }).populate('orderItems.product', 'productName sku productCode'),
      StockEntry.find({ company: req.user?.companyId })
    ]);

    const ledger = [];

    // Process Purchases (Inward)
    purchases.forEach(p => {
      p.orderItems?.forEach(item => {
        if (item.product) {
          ledger.push({
            date: p.purchaseDate || p.createdAt,
            voucherNo: p.referenceNo || p.purchaseNo || '',
            type: 'Purchase',
            productName: item.product.productName || item.name || '',
            sku: item.product.sku || item.product.productCode || item.code || '',
            in: item.quantity || 0,
            out: 0,
            rate: item.netUnitCost || item.netUnitPrice || 0,
            warehouse: p.warehouse || ''
          });
        }
      });
    });

    // Process Sales (Outward)
    sales.forEach(s => {
      s.orderItems?.forEach(item => {
        if (item.product) {
          ledger.push({
            date: s.saleDate || s.createdAt,
            voucherNo: s.invoiceNo || '',
            type: 'Sale',
            productName: item.product.productName || item.name || '',
            sku: item.product.sku || item.product.productCode || item.code || '',
            in: 0,
            out: item.quantity || 0,
            rate: item.netUnitPrice || 0,
            warehouse: s.warehouse || ''
          });
        }
      });
    });

    // Process StockEntries
    entries.forEach(e => {
      e.products?.forEach(item => {
        const isOutward = e.stockType === 'Stock Transfer' || e.stockType === 'Outward';
        ledger.push({
          date: e.stockDate || e.createdAt,
          voucherNo: e.stockNo || '',
          type: e.stockType || 'Stock Entry',
          productName: item.product || item.name || '',
          sku: item.sku || item.code || '',
          in: isOutward ? 0 : (item.qty || 0),
          out: isOutward ? (item.qty || 0) : 0,
          rate: item.rate || 0,
          warehouse: e.locationWarehouse || e.warehouseBase || ''
        });
      });
    });

    // Sort by date descending
    ledger.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Calculate running balance per product (sku-wise)
    const balanceMap = {};
    // Sort ascending first for balance calculation
    const ascLedger = [...ledger].sort((a, b) => new Date(a.date) - new Date(b.date));
    ascLedger.forEach(entry => {
      const key = entry.sku || entry.productName;
      if (!balanceMap[key]) balanceMap[key] = 0;
      balanceMap[key] += (entry.in || 0) - (entry.out || 0);
      entry.balance = balanceMap[key];
    });

    // Return sorted descending with balance
    ascLedger.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      data: ascLedger
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Stock Movement
// @route   GET /api/reports/stock/movement
// @access  Private
const getStockMovement = async (req, res, next) => {
  try {
    const [purchases, sales, entries] = await Promise.all([
      Purchase.find({ company: req.user?.companyId })
        .populate('orderItems.product', 'productName sku productCode'),
      Sale.find({ company: req.user?.companyId })
        .populate('orderItems.product', 'productName sku productCode'),
      StockEntry.find({ company: req.user?.companyId })
    ]);

    const movement = [];

    // Purchases → IN
    purchases.forEach(p => {
      p.orderItems?.forEach(item => {
        if (item.product) {
          movement.push({
            date: p.purchaseDate || p.createdAt,
            reference: p.referenceNo || p.purchaseNo || '',
            movementType: 'IN',
            productName: item.product.productName || item.name || '',
            sku: item.product.sku || item.product.productCode || item.code || '',
            qty: item.quantity || 0,
            warehouse: p.warehouse || '',
            remark: 'Purchase from supplier'
          });
        }
      });
    });

    // Sales → OUT
    sales.forEach(s => {
      s.orderItems?.forEach(item => {
        if (item.product) {
          movement.push({
            date: s.saleDate || s.createdAt,
            reference: s.invoiceNo || '',
            movementType: 'OUT',
            productName: item.product.productName || item.name || '',
            sku: item.product.sku || item.product.productCode || item.code || '',
            qty: item.quantity || 0,
            warehouse: s.warehouse || '',
            remark: 'Sale to customer'
          });
        }
      });
    });

    // Stock Entries → IN / OUT
    entries.forEach(e => {
      const isOut = e.stockType === 'Stock Transfer' || e.stockType === 'Outward';
      e.products?.forEach(item => {
        movement.push({
          date: e.stockDate || e.createdAt,
          reference: e.stockNo || '',
          movementType: isOut ? 'OUT' : 'IN',
          productName: item.product || item.name || '',
          sku: item.sku || item.code || '',
          qty: item.qty || 0,
          warehouse: e.locationWarehouse || e.warehouseBase || '',
          remark: e.stockType || 'Stock Entry'
        });
      });
    });

    movement.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ success: true, data: movement });
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
    const products = await Product.find({
      company: req.user?.companyId,
      isActive: true
    }).populate('category', 'name');

    const result = [];

    products.forEach(product => {
      const cost = parseFloat(product.productCost) || 0;

      // Product mein warehouseStocks array hai — usse use karo
      if (product.warehouseStocks && product.warehouseStocks.length > 0) {
        product.warehouseStocks.forEach(ws => {
          const qty = ws.stock || 0;
          result.push({
            warehouse: ws.warehouse || 'Main Warehouse',
            productName: product.productName || '',
            sku: product.sku || product.productCode || '',
            category: product.category?.name || 'N/A',
            qty,
            value: qty * cost
          });
        });
      } else {
        // Fallback: agar warehouseStocks nahi hai toh currentStock use karo
        const qty = product.currentStock || 0;
        result.push({
          warehouse: product.initialStockWarehouse || 'Main Warehouse',
          productName: product.productName || '',
          sku: product.sku || product.productCode || '',
          category: product.category?.name || 'N/A',
          qty,
          value: qty * cost
        });
      }
    });

    // Zero stock wale bhi dikhao (filter optional)
    res.json({ success: true, data: result });
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
      const purchasePrice = parseFloat(product.productCost || product.purchasePrice || 0);
      const alertQuantity = parseFloat(product.alertQuantity || 0);
      const value = currentStock * purchasePrice;

      let status = 'In Stock';
      if (currentStock <= 0) {
        status = 'Critical';
      } else if (currentStock <= alertQuantity) {
        status = 'Low Stock';
      }

      return {
        sku: product.itemCode || product.sku || product.productCode || 'N/A',
        name: product.productName || product.name || 'Unknown',
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

    const result = overstockProducts.map(p => {
      const currentStock = p.currentStock || 0;
      const maxStock = parseFloat(p.alertQuantity || 0) * 3;
      return {
        id: p._id,
        sku: p.sku || p.productCode,
        name: p.productName,
        category: p.category?.name || 'N/A',
        currentStock,
        maxStock,                         // ✅ FIX: alertQuantity → maxStock
        excess: currentStock - maxStock,  // ✅ FIX: surplus → excess
        status: 'Overstocked'
      };
    });

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
      category: p.category?.name || 'N/A',
      lastStockDate: p.updatedAt,   // ✅ FIX: lastRestocked → lastStockDate
      status: 'Out of Stock'
    }));

    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

// @desc    Get Damaged Stock Report (from Adjustment model - items with negative qty)
// @route   GET /api/reports/stock/damaged
// @access  Private
const getDamagedStockReport = async (req, res, next) => {
  try {
    const companyId = req.user?.companyId || req.user?.company;
    const { Adjustment } = require('../models/Product');
    const adjustments = await Adjustment.find({
      $or: [{ company: companyId }, { company: String(companyId) }]
    }).sort({ createdAt: -1 });

    const data = [];
    adjustments.forEach(adj => {
      adj.items.forEach(item => {
        const isDamaged = (item.quantity || 0) < 0 || 
          (adj.documentName && adj.documentName.includes('DMG')) || 
          (item.reason && item.reason.toLowerCase().includes('damage')) ||
          (adj.note && adj.note.toLowerCase().includes('damage'));

        if (isDamaged) {
          const qty = Math.abs(item.quantity || 0);
          const cost = Number(item.cost) || 1000;
          data.push({
            id: adj._id,
            date: adj.createdAt,
            sku: item.code || 'N/A',
            productName: item.name || 'Pharma Tablet A - Demo',
            batchNo: item.batch || 'PTA-001',
            qtyDamaged: qty,
            reason: item.reason || adj.note || 'Damaged in transit/handling',
            valueLost: qty * cost,
            warehouse: adj.warehouse,
            loggedBy: 'Admin'
          });
        }
      });
    });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

// @desc    Get Expired Stock Report (products with batches and expiry)
// @route   GET /api/reports/stock/expired
// @access  Private
const getExpiredStockReport = async (req, res, next) => {
  try {
    const companyId = req.user?.companyId || req.user?.company;
    const reportDate = req.query.reportDate ? new Date(req.query.reportDate) : new Date();
    const windowDays = Number(req.query.windowDays) || 90;

    const products = await Product.find({
      $or: [{ company: companyId }, { company: String(companyId) }],
      isActive: true
    }).populate('category', 'name');

    const data = [];
    products.forEach(p => {
      if (p.batches && p.batches.length > 0) {
        p.batches.forEach(b => {
          const expDate = b.expDate ? new Date(b.expDate) : (p.expDate ? new Date(p.expDate) : null);
          const daysLeft = expDate ? Math.ceil((expDate - reportDate) / (1000 * 60 * 60 * 24)) : null;
          let status = 'Safe / Active';
          if (daysLeft !== null) {
            if (daysLeft <= 0) status = 'Expired';
            else if (daysLeft <= windowDays) status = `Near Expiry (${daysLeft}d left)`;
          }

          const qty = b.remainingQty !== undefined ? b.remainingQty : (b.stock !== undefined ? b.stock : p.currentStock || 0);
          const unitCost = Number(b.cost || b.purchaseRate || p.productCost) || 0;

          data.push({
            id: p._id,
            sku: p.sku || p.productCode,
            name: p.productName,
            category: p.category?.name || 'Pharmaceuticals',
            batchNo: b.batchNo || p.batchNo || 'N/A',
            mfgDate: b.mfgDate ? new Date(b.mfgDate).toISOString().split('T')[0] : '',
            expDate: expDate ? expDate.toISOString().split('T')[0] : '',
            daysLeft: daysLeft,
            qty: qty,
            cost: unitCost,
            value: qty * unitCost,
            status: status
          });
        });
      } else if (p.hasBatchAndExpiry || p.expDate || p.batchNo) {
        const expDate = p.expDate ? new Date(p.expDate) : null;
        const daysLeft = expDate ? Math.ceil((expDate - reportDate) / (1000 * 60 * 60 * 24)) : null;
        let status = 'Safe / Active';
        if (daysLeft !== null) {
          if (daysLeft <= 0) status = 'Expired';
          else if (daysLeft <= windowDays) status = `Near Expiry (${daysLeft}d left)`;
        }
        const qty = p.currentStock || 0;
        const unitCost = parseFloat(p.productCost) || 0;

        data.push({
          id: p._id,
          sku: p.sku || p.productCode,
          name: p.productName,
          category: p.category?.name || 'Pharmaceuticals',
          batchNo: p.batchNo || 'N/A',
          mfgDate: p.mfgDate ? new Date(p.mfgDate).toISOString().split('T')[0] : '',
          expDate: expDate ? expDate.toISOString().split('T')[0] : '',
          daysLeft: daysLeft,
          qty: qty,
          cost: unitCost,
          value: qty * unitCost,
          status: status
        });
      }
    });

    res.json({ success: true, data });
  } catch (error) { next(error); }
};

// @desc    Get Stock Adjustment Report (from Adjustment model - real DB)
// @route   GET /api/reports/stock/adjustment
// @access  Private
const getStockAdjustmentReport = async (req, res, next) => {
  try {
    const { Adjustment } = require('../models/Product');
    const adjustments = await Adjustment.find({ company: req.user?.companyId }).sort({ createdAt: -1 });
    const data = [];
    adjustments.forEach(adj => {
      adj.items.forEach(item => {
        data.push({
          id: adj._id,
          date: adj.createdAt,
          sku: item.code || 'N/A',
          productName: item.name || 'Unknown',   // ✅ FIX: name → productName
          adjustmentType: (item.quantity || 0) >= 0 ? 'Addition' : 'Deduction', // ✅ FIX: type → adjustmentType
          qty: item.quantity || 0,
          reason: adj.note || 'Manual Adjustment',
          warehouse: adj.warehouse,
          adjustedBy: 'Admin'
        });
      });
    });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

// @desc    Get Stock Transfer Report (from StockTransfer model - real DB)
// @route   GET /api/reports/stock/transfer
// @access  Private
const getStockTransferReport = async (req, res, next) => {
  try {
    const { StockTransfer } = require('../models/StockTransfer');
    const transfers = await StockTransfer.find().sort({ createdAt: -1 });

    const data = [];

    transfers.forEach(t => {
      if (t.items && t.items.length > 0) {
        // ✅ FIX: Har item ke liye ek row — productName, sku, qty sab aa jayega
        t.items.forEach(item => {
          data.push({
            id: t._id,
            date: t.date || t.createdAt,
            referenceNo: t.transferNo || '',
            fromWarehouse: t.fromWarehouse || '',
            toWarehouse: t.toWarehouse || '',
            productName: item.product || '',  // ✅ FIX: product string name
            sku: item.product || '',          // StockTransfer model mein sku nahi, product name hi sku ki jagah
            qty: item.qty || 0,              // ✅ FIX: itemsCount → qty
            status: t.status || 'Pending',
            remarks: t.remarks || ''
          });
        });
      } else {
        // Agar items nahi hain toh ek summary row
        data.push({
          id: t._id,
          date: t.date || t.createdAt,
          referenceNo: t.transferNo || '',
          fromWarehouse: t.fromWarehouse || '',
          toWarehouse: t.toWarehouse || '',
          productName: '-',
          sku: '-',
          qty: 0,
          status: t.status || 'Pending',
          remarks: t.remarks || ''
        });
      }
    });

    res.json({ success: true, data });
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
