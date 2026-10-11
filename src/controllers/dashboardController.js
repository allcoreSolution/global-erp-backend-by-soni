const { Sale } = require('../models/Sale');
const { Purchase } = require('../models/Purchase');
const ExpenseClaim = require('../models/ExpenseClaim');
const { Product } = require('../models/Product');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const AccountLedger = require('../models/AccountLedger');
const { MODULE_KEY_MAP } = require('../config/permissions');

// Helper to determine if current user has permission
const userHasPermission = (user, permKey, moduleName = null) => {
  if (!user || !user.role) return false;
  const role = user.role;
  const roleName = role.name || '';

  // SuperAdmin and Admin have complete bypass
  if (roleName === 'SuperAdmin' || roleName === 'Admin') return true;

  // Direct string permissions array match
  if (Array.isArray(role.permissions) && role.permissions.includes(permKey)) {
    return true;
  }

  // Check module permissions matrix
  if (Array.isArray(role.modulePermissions) && role.modulePermissions.length > 0) {
    const targetModule = (moduleName || MODULE_KEY_MAP[permKey]?.module || '').toLowerCase();
    const modPerm = role.modulePermissions.find(
      m => (m.module || m.name || '').toLowerCase() === targetModule
    );
    if (modPerm && (modPerm.view || modPerm.create || modPerm.edit)) {
      return true;
    }
  }

  return false;
};

// @desc    Get 100% Dynamic RBAC-filtered master dashboard summary statistics
// @route   GET /api/dashboard/summary
// @access  Private
const getDashboardSummary = async (req, res, next) => {
  try {
    const user = req.user;
    const companyId = user.company;
    const isSuperAdmin = user.role && user.role.name === 'SuperAdmin';
    const isAdmin = user.role && user.role.name === 'Admin';
    const hasFullAdminAccess = isSuperAdmin || isAdmin;

    // Check permissions for specific functional modules
    const canViewSales = hasFullAdminAccess || userHasPermission(user, 'view_sales', 'Sales');
    const canViewPurchases = hasFullAdminAccess || userHasPermission(user, 'view_purchases', 'Purchase');
    const canViewInventory = hasFullAdminAccess || userHasPermission(user, 'view_products', 'Inventory') || userHasPermission(user, 'view_stock', 'Inventory');
    const canViewAccounts = hasFullAdminAccess || userHasPermission(user, 'view_accounts', 'Settings') || userHasPermission(user, 'view_vouchers', 'Settings');
    const canViewHrms = hasFullAdminAccess || userHasPermission(user, 'view_hrms', 'Attendance') || userHasPermission(user, 'view_employees', 'Employee');
    const canViewPayroll = hasFullAdminAccess || userHasPermission(user, 'view_payroll', 'Payroll') || userHasPermission(user, 'view_payslips', 'Payroll');

    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 3, 1); // Indian FY start: April 1st
    const endOfYear = new Date(currentYear + 1, 2, 31); // Indian FY end: March 31st
    const todayStr = new Date().toISOString().split('T')[0];

    // Base match filters for tenant isolation
    const dateMatch = { createdAt: { $gte: startOfYear, $lte: endOfYear } };
    const tenantMatch = isSuperAdmin ? {} : (companyId ? { company: companyId } : {});

    // ----------------------------------------------------
    // 1. DYNAMIC SALES CALCULATION
    // ----------------------------------------------------
    let salesAgg = [];
    let totalSalesYear = 0;
    let recentSales = [];
    let topSellingProducts = [];

    if (canViewSales) {
      salesAgg = await Sale.aggregate([
        { $match: { ...tenantMatch, ...dateMatch } },
        {
          $group: {
            _id: { $month: "$createdAt" },
            totalSales: { $sum: "$grandTotal" }
          }
        }
      ]);
      totalSalesYear = salesAgg.reduce((acc, curr) => acc + curr.totalSales, 0);

      // Top selling items from real Sale records
      try {
        const topAgg = await Sale.aggregate([
          { $match: { ...tenantMatch } },
          { $unwind: "$items" },
          {
            $group: {
              _id: "$items.name",
              totalQty: { $sum: "$items.quantity" },
              totalAmount: { $sum: "$items.total" }
            }
          },
          { $sort: { totalAmount: -1 } },
          { $limit: 5 }
        ]);

        if (topAgg.length > 0) {
          topSellingProducts = topAgg.map((item, idx) => ({
            id: `${idx + 1}.`,
            name: item._id || 'Standard Product',
            qty: String(item.totalQty || 0),
            amount: `₹ ${(item.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          }));
        }
      } catch (_) {}

      // Recent real sale invoices
      try {
        recentSales = await Sale.find({ ...tenantMatch })
          .sort({ createdAt: -1 })
          .limit(3)
          .select('invoiceNumber customerName grandTotal createdAt');
      } catch (_) {}
    }

    // ----------------------------------------------------
    // 2. DYNAMIC PURCHASES CALCULATION
    // ----------------------------------------------------
    let purchaseAgg = [];
    let totalPurchasesYear = 0;
    let recentPurchases = [];

    if (canViewPurchases) {
      purchaseAgg = await Purchase.aggregate([
        { $match: { ...tenantMatch, ...dateMatch } },
        {
          $group: {
            _id: { $month: "$createdAt" },
            totalPurchase: { $sum: "$grandTotal" }
          }
        }
      ]);
      totalPurchasesYear = purchaseAgg.reduce((acc, curr) => acc + curr.totalPurchase, 0);

      try {
        recentPurchases = await Purchase.find({ ...tenantMatch })
          .sort({ createdAt: -1 })
          .limit(3)
          .select('billNumber supplierName grandTotal createdAt');
      } catch (_) {}
    }

    // ----------------------------------------------------
    // 3. DYNAMIC MONTHLY LINE CHART (Sales vs Purchase)
    // ----------------------------------------------------
    const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
    let lineData = [];

    if (canViewSales || canViewPurchases) {
      lineData = months.map((monthName, index) => {
        const mongoMonth = (index + 3) % 12 + 1;
        const s = salesAgg.find(x => x._id === mongoMonth);
        const p = purchaseAgg.find(x => x._id === mongoMonth);

        const salesVal = (canViewSales && s) ? parseFloat((s.totalSales / 100000).toFixed(2)) : 0;
        const purchaseVal = (canViewPurchases && p) ? parseFloat((p.totalPurchase / 100000).toFixed(2)) : 0;

        return {
          name: monthName,
          sales: salesVal,
          purchase: purchaseVal
        };
      });
    }

    // ----------------------------------------------------
    // 4. DYNAMIC EXPENSES & PIE CHART
    // ----------------------------------------------------
    let pieData = [];
    let totalExpensesYear = 0;

    if (canViewAccounts || canViewPurchases || hasFullAdminAccess) {
      let expenseAgg = [];
      try {
        const expenseMatch = isSuperAdmin ? { status: 'Approved' } : { ...tenantMatch, status: 'Approved' };
        expenseAgg = await ExpenseClaim.aggregate([
          { $match: expenseMatch },
          { $group: { _id: "$category", totalAmount: { $sum: "$amount" } } }
        ]);
      } catch (_) {}

      // Add purchases to expenses pie if allowed
      if (totalPurchasesYear > 0 && canViewPurchases) {
        pieData.push({ name: 'Purchase', value: totalPurchasesYear, color: '#3b82f6' });
        totalExpensesYear += totalPurchasesYear;
      }

      const colors = ['#eab308', '#ef4444', '#f97316', '#10b981', '#06b6d4', '#8b5cf6'];
      expenseAgg.forEach((exp, idx) => {
        pieData.push({
          name: exp._id || 'General Expenses',
          value: exp.totalAmount,
          color: colors[idx % colors.length]
        });
        totalExpensesYear += exp.totalAmount;
      });
    }

    // ----------------------------------------------------
    // 5. DYNAMIC OUTSTANDING DEBTORS & CREDITORS
    // ----------------------------------------------------
    let outstanding = { debtors: 0, creditors: 0, othersReceivable: 0, othersPayable: 0, net: 0 };
    let debtorsAmount = 0;
    let creditorsAmount = 0;

    if (canViewAccounts || canViewSales || canViewPurchases) {
      if (canViewSales || canViewAccounts) {
        const unpaidSales = await Sale.aggregate([
          { $match: { ...tenantMatch, paymentStatus: { $ne: 'Paid' } } },
          { $group: { _id: null, balance: { $sum: { $subtract: ["$grandTotal", "$amountPaid"] } } } }
        ]);
        debtorsAmount = unpaidSales.length > 0 ? unpaidSales[0].balance : 0;
      }

      if (canViewPurchases || canViewAccounts) {
        const unpaidPurchases = await Purchase.aggregate([
          { $match: { ...tenantMatch, paymentMode: 'Credit' } },
          { $group: { _id: null, balance: { $sum: "$grandTotal" } } }
        ]);
        creditorsAmount = unpaidPurchases.length > 0 ? unpaidPurchases[0].balance : 0;
      }

      outstanding.debtors = parseFloat((debtorsAmount / 100000).toFixed(2));
      outstanding.creditors = parseFloat((creditorsAmount / 100000).toFixed(2));
      outstanding.net = parseFloat((outstanding.debtors - outstanding.creditors).toFixed(2));
    }

    // ----------------------------------------------------
    // 6. DYNAMIC SUMMARY CARDS (Real Gross & Net Profit)
    // ----------------------------------------------------
    const summaryCards = {};

    const formatCurrency = (val) => {
      if (!val && val !== 0) return '₹ 0.00';
      const absVal = Math.abs(val);
      const formatted = absVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return val < 0 ? `-₹ ${formatted}` : `₹ ${formatted}`;
    };

    if (canViewSales) {
      summaryCards.sales = {
        amount: formatCurrency(totalSalesYear),
        percent: totalSalesYear > 0 ? '+100%' : '0%',
        up: true
      };
    }

    if (canViewPurchases) {
      summaryCards.purchase = {
        amount: formatCurrency(totalPurchasesYear),
        percent: totalPurchasesYear > 0 ? '+100%' : '0%',
        up: false
      };
    }

    if (canViewAccounts || hasFullAdminAccess) {
      const grossProfitNum = totalSalesYear - totalPurchasesYear;
      const netProfitNum = totalSalesYear - totalPurchasesYear - totalExpensesYear;

      summaryCards.grossProfit = {
        amount: formatCurrency(grossProfitNum),
        percent: grossProfitNum >= 0 ? '+Gross' : '-Loss',
        up: grossProfitNum >= 0
      };

      summaryCards.netProfit = {
        amount: formatCurrency(netProfitNum),
        percent: netProfitNum >= 0 ? '+Profit' : '-Loss',
        up: netProfitNum >= 0
      };

      summaryCards.totalExpenses = {
        amount: formatCurrency(totalExpensesYear),
        percent: totalExpensesYear > 0 ? 'Logged' : '0%',
        up: true
      };

      summaryCards.outstanding = {
        amount: formatCurrency(debtorsAmount - creditorsAmount)
      };
    }

    // ----------------------------------------------------
    // 7. DYNAMIC INVENTORY TABLES (Real Low Stock & Expired)
    // ----------------------------------------------------
    const tables = {
      lowStockData: [],
      expiryData: [],
      topSellingData: topSellingProducts,
      recentActivities: []
    };

    if (canViewInventory) {
      try {
        const lowStockProducts = await Product.find({
          ...tenantMatch,
          $expr: { $lte: ["$currentStock", { $toDouble: { $ifNull: ["$alertQuantity", "10"] } }] }
        }).limit(5).select('productName currentStock alertQuantity');

        tables.lowStockData = lowStockProducts.map((p, idx) => ({
          id: `${idx + 1}.`,
          name: p.productName,
          stock: String(p.currentStock || 0),
          reorder: String(p.alertQuantity || 10)
        }));
      } catch (_) {}
    }

    // ----------------------------------------------------
    // 8. DYNAMIC CASH & BANK BALANCE (From Database AccountLedgers)
    // ----------------------------------------------------
    let bankBalanceData = [];
    if (canViewAccounts || hasFullAdminAccess) {
      try {
        const ledgers = await AccountLedger.find({
          ...tenantMatch,
          accountName: { $regex: /cash|bank|hdfc|icici|sbi/i }
        }).limit(5);

        if (ledgers.length > 0) {
          let sumTotal = 0;
          bankBalanceData = ledgers.map(l => {
            const bal = l.openingBalance || 0;
            sumTotal += bal;
            return {
              particulars: l.accountName,
              amount: `₹ ${bal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            };
          });
          bankBalanceData.push({
            particulars: 'Total Balance',
            amount: `₹ ${sumTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            totalValue: `₹ ${sumTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          });
        }
      } catch (_) {}
    }

    // ----------------------------------------------------
    // 9. DYNAMIC RECENT ACTIVITIES (From Live Sales & Purchases)
    // ----------------------------------------------------
    const dynamicActivities = [];
    recentSales.forEach(s => {
      dynamicActivities.push({
        activity: `Sale Invoice #${s.invoiceNumber || 'INV'} Created`,
        user: s.customerName || 'Customer',
        time: s.createdAt ? new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'
      });
    });
    recentPurchases.forEach(p => {
      dynamicActivities.push({
        activity: `Purchase Bill #${p.billNumber || 'BILL'} Saved`,
        user: p.supplierName || 'Supplier',
        time: p.createdAt ? new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'
      });
    });

    tables.recentActivities = dynamicActivities.slice(0, 5);

    // ----------------------------------------------------
    // Response payload
    // ----------------------------------------------------
    res.json({
      success: true,
      permissions: {
        canViewSales,
        canViewPurchases,
        canViewInventory,
        canViewAccounts,
        canViewHrms,
        canViewPayroll,
        isSuperAdmin,
        isAdmin
      },
      data: {
        lineData,
        pieData,
        outstanding,
        summaryCards,
        tables,
        bankBalanceData
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary
};
