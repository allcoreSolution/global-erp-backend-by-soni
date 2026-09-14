const { Product } = require('../models/Product');

// @desc    Get complete stock summary and valuation
// @route   GET /api/reports/stock/summary
// @access  Private
const getStockSummary = async (req, res, next) => {
  try {
    // Fetch all active products for the company
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
      const purchasePrice = product.purchasePrice || 0;
      const salePrice = product.salePrice || 0;
      
      const stockValue = currentStock * purchasePrice;
      const potentialSaleValue = currentStock * salePrice;

      totalStockValue += stockValue;
      totalSaleValue += potentialSaleValue;
      totalItems += currentStock;

      if (currentStock <= (product.minStockLevel || 0)) {
        lowStockItemsCount++;
      }

      return {
        productId: product._id,
        name: product.name,
        sku: product.sku,
        category: product.category?.name || 'N/A',
        brand: product.brand?.name || 'N/A',
        currentStock,
        minStockLevel: product.minStockLevel || 0,
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
          totalStockValue, // Cost valuation
          totalPotentialSaleValue: totalSaleValue, // Sales valuation
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
    // Find products where currentStock is less than or equal to minStockLevel
    // Note: Since minStockLevel and currentStock are fields in the same document,
    // we use an aggregation pipeline or $expr to compare fields within the same document.
    const lowStockProducts = await Product.find({
      company: req.user?.companyId,
      isActive: true,
      $expr: { $lte: ['$currentStock', '$minStockLevel'] }
    }).populate('category', 'name').populate('brand', 'name');

    const result = lowStockProducts.map(product => ({
      productId: product._id,
      name: product.name,
      sku: product.sku,
      category: product.category?.name || 'N/A',
      brand: product.brand?.name || 'N/A',
      currentStock: product.currentStock || 0,
      minStockLevel: product.minStockLevel || 0,
      shortage: Math.max(0, (product.minStockLevel || 0) - (product.currentStock || 0))
    }));

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStockSummary,
  getLowStockReport
};
