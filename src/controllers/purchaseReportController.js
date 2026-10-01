const Purchase = require('../models/Purchase'); // Assuming this exists

// Helper to send mock data for now, since we may not have complex aggregations ready
const sendMockData = (res, data) => res.json({ success: true, data });

const getGeneralPurchaseSummary = async (req, res, next) => {
  try {
    const data = {
      totalPurchases: '₹ 1.2 Cr',
      totalInvoices: 840,
      totalReturns: '₹ 15.4 L',
      netPurchases: '₹ 1.04 Cr'
    };

    sendMockData(res, data);
  } catch (error) {
    next(error);
  }
};

const getDailyPurchaseReport = async (req, res, next) => {
  try {
    const data = [
      { date: '2026-09-20', invoices: 15, amount: 450000, returns: 0, net: 450000 },
      { date: '2026-09-19', invoices: 22, amount: 720000, returns: 12000, net: 708000 },
      { date: '2026-09-18', invoices: 18, amount: 540000, returns: 5000, net: 535000 },
    ];
    sendMockData(res, data);
  } catch (error) {
    next(error);
  }
};

const getMonthlyPurchaseReport = async (req, res, next) => {
  try {
    const data = [
      { month: 'Sep 2026', invoices: 245, amount: 8500000, returns: 250000, net: 8250000 },
      { month: 'Aug 2026', invoices: 290, amount: 9200000, returns: 310000, net: 8890000 },
      { month: 'Jul 2026', invoices: 275, amount: 8900000, returns: 180000, net: 8720000 },
    ];
    sendMockData(res, data);
  } catch (error) {
    next(error);
  }
};

const getYearlyPurchaseReport = async (req, res, next) => {
  try {
    const data = [
      { year: '2026', invoices: 2840, amount: 85000000, returns: 1250000, net: 83750000 },
      { year: '2025', invoices: 3100, amount: 92000000, returns: 1800000, net: 90200000 },
    ];
    sendMockData(res, data);
  } catch (error) {
    next(error);
  }
};

const getPurchaseInvoiceRegister = async (req, res, next) => {
  try {
    const data = [
      { date: '2026-09-20', invoiceNo: 'PINV-26-001', supplier: 'Global Suppliers', totalAmount: 45000, status: 'Received' },
      { date: '2026-09-19', invoiceNo: 'PINV-26-002', supplier: 'Tech Distributors', totalAmount: 120000, status: 'Pending' },
      { date: '2026-09-18', invoiceNo: 'PINV-26-003', supplier: 'Acme Raw Materials', totalAmount: 85000, status: 'Received' },
    ];
    sendMockData(res, data);
  } catch (error) {
    next(error);
  }
};

const getPurchaseReturnReport = async (req, res, next) => {
  try {
    const data = [
      { date: '2026-09-20', debitNote: 'DN-26-001', supplier: 'Global Suppliers', originalInvoice: 'PINV-26-001', amount: 5000, reason: 'Damaged Goods' },
      { date: '2026-09-18', debitNote: 'DN-26-002', supplier: 'Acme Raw Materials', originalInvoice: 'PINV-26-003', amount: 12000, reason: 'Quality Issue' },
    ];
    sendMockData(res, data);
  } catch (error) {
    next(error);
  }
};

const getNetPurchaseReport = async (req, res, next) => {
  try {
    const data = [
      { period: 'Q3 2026', grossPurchase: 25000000, discountReceived: 500000, returns: 1500000, netPurchase: 23000000 },
      { period: 'Q2 2026', grossPurchase: 28000000, discountReceived: 600000, returns: 1800000, netPurchase: 25600000 },
    ];
    sendMockData(res, data);
  } catch (error) {
    next(error);
  }
};


// ==========================================
// Purchase Analysis Reports Mock APIs
// ==========================================

const getProductWisePurchase = async (req, res, next) => {
  try {
    const data = [
      { id: '1', sku: 'PRD-001', name: 'Industrial Grade Steel', category: 'Raw Material', quantity: 450, avgCost: 1200, totalCost: 540000, margin: '15%', status: 'Stable' },
      { id: '2', sku: 'PRD-002', name: 'Aluminium Sheets', category: 'Raw Material', quantity: 320, avgCost: 850, totalCost: 272000, margin: '12%', status: 'Volatile' },
      { id: '3', sku: 'PRD-003', name: 'Copper Wire Bundle', category: 'Electrical', quantity: 150, avgCost: 4500, totalCost: 675000, margin: '18%', status: 'Stable' },
    ];
    sendMockData(res, data);
  } catch (error) { next(error); }
};

const getSupplierWisePurchase = async (req, res, next) => {
  try {
    const data = [
      { id: 1, name: 'Global Tech', orders: 145, volume: 450000, leadTime: '4 Days', compliance: '98%', status: 'Excellent' },
      { id: 2, name: 'TechDistro Inc.', orders: 320, volume: 1250000, leadTime: '2 Days', compliance: '99%', status: 'Excellent' },
      { id: 3, name: 'OfficeDepot', orders: 85, volume: 154000, leadTime: '7 Days', compliance: '85%', status: 'Average' },
    ];
    sendMockData(res, data);
  } catch (error) { next(error); }
};

const getCategoryWisePurchase = async (req, res, next) => {
  try {
    const data = [
      { id: 'CAT-01', category: 'Raw Materials', items: 45, volume: 1250000, percentage: '45%', status: 'In Budget' },
      { id: 'CAT-02', category: 'Electrical Parts', items: 32, volume: 850000, percentage: '30%', status: 'Over Budget' },
      { id: 'CAT-03', category: 'Packaging', items: 12, volume: 150000, percentage: '5%', status: 'In Budget' },
    ];
    sendMockData(res, data);
  } catch (error) { next(error); }
};

const getBrandWisePurchase = async (req, res, next) => {
  try {
    const data = [
      { id: 'BRD-01', brand: 'Tata Steel', category: 'Raw Material', volume: 2500000, marketShare: '45%', status: 'Top Supplier' },
      { id: 'BRD-02', brand: 'Finolex', category: 'Electrical', volume: 850000, marketShare: '15%', status: 'Stable' },
      { id: 'BRD-03', brand: 'Havells', category: 'Electrical', volume: 420000, marketShare: '8%', status: 'Growing' },
    ];
    sendMockData(res, data);
  } catch (error) { next(error); }
};

const getBranchWisePurchase = async (req, res, next) => {
  try {
    const data = [
      { id: 'BR-01', branch: 'Mumbai HQ', manager: 'Ravi Kumar', orders: 450, volume: 3500000, budget: 4000000, status: 'In Budget' },
      { id: 'BR-02', branch: 'Delhi Branch', manager: 'Amit Singh', orders: 280, volume: 1850000, budget: 1500000, status: 'Over Budget' },
      { id: 'BR-03', branch: 'Bangalore Hub', manager: 'Priya Desai', orders: 320, volume: 2100000, budget: 2500000, status: 'In Budget' },
    ];
    sendMockData(res, data);
  } catch (error) { next(error); }
};

const getWarehouseWisePurchase = async (req, res, next) => {
  try {
    const data = [
      { id: 'WH-01', warehouse: 'Central WH (Mumbai)', location: 'Mumbai', inwardItems: 12500, volume: 4500000, capacity: '85%', status: 'Optimal' },
      { id: 'WH-02', warehouse: 'North WH (Delhi)', location: 'Delhi', inwardItems: 8400, volume: 2800000, capacity: '92%', status: 'Near Full' },
      { id: 'WH-03', warehouse: 'South WH (Bangalore)', location: 'Bangalore', inwardItems: 5600, volume: 1950000, capacity: '60%', status: 'Optimal' },
    ];
    sendMockData(res, data);
  } catch (error) { next(error); }
};




// ==========================================
// Purchase Financial Reports Mock APIs
// ==========================================

const getPurchaseAmountReport = async (req, res, next) => {
  try {
    const data = [
      { invoice: 'PINV-26-0901', date: '2026-09-01', supplier: 'Global Supplies Inc.', amount: 150000, status: 'Paid', method: 'Bank Transfer' },
      { invoice: 'PINV-26-0902', date: '2026-09-02', supplier: 'Prime Electronics', amount: 325000, status: 'Pending', method: '-' },
      { invoice: 'PINV-26-0903', date: '2026-09-02', supplier: 'Delta Furniture', amount: 84000, status: 'Paid', method: 'NEFT' },
      { invoice: 'PINV-26-0904', date: '2026-09-03', supplier: 'Tech Wholesale', amount: 410000, status: 'Partial', method: 'Cheque' },
      { invoice: 'PINV-26-0905', date: '2026-09-04', supplier: 'Office Solutions', amount: 95000, status: 'Paid', method: 'Bank Transfer' },
    ];
    sendMockData(res, data);
  } catch (error) { next(error); }
};

const getPurchaseDiscountReport = async (req, res, next) => {
  try {
    const data = [
      { id: 1, vendor: 'Global Tech', billNo: 'BILL-445', billAmount: 45000, discountPct: '5%', discountAmount: 2250, finalAmount: 42750 },
      { id: 2, vendor: 'TechDistro Inc.', billNo: 'BILL-889', billAmount: 125000, discountPct: '10%', discountAmount: 12500, finalAmount: 112500 },
      { id: 3, vendor: 'OfficeDepot', billNo: 'BILL-112', billAmount: 15400, discountPct: '2%', discountAmount: 308, finalAmount: 15092 },
      { id: 4, vendor: 'Furnishings Co', billNo: 'BILL-475', billAmount: 32000, discountPct: '8%', discountAmount: 2560, finalAmount: 29440 },
      { id: 5, vendor: 'Global Chips Ltd', billNo: 'BILL-990', billAmount: 88000, discountPct: '7.5%', discountAmount: 6600, finalAmount: 81400 },
    ];
    sendMockData(res, data);
  } catch (error) { next(error); }
};

const getTaxGstPaidReport = async (req, res, next) => {
  try {
    const data = [
      { id: 1, vendor: 'RawMaterials Inc', gstin: '29ABCDE1234F1Z5', date: '01-Sep-2026', taxableAmount: 50000, cgst: 4500, sgst: 4500, igst: 0, totalTax: 9000 },
      { id: 2, vendor: 'TechDistro', gstin: '27XYZDE9874F1Z2', date: '03-Sep-2026', taxableAmount: 120000, cgst: 0, sgst: 0, igst: 21600, totalTax: 21600 },
      { id: 3, vendor: 'Office World', gstin: '29KJLDE1111F1Z9', date: '10-Sep-2026', taxableAmount: 15000, cgst: 1350, sgst: 1350, igst: 0, totalTax: 2700 },
      { id: 4, vendor: 'Global Logistics', gstin: '33MHNDE2222F1Z8', date: '12-Sep-2026', taxableAmount: 45000, cgst: 0, sgst: 0, igst: 2250, totalTax: 2250 },
      { id: 5, vendor: 'Alpha Builders', gstin: '29ABCDE4444F1Z1', date: '15-Sep-2026', taxableAmount: 85000, cgst: 7650, sgst: 7650, igst: 0, totalTax: 15300 },
    ];
    sendMockData(res, data);
  } catch (error) { next(error); }
};

const getPurchaseCostReport = async (req, res, next) => {
  try {
    const data = [
      { id: 1, product: 'Intel Core i7', qty: 50, unitPrice: 245, freight: 12.5, customs: 5.5, handling: 2.0, landingCost: 265 },
      { id: 2, product: 'Samsung 1TB SSD', qty: 100, unitPrice: 85, freight: 4.5, customs: 1.5, handling: 1.0, landingCost: 92 },
      { id: 3, product: 'Office Chair Pro', qty: 25, unitPrice: 150, freight: 25.0, customs: 0, handling: 5.0, landingCost: 180 },
      { id: 4, product: 'Mechanical Keyboard', qty: 75, unitPrice: 65, freight: 8.5, customs: 2.5, handling: 1.5, landingCost: 77.5 },
      { id: 5, product: '27" 4K Monitor', qty: 40, unitPrice: 320, freight: 35.0, customs: 15.0, handling: 8.0, landingCost: 378 },
    ];
    sendMockData(res, data);
  } catch (error) { next(error); }
};

const getSupplierOutstandingReport = async (req, res, next) => {
  try {
    const data = [
      { id: 1, vendor: 'TechDistro Inc.', balance: 145000, overdue: 45000, daysOverdue: 15, status: 'Overdue' },
      { id: 2, vendor: 'OfficeDepot', balance: 32000, overdue: 0, daysOverdue: 0, status: 'On Track' },
      { id: 3, vendor: 'Global Logistics', balance: 85000, overdue: 85000, daysOverdue: 42, status: 'Critical' },
      { id: 4, vendor: 'RawMaterials Inc', balance: 12000, overdue: 5000, daysOverdue: 5, status: 'Overdue' },
      { id: 5, vendor: 'Alpha Builders', balance: 250000, overdue: 0, daysOverdue: 0, status: 'On Track' },
    ];
    sendMockData(res, data);
  } catch (error) { next(error); }
};

const getPaidVsPendingPurchaseReport = async (req, res, next) => {
  try {
    const data = [
      { id: 1, period: 'Sep 2026', totalPurchases: 450000, paidAmount: 305000, pendingAmount: 145000, paidPct: 67 },
      { id: 2, period: 'Aug 2026', totalPurchases: 380000, paidAmount: 348000, pendingAmount: 32000, paidPct: 91 },
      { id: 3, period: 'Jul 2026', totalPurchases: 520000, paidAmount: 435000, pendingAmount: 85000, paidPct: 83 },
      { id: 4, period: 'Jun 2026', totalPurchases: 410000, paidAmount: 398000, pendingAmount: 12000, paidPct: 97 },
      { id: 5, period: 'May 2026', totalPurchases: 475000, paidAmount: 475000, pendingAmount: 0, paidPct: 100 },
    ];
    sendMockData(res, data);
  } catch (error) { next(error); }
};

const getTopSuppliersReport = async (req, res, next) => {
  try {
    const data = [
      { rank: 1, vendorId: 'VND-045', name: 'Global Supplies Inc.', category: 'Electronics', orders: 120, amount: 4500000, margin: '22%', trend: 'Up' },
      { rank: 2, vendorId: 'VND-012', name: 'Prime Hardware Ltd.', category: 'Hardware', orders: 85, amount: 2100000, margin: '35%', trend: 'Up' },
      { rank: 3, vendorId: 'VND-088', name: 'Alpha Software Corp.', category: 'Software', orders: 45, amount: 1500000, margin: '18%', trend: 'Down' },
      { rank: 4, vendorId: 'VND-104', name: 'Delta Furniture', category: 'Furniture', orders: 60, amount: 800000, margin: '15%', trend: 'Flat' },
      { rank: 5, vendorId: 'VND-023', name: 'Office Solutions', category: 'Stationery', orders: 30, amount: 250000, margin: '12%', trend: 'Up' },
    ];
    sendMockData(res, data);
  } catch (error) { next(error); }
};

const getFrequentlyPurchasedReport = async (req, res, next) => {
  try {
    const data = [
      { id: 1, name: 'Industrial Bearings A-12', category: 'Hardware', frequency: 145, avgRestock: '12 Days', cost: 12500 },
      { id: 2, name: 'Safety Helmets Pro', category: 'PPE', frequency: 98, avgRestock: '30 Days', cost: 8400 },
      { id: 3, name: 'Lubricant Oil 50L', category: 'Consumables', frequency: 76, avgRestock: '15 Days', cost: 15200 },
      { id: 4, name: 'Copper Wiring 2.5mm', category: 'Electrical', frequency: 65, avgRestock: '20 Days', cost: 22000 },
      { id: 5, name: 'Steel Bolts M10', category: 'Hardware', frequency: 54, avgRestock: '10 Days', cost: 4500 },
    ];
    sendMockData(res, data);
  } catch (error) { next(error); }
};

const getPriceComparisonReport = async (req, res, next) => {
  try {
    const data = [
      { id: 1, product: 'Intel Core i7 Processor', defaultVendor: 'TechDistro Inc.', defaultPrice: 245, bestVendor: 'Global Chips Ltd', bestPrice: 220, variance: '-10.2%' },
      { id: 2, product: 'Samsung 1TB SSD', defaultVendor: 'Storage World', defaultPrice: 85, bestVendor: 'TechDistro Inc.', bestPrice: 82, variance: '-3.5%' },
      { id: 3, product: 'Office Chair Pro', defaultVendor: 'Furnishings Co', defaultPrice: 150, bestVendor: 'OfficeDepot', bestPrice: 135, variance: '-10.0%' },
      { id: 4, product: 'Mechanical Keyboard', defaultVendor: 'Peripheral Hub', defaultPrice: 65, bestVendor: 'TechDistro Inc.', bestPrice: 60, variance: '-7.6%' },
      { id: 5, product: '27" 4K Monitor', defaultVendor: 'Display Tech', defaultPrice: 320, bestVendor: 'Display Tech', bestPrice: 320, variance: '0.0%' },
    ];
    sendMockData(res, data);
  } catch (error) { next(error); }
};

module.exports = {
  getTopSuppliersReport,
  getFrequentlyPurchasedReport,
  getPriceComparisonReport,
  getGeneralPurchaseSummary,
  getDailyPurchaseReport,
  getMonthlyPurchaseReport,
  getYearlyPurchaseReport,
  getPurchaseInvoiceRegister,
  getPurchaseReturnReport,
  getNetPurchaseReport,
  getProductWisePurchase,
  getSupplierWisePurchase,
  getCategoryWisePurchase,
  getBrandWisePurchase,
  getBranchWisePurchase,
  getWarehouseWisePurchase,
  getPurchaseAmountReport,
  getPurchaseDiscountReport,
  getTaxGstPaidReport,
  getPurchaseCostReport,
  getSupplierOutstandingReport,
  getPaidVsPendingPurchaseReport
};
