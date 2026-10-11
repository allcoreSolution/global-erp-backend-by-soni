/**
 * Permission Configuration & Mapping Constants
 * Centralized list of permissions, modules and actions across Global ERP
 * Standard format: [action]_[resource] (e.g. view_journal_vouchers, create_sales)
 * Every resource has its own distinct, unique permission name.
 */

const MODULE_KEY_MAP = {
  // 1. Employee & Staff
  view_employees: { module: 'Employee', action: 'view' },
  create_employees: { module: 'Employee', action: 'create' },
  edit_employees: { module: 'Employee', action: 'edit' },
  delete_employees: { module: 'Employee', action: 'delete' },
  manage_employees: { module: 'Employee', action: 'create' },

  // 2. HRMS & Attendance
  view_hrms: { module: 'Attendance', action: 'view' },
  create_hrms: { module: 'Attendance', action: 'create' },
  edit_hrms: { module: 'Attendance', action: 'edit' },
  delete_hrms: { module: 'Attendance', action: 'delete' },
  manage_hrms: { module: 'Attendance', action: 'create' },

  // Shift Timing & Setup (Unique permissions)
  view_shift_timings: { module: 'Attendance', action: 'view' },
  create_shift_timings: { module: 'Attendance', action: 'create' },
  edit_shift_timings: { module: 'Attendance', action: 'edit' },
  delete_shift_timings: { module: 'Attendance', action: 'delete' },

  view_shift_setups: { module: 'Attendance', action: 'view' },
  create_shift_setups: { module: 'Attendance', action: 'create' },
  edit_shift_setups: { module: 'Attendance', action: 'edit' },
  delete_shift_setups: { module: 'Attendance', action: 'delete' },

  view_shifts: { module: 'Attendance', action: 'view' },
  create_shifts: { module: 'Attendance', action: 'create' },
  edit_shifts: { module: 'Attendance', action: 'edit' },
  delete_shifts: { module: 'Attendance', action: 'delete' },

  // Appraisals & Performance (Unique permissions)
  view_appraisals: { module: 'Attendance', action: 'view' },
  create_appraisals: { module: 'Attendance', action: 'create' },
  edit_appraisals: { module: 'Attendance', action: 'edit' },
  delete_appraisals: { module: 'Attendance', action: 'delete' },
  view_appraisal: { module: 'Attendance', action: 'view' },
  create_appraisal: { module: 'Attendance', action: 'create' },
  edit_appraisal: { module: 'Attendance', action: 'edit' },
  delete_appraisal: { module: 'Attendance', action: 'delete' },

  view_employee_targets: { module: 'Attendance', action: 'view' },
  create_employee_targets: { module: 'Attendance', action: 'create' },
  edit_employee_targets: { module: 'Attendance', action: 'edit' },
  delete_employee_targets: { module: 'Attendance', action: 'delete' },

  view_performance_ratings: { module: 'Attendance', action: 'view' },
  create_performance_ratings: { module: 'Attendance', action: 'create' },
  edit_performance_ratings: { module: 'Attendance', action: 'edit' },
  delete_performance_ratings: { module: 'Attendance', action: 'delete' },

  // 3. Leaves & Holidays
  view_leave: { module: 'Leave', action: 'view' },
  create_leave: { module: 'Leave', action: 'create' },
  edit_leave: { module: 'Leave', action: 'edit' },
  delete_leave: { module: 'Leave', action: 'delete' },
  manage_leave: { module: 'Leave', action: 'create' },

  view_holidays: { module: 'Leave', action: 'view' },
  create_holidays: { module: 'Leave', action: 'create' },
  edit_holidays: { module: 'Leave', action: 'edit' },
  delete_holidays: { module: 'Leave', action: 'delete' },

  // 4. Payroll & Payslips
  view_payroll: { module: 'Payroll', action: 'view' },
  create_payroll: { module: 'Payroll', action: 'create' },
  edit_payroll: { module: 'Payroll', action: 'edit' },
  delete_payroll: { module: 'Payroll', action: 'delete' },
  manage_payroll: { module: 'Payroll', action: 'create' },

  view_payslips: { module: 'Payroll', action: 'view' },
  create_payslips: { module: 'Payroll', action: 'create' },
  delete_payslips: { module: 'Payroll', action: 'delete' },

  view_salary_structures: { module: 'Payroll', action: 'view' },
  create_salary_structures: { module: 'Payroll', action: 'create' },
  edit_salary_structures: { module: 'Payroll', action: 'edit' },
  delete_salary_structures: { module: 'Payroll', action: 'delete' },

  view_statutory_reports: { module: 'Payroll', action: 'view' },

  view_expenses: { module: 'Payroll', action: 'view' },
  create_expenses: { module: 'Payroll', action: 'create' },
  edit_expenses: { module: 'Payroll', action: 'edit' },
  delete_expenses: { module: 'Payroll', action: 'delete' },

  // 5. Sales, Credit Notes & Contacts
  view_sales: { module: 'Sales', action: 'view' },
  create_sales: { module: 'Sales', action: 'create' },
  edit_sales: { module: 'Sales', action: 'edit' },
  delete_sales: { module: 'Sales', action: 'delete' },
  manage_sales: { module: 'Sales', action: 'create' },

  view_credit_notes: { module: 'Sales', action: 'view' },
  create_credit_notes: { module: 'Sales', action: 'create' },
  edit_credit_notes: { module: 'Sales', action: 'edit' },
  delete_credit_notes: { module: 'Sales', action: 'delete' },

  view_contacts: { module: 'Sales', action: 'view' },
  create_contacts: { module: 'Sales', action: 'create' },
  edit_contacts: { module: 'Sales', action: 'edit' },
  delete_contacts: { module: 'Sales', action: 'delete' },
  manage_contacts: { module: 'Sales', action: 'create' },

  // 6. Purchases, Debit Notes & Suppliers
  view_purchases: { module: 'Purchase', action: 'view' },
  create_purchases: { module: 'Purchase', action: 'create' },
  edit_purchases: { module: 'Purchase', action: 'edit' },
  delete_purchases: { module: 'Purchase', action: 'delete' },
  manage_purchases: { module: 'Purchase', action: 'create' },
  view_purchase: { module: 'Purchase', action: 'view' },
  manage_purchase: { module: 'Purchase', action: 'create' },

  view_debit_notes: { module: 'Purchase', action: 'view' },
  create_debit_notes: { module: 'Purchase', action: 'create' },
  edit_debit_notes: { module: 'Purchase', action: 'edit' },
  delete_debit_notes: { module: 'Purchase', action: 'delete' },

  create_purchase_returns: { module: 'Purchase', action: 'create' },

  view_suppliers: { module: 'Purchase', action: 'view' },
  create_suppliers: { module: 'Purchase', action: 'create' },
  edit_suppliers: { module: 'Purchase', action: 'edit' },
  delete_suppliers: { module: 'Purchase', action: 'delete' },

  // 7. Inventory, Products, Stock, Tax Slabs, Units & Price Lists
  view_products: { module: 'Inventory', action: 'view' },
  create_products: { module: 'Inventory', action: 'create' },
  edit_products: { module: 'Inventory', action: 'edit' },
  delete_products: { module: 'Inventory', action: 'delete' },
  manage_products: { module: 'Inventory', action: 'create' },

  view_stock: { module: 'Inventory', action: 'view' },
  create_stock: { module: 'Inventory', action: 'create' },
  edit_stock: { module: 'Inventory', action: 'edit' },
  delete_stock: { module: 'Inventory', action: 'delete' },
  manage_stock: { module: 'Inventory', action: 'create' },

  view_tax_slabs: { module: 'Inventory', action: 'view' },
  create_tax_slabs: { module: 'Inventory', action: 'create' },
  edit_tax_slabs: { module: 'Inventory', action: 'edit' },
  delete_tax_slabs: { module: 'Inventory', action: 'delete' },

  view_units: { module: 'Inventory', action: 'view' },
  create_units: { module: 'Inventory', action: 'create' },
  edit_units: { module: 'Inventory', action: 'edit' },
  delete_units: { module: 'Inventory', action: 'delete' },

  view_price_lists: { module: 'Inventory', action: 'view' },
  create_price_lists: { module: 'Inventory', action: 'create' },
  edit_price_lists: { module: 'Inventory', action: 'edit' },
  delete_price_lists: { module: 'Inventory', action: 'delete' },

  view_price_rules: { module: 'Inventory', action: 'view' },
  create_price_rules: { module: 'Inventory', action: 'create' },
  edit_price_rules: { module: 'Inventory', action: 'edit' },
  delete_price_rules: { module: 'Inventory', action: 'delete' },

  view_adjustments: { module: 'Inventory', action: 'view' },
  create_adjustments: { module: 'Inventory', action: 'create' },

  view_catalog_stock: { module: 'Inventory', action: 'view' },
  create_catalog_stock: { module: 'Inventory', action: 'create' },
  edit_catalog_stock: { module: 'Inventory', action: 'edit' },
  delete_catalog_stock: { module: 'Inventory', action: 'delete' },

  // 8. Finance, Accounts, Bank & Vouchers
  view_accounts: { module: 'Settings', action: 'view' },
  create_accounts: { module: 'Settings', action: 'create' },
  edit_accounts: { module: 'Settings', action: 'edit' },
  delete_accounts: { module: 'Settings', action: 'delete' },
  manage_accounts: { module: 'Settings', action: 'create' },

  view_vouchers: { module: 'Settings', action: 'view' },
  create_vouchers: { module: 'Settings', action: 'create' },
  edit_vouchers: { module: 'Settings', action: 'edit' },
  delete_vouchers: { module: 'Settings', action: 'delete' },

  view_ledgers: { module: 'Settings', action: 'view' },
  create_ledgers: { module: 'Settings', action: 'create' },
  edit_ledgers: { module: 'Settings', action: 'edit' },
  delete_ledgers: { module: 'Settings', action: 'delete' },

  view_clearance: { module: 'Settings', action: 'view' },
  create_clearance: { module: 'Settings', action: 'create' },
  edit_clearance: { module: 'Settings', action: 'edit' },
  delete_clearance: { module: 'Settings', action: 'delete' },

  view_journal_vouchers: { module: 'Settings', action: 'view' },
  create_journal_vouchers: { module: 'Settings', action: 'create' },
  edit_journal_vouchers: { module: 'Settings', action: 'edit' },
  delete_journal_vouchers: { module: 'Settings', action: 'delete' },

  view_contra_entries: { module: 'Settings', action: 'view' },
  create_contra_entries: { module: 'Settings', action: 'create' },
  edit_contra_entries: { module: 'Settings', action: 'edit' },
  delete_contra_entries: { module: 'Settings', action: 'delete' },

  view_finance: { module: 'Settings', action: 'view' },
  create_finance: { module: 'Settings', action: 'create' },
  edit_finance: { module: 'Settings', action: 'edit' },
  delete_finance: { module: 'Settings', action: 'delete' },
  manage_finance: { module: 'Settings', action: 'create' },

  view_bank_payments: { module: 'Settings', action: 'view' },
  create_bank_payments: { module: 'Settings', action: 'create' },
  edit_bank_payments: { module: 'Settings', action: 'edit' },
  delete_bank_payments: { module: 'Settings', action: 'delete' },

  view_bank_receipts: { module: 'Settings', action: 'view' },
  create_bank_receipts: { module: 'Settings', action: 'create' },
  edit_bank_receipts: { module: 'Settings', action: 'edit' },
  delete_bank_receipts: { module: 'Settings', action: 'delete' },

  view_journals: { module: 'Settings', action: 'view' },
  create_journals: { module: 'Settings', action: 'create' },
  edit_journals: { module: 'Settings', action: 'edit' },
  delete_journals: { module: 'Settings', action: 'delete' },

  view_currencies: { module: 'Settings', action: 'view' },
  create_currencies: { module: 'Settings', action: 'create' },

  // 9. Dashboard & Reports
  Dashboard: { module: 'Dashboard', action: 'view' },
  view_dashboard: { module: 'Dashboard', action: 'view' },
  view_reports: { module: 'Reports', action: 'view' },

  // 10. System, Users, Roles & Master Settings
  view_users: { module: 'Settings', action: 'view' },
  create_users: { module: 'Settings', action: 'create' },
  edit_users: { module: 'Settings', action: 'edit' },
  delete_users: { module: 'Settings', action: 'delete' },
  manage_users: { module: 'Settings', action: 'create' },

  view_roles: { module: 'Settings', action: 'view' },
  create_roles: { module: 'Settings', action: 'create' },
  edit_roles: { module: 'Settings', action: 'edit' },
  delete_roles: { module: 'Settings', action: 'delete' },
  manage_roles: { module: 'Settings', action: 'create' },

  view_branches: { module: 'Settings', action: 'view' },
  create_branches: { module: 'Settings', action: 'create' },
  edit_branches: { module: 'Settings', action: 'edit' },
  delete_branches: { module: 'Settings', action: 'delete' },

  view_branch_types: { module: 'Settings', action: 'view' },
  create_branch_types: { module: 'Settings', action: 'create' },
  edit_branch_types: { module: 'Settings', action: 'edit' },
  delete_branch_types: { module: 'Settings', action: 'delete' },

  view_cities: { module: 'Settings', action: 'view' },
  create_cities: { module: 'Settings', action: 'create' },
  edit_cities: { module: 'Settings', action: 'edit' },
  delete_cities: { module: 'Settings', action: 'delete' },

  view_count_types: { module: 'Settings', action: 'view' },
  create_count_types: { module: 'Settings', action: 'create' },
  edit_count_types: { module: 'Settings', action: 'edit' },
  delete_count_types: { module: 'Settings', action: 'delete' },

  view_couriers: { module: 'Settings', action: 'view' },
  create_couriers: { module: 'Settings', action: 'create' },
  edit_couriers: { module: 'Settings', action: 'edit' },
  delete_couriers: { module: 'Settings', action: 'delete' },

  view_departments: { module: 'Settings', action: 'view' },
  create_departments: { module: 'Settings', action: 'create' },
  edit_departments: { module: 'Settings', action: 'edit' },
  delete_departments: { module: 'Settings', action: 'delete' },

  view_designations: { module: 'Settings', action: 'view' },
  create_designations: { module: 'Settings', action: 'create' },
  edit_designations: { module: 'Settings', action: 'edit' },
  delete_designations: { module: 'Settings', action: 'delete' },

  view_hrms_settings: { module: 'Settings', action: 'view' },
  edit_hrms_settings: { module: 'Settings', action: 'edit' },

  view_settings: { module: 'Settings', action: 'view' },
  create_settings: { module: 'Settings', action: 'create' },
  edit_settings: { module: 'Settings', action: 'edit' },
  delete_settings: { module: 'Settings', action: 'delete' },
  manage_settings: { module: 'Settings', action: 'create' }
};

const ALL_MODULES = [
  'Dashboard',
  'Employee',
  'Attendance',
  'Leave',
  'Payroll',
  'Sales',
  'Purchase',
  'Inventory',
  'Reports',
  'Settings'
];

module.exports = {
  MODULE_KEY_MAP,
  ALL_MODULES
};
