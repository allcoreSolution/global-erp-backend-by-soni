const Plan = require('../models/Plan');

// Standard list of all selectable modules in the ERP
const AVAILABLE_MODULES = [
  { key: 'Dashboard', name: 'Dashboard & Analytics', description: 'Main business dashboard and KPI overview' },
  { key: 'Sales', name: 'Sales & Invoicing', description: 'Quotations, Sales Invoices, POS, Packing Slips, Challans, Sale Returns' },
  { key: 'Purchase', name: 'Purchases & Suppliers', description: 'Purchase Orders, Invoices, Purchase Returns, Supplier Master' },
  { key: 'Inventory', name: 'Inventory & Warehouses', description: 'Products, Stock Entry, Stock Transfer, Stock Adjustments, Tax Slabs, Price Lists' },
  { key: 'Customers', name: 'Customer Relationship (CRM)', description: 'Customer Directory, Credit Limits, Ledgers & Outstanding balances' },
  { key: 'Accounts', name: 'Accounting & Vouchers', description: 'Day Book, Cash/Bank Payments, Receipts, Contra, Debit/Credit Notes, Journal Vouchers' },
  { key: 'HRMS', name: 'HRMS & Staff Directory', description: 'Employee Directory, Designations, Departments, Shift Setups, Appraisals' },
  { key: 'Attendance', name: 'Attendance & Shifts', description: 'Daily Attendance punch logs, Shift timings, Overtime tracking' },
  { key: 'Leave', name: 'Leaves & Holidays', description: 'Leave Requests, approvals, Company Holiday Calendar' },
  { key: 'Payroll', name: 'Payroll & Compensation', description: 'Salary Structures, Payslips generation, PF & ESI, Expense Claims' },
  { key: 'Reports', name: 'Financial & MIS Reports', description: 'Sales, Purchases, Stock, P&L, Balance Sheet, Trial Balance, GST & TDS' },
  { key: 'Settings', name: 'Settings & Administration', description: 'Branch Management, System Preferences, Business Profile' }
];

// @desc    Get all available system modules (for Plan builder checkboxes)
// @route   GET /api/plans/modules
// @access  Private (SuperAdmin)
const getAvailableModules = async (req, res, next) => {
  try {
    res.json({
      success: true,
      modules: AVAILABLE_MODULES
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all plans
// @route   GET /api/plans
// @access  Private (SuperAdmin)
const getPlans = async (req, res, next) => {
  try {
    const plans = await Plan.find({}).sort({ price: 1 });
    res.json(plans);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single plan by ID
// @route   GET /api/plans/:id
// @access  Private (SuperAdmin)
const getPlanById = async (req, res, next) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      res.status(404);
      throw new Error('Plan not found');
    }
    res.json(plan);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new plan with dynamic module permissions and quotas
// @route   POST /api/plans
// @access  Private (SuperAdmin)
const createPlan = async (req, res, next) => {
  try {
    const {
      name,
      price,
      durationDays,
      billingCycle,
      subtitle,
      themeColor,
      iconType,
      isPopular,
      features,
      allowedModules,
      modulePermissions,
      maxUsers,
      maxBranches,
      maxWarehouses,
      maxInvoicesPerMonth,
      isActive
    } = req.body;

    if (!name || name.trim() === '') {
      res.status(400);
      throw new Error('Plan name is required');
    }

    // Default to all modules if none provided, or format provided array
    let resolvedAllowedModules = [];
    if (Array.isArray(allowedModules) && allowedModules.length > 0) {
      resolvedAllowedModules = allowedModules.map(m => String(m).trim());
    } else {
      resolvedAllowedModules = AVAILABLE_MODULES.map(m => m.key);
    }

    const plan = new Plan({
      name: name.trim(),
      price: Number(price) >= 0 ? Number(price) : 0,
      durationDays: Number(durationDays) > 0 ? Number(durationDays) : 30,
      billingCycle: billingCycle || '1 Month',
      subtitle: subtitle || '',
      themeColor: themeColor || 'peach',
      iconType: iconType || 'flower',
      isPopular: !!isPopular,
      features: Array.isArray(features) ? features : [],
      allowedModules: resolvedAllowedModules,
      modulePermissions: Array.isArray(modulePermissions) ? modulePermissions : [],
      maxUsers: Number(maxUsers) > 0 ? Number(maxUsers) : 10,
      maxBranches: Number(maxBranches) > 0 ? Number(maxBranches) : 1,
      maxWarehouses: Number(maxWarehouses) > 0 ? Number(maxWarehouses) : 1,
      maxInvoicesPerMonth: Number(maxInvoicesPerMonth) >= 0 ? Number(maxInvoicesPerMonth) : 0,
      isActive: isActive !== undefined ? isActive : true
    });

    const createdPlan = await plan.save();
    res.status(201).json(createdPlan);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a plan
// @route   PUT /api/plans/:id
// @access  Private (SuperAdmin)
const updatePlan = async (req, res, next) => {
  try {
    const {
      name,
      price,
      durationDays,
      billingCycle,
      subtitle,
      themeColor,
      iconType,
      isPopular,
      features,
      allowedModules,
      modulePermissions,
      maxUsers,
      maxBranches,
      maxWarehouses,
      maxInvoicesPerMonth,
      isActive
    } = req.body;

    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      res.status(404);
      throw new Error('Plan not found');
    }

    if (name !== undefined) plan.name = name.trim();
    if (price !== undefined) plan.price = Number(price);
    if (durationDays !== undefined) plan.durationDays = Number(durationDays);
    if (billingCycle !== undefined) plan.billingCycle = billingCycle;
    if (subtitle !== undefined) plan.subtitle = subtitle;
    if (themeColor !== undefined) plan.themeColor = themeColor;
    if (iconType !== undefined) plan.iconType = iconType;
    if (isPopular !== undefined) plan.isPopular = !!isPopular;
    if (features !== undefined) plan.features = Array.isArray(features) ? features : [];
    
    // Dynamic feature permissions & quotas
    if (allowedModules !== undefined) {
      plan.allowedModules = Array.isArray(allowedModules) ? allowedModules.map(m => String(m).trim()) : [];
    }
    if (modulePermissions !== undefined) {
      plan.modulePermissions = Array.isArray(modulePermissions) ? modulePermissions : [];
    }
    if (maxUsers !== undefined) plan.maxUsers = Number(maxUsers);
    if (maxBranches !== undefined) plan.maxBranches = Number(maxBranches);
    if (maxWarehouses !== undefined) plan.maxWarehouses = Number(maxWarehouses);
    if (maxInvoicesPerMonth !== undefined) plan.maxInvoicesPerMonth = Number(maxInvoicesPerMonth);
    if (isActive !== undefined) plan.isActive = !!isActive;

    const updatedPlan = await plan.save();
    res.json(updatedPlan);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a plan
// @route   DELETE /api/plans/:id
// @access  Private (SuperAdmin)
const deletePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      res.status(404);
      throw new Error('Plan not found');
    }
    await Plan.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Plan deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  AVAILABLE_MODULES,
  getAvailableModules,
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan
};
