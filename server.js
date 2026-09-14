const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const { errorHandler } = require('./src/middlewares/errorMiddleware');
const mongoose = require('mongoose');
const tenantPlugin = require('./src/plugins/tenantPlugin');
const { tenantContextMiddleware } = require('./src/middlewares/tenantContext');

// Apply Mongoose Tenant Isolation Plugin Globally
mongoose.plugin(tenantPlugin);

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Standard Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup AsyncLocalStorage for Tenant Isolation
app.use(tenantContextMiddleware);

// Basic Status Route
app.get('/api/status', (req, res) => {
  res.json({ status: 'success', message: 'ERP Global Backend API is running smoothly' });
});

// Auth Routes
const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

// SaaS Company Management Routes (SuperAdmin)
const companyRoutes = require('./src/routes/companyRoutes');
app.use('/api/companies', companyRoutes);

// SaaS Plan Management Routes (SuperAdmin)
const planRoutes = require('./src/routes/planRoutes');
app.use('/api/plans', planRoutes);

// Company Level User & Role Management Routes
const userRoutes = require('./src/routes/userRoutes');
app.use('/api/users', userRoutes);

const roleRoutes = require('./src/routes/roleRoutes');
app.use('/api/roles', roleRoutes);

// Product Routes
const productRoutes = require('./src/routes/productRoutes');
app.use('/api/products', productRoutes);

// Sales Routes
const saleRoutes = require('./src/routes/saleRoutes');
app.use('/api/sales', saleRoutes);

// Purchase Routes
const purchaseRoutes = require('./src/routes/purchaseRoutes');
app.use('/api/purchases', purchaseRoutes);

// Old Account Routes removed
// const accountRoutes = require('./src/routes/accountRoutes');
// app.use('/api/accounts', accountRoutes);

// Debit Note Routes
const debitNoteRoutes = require('./src/routes/debitNoteRoutes');
app.use('/api/debit-notes', debitNoteRoutes);

// Credit Note Routes
const creditNoteRoutes = require('./src/routes/creditNoteRoutes');
app.use('/api/credit-notes', creditNoteRoutes);

// Clearance Routes
const clearanceRoutes = require('./src/routes/clearanceRoutes');
app.use('/api/clearances', clearanceRoutes);

// Bank Payment Routes
const bankPaymentRoutes = require('./src/routes/bankPaymentRoutes');
app.use('/api/payments', bankPaymentRoutes);

// Contra Entry Routes
const contraEntryRoutes = require('./src/routes/contraEntryRoutes');
app.use('/api/contra-entries', contraEntryRoutes);

// Journal Voucher Routes
const journalVoucherRoutes = require('./src/routes/journalVoucherRoutes');
app.use('/api/journal-vouchers', journalVoucherRoutes);

// Stock Entry Routes
const stockEntryRoutes = require('./src/routes/stockEntryRoutes');
app.use('/api/stock-entries', stockEntryRoutes);

// Stock Transfer Routes
const stockTransferRoutes = require('./src/routes/stockTransferRoutes');
app.use('/api/stock-transfers', stockTransferRoutes);

// Old HRMS Routes Removed
// const hrmsRoutes = require('./src/routes/hrmsRoutes');
// app.use('/api/hrms', hrmsRoutes);

// Employee Routes
const employeeRoutes = require('./src/routes/employeeRoutes');
app.use('/api/employees', employeeRoutes);

// Expense Claim Routes
const expenseClaimRoutes = require('./src/routes/expenseClaimRoutes');
app.use('/api/expenses', expenseClaimRoutes);

// Performance Rating Routes
const performanceRatingRoutes = require('./src/routes/performanceRatingRoutes');
app.use('/api/performance', performanceRatingRoutes);

// Employee Target Routes
const employeeTargetRoutes = require('./src/routes/employeeTargetRoutes');
app.use('/api/targets', employeeTargetRoutes);

// Department Routes
const departmentRoutes = require('./src/routes/departmentRoutes');
app.use('/api/departments', departmentRoutes);

// Designation Routes
const designationRoutes = require('./src/routes/designationRoutes');
app.use('/api/designations', designationRoutes);

// Shift Timing Routes
const shiftTimingRoutes = require('./src/routes/shiftTimingRoutes');
app.use('/api/shift-timings', shiftTimingRoutes);

// HRMS Master Settings Routes
const hrmsMasterSettingRoutes = require('./src/routes/hrmsMasterSettingRoutes');
app.use('/api/hrms-settings', hrmsMasterSettingRoutes);

// Leave Request Routes
const leaveRequestRoutes = require('./src/routes/leaveRequestRoutes');
app.use('/api/leave-requests', leaveRequestRoutes);

// Holiday Routes
const holidayRoutes = require('./src/routes/holidayRoutes');
app.use('/api/holidays', holidayRoutes);

// Attendance Routes
const attendanceRoutes = require('./src/routes/attendanceRoutes');
app.use('/api/attendances', attendanceRoutes);

// Salary Structure Routes
const salaryStructureRoutes = require('./src/routes/salaryStructureRoutes');
app.use('/api/salary-structures', salaryStructureRoutes);

// Payslip Routes
const payslipRoutes = require('./src/routes/payslipRoutes');
app.use('/api/payslips', payslipRoutes);

// Statutory Routes (PF & ESI)
const statutoryRoutes = require('./src/routes/statutoryRoutes');
app.use('/api/statutory', statutoryRoutes);

// Accounting & Voucher Routes
const accountLedgerRoutes = require('./src/routes/accountLedgerRoutes');
app.use('/api/ledgers', accountLedgerRoutes);

const voucherRoutes = require('./src/routes/voucherRoutes');
app.use('/api/vouchers', voucherRoutes);

const financialReportRoutes = require('./src/routes/financialReportRoutes');
app.use('/api/reports/financial', financialReportRoutes);

const analysisReportRoutes = require('./src/routes/analysisReportRoutes');
app.use('/api/reports/analysis', analysisReportRoutes);

// Customer Routes
const customerRoutes = require('./src/routes/customerRoutes');
app.use('/api/customers', customerRoutes);

// Supplier Routes
const supplierRoutes = require('./src/routes/supplierRoutes');
app.use('/api/suppliers', supplierRoutes);

// Unit Routes
const unitRoutes = require('./src/routes/unitRoutes');
app.use('/api/units', unitRoutes);

// Stock Count Routes
const stockCountRoutes = require('./src/routes/stockCountRoutes');
app.use('/api/stock-counts', stockCountRoutes);

// Stock Report Routes
const stockReportRoutes = require('./src/routes/stockReportRoutes');
app.use('/api/reports/stock', stockReportRoutes);

// Price List Routes
const priceListRoutes = require('./src/routes/priceListRoutes');
app.use('/api/price-lists', priceListRoutes);

// Price Rule Routes
const priceRuleRoutes = require('./src/routes/priceRuleRoutes');
app.use('/api/price-rules', priceRuleRoutes);

// Tax Slab Routes
const taxSlabRoutes = require('./src/routes/taxSlabRoutes');
app.use('/api/tax-slabs', taxSlabRoutes);

// HSN Mapping Routes
const hsnMappingRoutes = require('./src/routes/hsnMappingRoutes');
app.use('/api/hsn-mappings', hsnMappingRoutes);

// Branch Routes
const branchRoutes = require('./src/routes/branchRoutes');
app.use('/api/branches', branchRoutes);

// Dashboard Analytics Routes
const dashboardRoutes = require('./src/routes/dashboardRoutes');
app.use('/api/dashboard', dashboardRoutes);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

module.exports = app;
