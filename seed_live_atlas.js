const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load Models
const Company = require('./src/models/Company');
const Plan = require('./src/models/Plan');
const Role = require('./src/models/Role');
const User = require('./src/models/User');
const { Branch } = require('./src/models/Branch');
const { Warehouse } = require('./src/models/Warehouse');
const { Supplier } = require('./src/models/Supplier');
const { Customer } = require('./src/models/Customer');
const { Product } = require('./src/models/Product');
const AccountLedger = require('./src/models/AccountLedger');
const { Employee } = require('./src/models/Employee');
const { Purchase } = require('./src/models/Purchase');
const { Sale } = require('./src/models/Sale');
const { Payment } = require('./src/models/Payment');
const { Receipt } = require('./src/models/Receipt');
const { CreditNote } = require('./src/models/CreditNote');
const { DebitNote } = require('./src/models/DebitNote');
const { Journal } = require('./src/models/Journal');
const Payslip = require('./src/models/Payslip');

const ATLAS_BASE_URI = 'mongodb+srv://tiwarisoni671_db_user:HCBQL32nEKmtVe0V@cluster0.w5wpuw7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function seedDatabase(targetDbName) {
  try {
    console.log(`\n===========================================================`);
    console.log(`Connecting to Live MongoDB Atlas [Database: ${targetDbName}]...`);
    await mongoose.connect(ATLAS_BASE_URI, { dbName: targetDbName });
    console.log(`Connected to Live MongoDB Atlas [Database: ${targetDbName}] successfully!`);

    // ----------------------------------------------------
    // 0. SuperAdmin & Admin Roles & SuperAdmin User
    // ----------------------------------------------------
    let superAdminRole = await Role.findOne({ name: 'SuperAdmin' });
    if (!superAdminRole) {
      superAdminRole = await Role.create({
        name: 'SuperAdmin',
        description: 'Super Administrator with master access',
        permissions: ['manage_users', 'manage_roles', 'manage_accounts', 'manage_sales', 'manage_products', 'manage_purchases', 'view_reports', 'manage_companies']
      });
    }

    let adminRole = await Role.findOne({ name: 'Admin' });
    if (!adminRole) {
      adminRole = await Role.create({
        name: 'Admin',
        description: 'Company Administrator with full company management access',
        permissions: ['manage_all_company_data', 'view_sales', 'create_sales', 'edit_sales', 'view_purchases', 'create_purchases', 'view_products', 'view_accounts', 'view_hrms', 'view_payroll', 'view_reports']
      });
    }

    // Ensure superadmin@gmail.com user exists and has password Super123
    let superAdminUser = await User.findOne({ email: 'superadmin@gmail.com' });
    if (!superAdminUser) {
      superAdminUser = await User.create({
        username: 'superadmin',
        email: 'superadmin@gmail.com',
        password: 'Super123',
        role: superAdminRole._id,
        isActive: true
      });
      console.log('Created Super Admin User: superadmin@gmail.com / Super123');
    } else {
      superAdminUser.password = 'Super123';
      superAdminUser.role = superAdminRole._id;
      superAdminUser.isActive = true;
      await superAdminUser.save();
      console.log('Verified Super Admin User: superadmin@gmail.com / Super123');
    }

    // ----------------------------------------------------
    // 1. Subscription Plan for Super Admin
    // ----------------------------------------------------
    let pharmaPlan = await Plan.findOne({ name: 'Enterprise Pharma Plan' });
    if (!pharmaPlan) {
      pharmaPlan = await Plan.create({
        name: 'Enterprise Pharma Plan',
        price: 15000,
        durationDays: 365,
        billingCycle: '1 Year',
        subtitle: 'Complete Wholesale & Distribution Suite',
        themeColor: 'emerald',
        iconType: 'diamond',
        isPopular: true,
        features: ['Pharma Batch & Expiry', 'FIFO & FEFO Dispatch', 'Drug Licence Compliance', 'Multi-Warehouse', 'Automated GST Reconciliation', 'Financial Statements'],
        maxUsers: 50,
        maxBranches: 5,
        maxWarehouses: 5,
        maxInvoicesPerMonth: 0,
        isActive: true
      });
      console.log('Created Enterprise Pharma Subscription Plan.');
    }

    // ----------------------------------------------------
    // 2. Company Master: Apex Pharma Distributors
    // ----------------------------------------------------
    let apexCompany = await Company.findOne({ name: 'Apex Pharma Distributors' });
    if (!apexCompany) {
      apexCompany = new Company();
    }

    apexCompany.name = 'Apex Pharma Distributors';
    apexCompany.code = 'APD';
    apexCompany.email = 'admin@apexpharma.com';
    apexCompany.phone = '+91 94150 12345';
    apexCompany.website = 'https://apexpharma.example.com';
    apexCompany.address = 'Indira Nagar, Lucknow, Uttar Pradesh';
    apexCompany.city = 'Lucknow';
    apexCompany.state = 'Uttar Pradesh';
    apexCompany.gstin = '09AABCA1234D1Z5';
    apexCompany.ownerName = 'Amit Sharma';
    apexCompany.constitution = 'Proprietorship';
    apexCompany.businessType = 'Pharmaceutical wholesale and distribution';
    apexCompany.drugLicenceNo = 'UP-LKO-2026-DL-88910';
    apexCompany.drugLicenceValidity = '31/03/2031';
    apexCompany.authorisedPerson = 'Amit Sharma';
    apexCompany.financialYear = '2026-2027';
    apexCompany.currency = 'INR (₹)';
    apexCompany.valuationMethod = 'FIFO';
    apexCompany.dispatchMethod = 'FEFO';
    apexCompany.negativeStockAllowed = false;
    apexCompany.maxUsers = 50;
    apexCompany.maxBranches = 5;
    apexCompany.billingCycle = 'yearly';
    apexCompany.subscriptionPlan = pharmaPlan._id;
    apexCompany.subscriptionStatus = 'Active';
    apexCompany.subscriptionExpiry = new Date('2030-01-01T23:59:59Z');
    apexCompany.terms = 'Payment terms: 30 days net. FEFO batch rotation applied.';
    apexCompany.signature = 'Amit Sharma (Proprietor) - Apex Pharma Distributors';
    apexCompany.themeColor = '#059669';
    apexCompany.isActive = true;

    await apexCompany.save();
    const compId = apexCompany._id;
    console.log(`Company "${apexCompany.name}" ready on Atlas with ID: ${compId}`);

    // ----------------------------------------------------
    // 3. Company Admin User for Apex Pharma
    // ----------------------------------------------------
    // Primary admin: admin@apexpharma.com
    let apexAdminUser = await User.findOne({ email: 'admin@apexpharma.com' });
    if (!apexAdminUser) {
      apexAdminUser = await User.create({
        username: 'apexadmin',
        email: 'admin@apexpharma.com',
        password: 'ApexAdmin@123',
        role: adminRole._id,
        company: compId,
        phone: '+91 94150 12345',
        isActive: true
      });
      console.log('Created Company Admin User: admin@apexpharma.com / ApexAdmin@123');
    } else {
      apexAdminUser.password = 'ApexAdmin@123';
      apexAdminUser.role = adminRole._id;
      apexAdminUser.company = compId;
      apexAdminUser.isActive = true;
      await apexAdminUser.save();
      console.log('Updated Company Admin User: admin@apexpharma.com / ApexAdmin@123');
    }

    // Also update apexpharma@gmail.com and admin@gmail.com if they exist to match password ApexAdmin@123
    const otherAdmins = await User.find({ email: { $in: ['apexpharma@gmail.com', 'admin@gmail.com'] } });
    for (const oa of otherAdmins) {
      if (!oa.username) {
        oa.username = (oa.email.split('@')[0] || 'apexuser').toLowerCase();
      }
      oa.password = 'ApexAdmin@123';
      oa.role = adminRole._id;
      oa.company = compId;
      oa.isActive = true;
      await oa.save();
      console.log(`Synced password and username for ${oa.email} -> ApexAdmin@123`);
    }

    // ----------------------------------------------------
    // 4. Clean up previous test transactions for Apex Pharma
    // ----------------------------------------------------
    await Promise.all([
      Supplier.deleteMany({ company: compId }),
      Customer.deleteMany({ company: compId }),
      Product.deleteMany({ company: compId }),
      AccountLedger.deleteMany({ company: compId }),
      Employee.deleteMany({ $or: [{ company: compId }, { company: compId.toString() }, { employeeId: { $in: ['EMP-001', 'EMP-002', 'EMP-003'] } }] }),
      Purchase.deleteMany({ company: compId }),
      Sale.deleteMany({ company: compId }),
      Payment.deleteMany({ company: compId }),
      Receipt.deleteMany({ company: compId }),
      CreditNote.deleteMany({ company: compId }),
      DebitNote.deleteMany({ company: compId }),
      Journal.deleteMany({ company: compId }),
      Payslip.deleteMany({ company: compId }),
      Branch.deleteMany({ company: compId }),
      Warehouse.deleteMany({ company: compId })
    ]);
    console.log('Cleaned previous data for Apex Pharma Distributors.');

    // ----------------------------------------------------
    // 5. Branch & Warehouse
    // ----------------------------------------------------
    const mainBranch = await Branch.create({
      id: 'BR-001',
      code: 'LKO-HQ',
      name: 'Main Branch - Lucknow',
      manager: 'Amit Sharma',
      status: 'Active',
      contactPerson: 'Amit Sharma',
      mobile: '+91 94150 12345',
      email: 'admin@apexpharma.com',
      address1: 'Indira Nagar',
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      pincode: '226016',
      gstStatus: 'Registered',
      gstin: '09AABCA1234D1Z5',
      pan: 'AABCA1234D',
      company: compId
    });

    const mainWarehouse = await Warehouse.create({
      name: 'Main Pharma Godown',
      code: 'MPG-01',
      location: 'Indira Nagar, Lucknow',
      phone: '+91 94150 12345',
      email: 'godown@apexpharma.com',
      status: true,
      branch: mainBranch._id,
      company: compId
    });

    // ----------------------------------------------------
    // 6. Party Masters (Suppliers & Customers)
    // ----------------------------------------------------
    const sup1 = await Supplier.create({
      supplierCode: 'SUP-001',
      type: 'Manufacturer',
      companyName: 'Prime Pharma Laboratories',
      contactPerson: 'R. K. Gupta',
      phone: '+91 98390 11111',
      email: 'sales@primepharmalabs.com',
      category: 'Pharmaceuticals',
      gstStatus: 'Registered',
      gstin: '09AABCP1111E1Z1',
      pan: 'AABCP1111E',
      creditPeriod: 30,
      creditLimit: 200000,
      balance: 38000, // Due: 118,000 - 80,000 = 38,000
      drugLicenceNo: 'UP-DL-SUP-01',
      drugLicenceValidity: '31/12/2029',
      billingAddress: { street1: 'Industrial Area Phase 2', city: 'Kanpur', state: 'Uttar Pradesh', zip: '208001', country: 'India' },
      company: compId
    });

    const sup2 = await Supplier.create({
      supplierCode: 'SUP-002',
      type: 'Distributor',
      companyName: 'Modern Healthcare Distributors',
      contactPerson: 'Suresh Chandra',
      phone: '+91 98390 22222',
      email: 'orders@modernhealthcare.com',
      category: 'Pharmaceuticals',
      gstStatus: 'Registered',
      gstin: '09AABCM2222F1Z2',
      pan: 'AABCM2222F',
      creditPeriod: 30,
      creditLimit: 150000,
      balance: 21920, // Due: 64,900 - 30,000 - 12,980 (return) = 21,920
      drugLicenceNo: 'UP-DL-SUP-02',
      drugLicenceValidity: '31/12/2028',
      billingAddress: { street1: 'Transport Nagar', city: 'Lucknow', state: 'Uttar Pradesh', zip: '226012', country: 'India' },
      company: compId
    });

    const cus1 = await Customer.create({
      customerCode: 'CUS-001',
      name: 'City Care Medical Store',
      ownerName: 'Vikas Agarwal',
      contactPerson: 'Vikas Agarwal',
      businessName: 'City Care Medical Store',
      type: 'Retailer',
      phone: '+91 98390 33333',
      email: 'citycare.med@example.com',
      gstin: '09AABCC3333G1Z3',
      pan: 'AABCC3333G',
      creditPeriod: 15,
      creditLimit: 150000,
      openingBalance: 0,
      balance: 27350, // Due: 106,200 - 70,000 - 8,850 = 27,350
      balanceType: 'Dr',
      drugLicenceNo: 'UP-DL-CUS-01',
      drugLicenceValidity: '31/03/2030',
      billingAddress: { street: 'Hazratganj Main Market', city: 'Lucknow', state: 'Uttar Pradesh', zip: '226001' },
      company: compId
    });

    const cus2 = await Customer.create({
      customerCode: 'CUS-002',
      name: 'Sunrise Hospital Pharmacy',
      ownerName: 'Dr. Alok Verma',
      contactPerson: 'Manoj Kumar',
      businessName: 'Sunrise Hospital Pharmacy',
      type: 'Hospital',
      phone: '+91 98390 44444',
      email: 'pharmacy@sunrisehospital.example.com',
      gstin: '09AABCS4444H1Z4',
      pan: 'AABCS4444H',
      creditPeriod: 30,
      creditLimit: 200000,
      openingBalance: 0,
      balance: 26640, // Due: 56,640 - 30,000 = 26,640
      balanceType: 'Dr',
      drugLicenceNo: 'UP-DL-CUS-02',
      drugLicenceValidity: '31/03/2029',
      billingAddress: { street: 'Gomti Nagar', city: 'Lucknow', state: 'Uttar Pradesh', zip: '226010' },
      company: compId
    });

    // ----------------------------------------------------
    // 7. Product Master: Pharma Tablet A - Demo
    // ----------------------------------------------------
    const productA = await Product.create({
      productType: 'Standard',
      productName: 'Pharma Tablet A - Demo',
      productCode: 'PT-A',
      productUnit: 'BOX',
      saleUnit: 'BOX',
      purchaseUnit: 'BOX',
      productCost: '1000',
      productPrice: '1500',
      wholesalePrice: '1500',
      productTax: '18% sample GST',
      taxMethod: 'Exclusive',
      mrp: 2000,
      packingDetails: '10 strips x 10 tablets per BOX',
      negativeStockAllowed: false,
      valuation: 'FIFO',
      dispatchRule: 'FEFO',
      currentStock: 55, // Closing Stock: 15 (PTA-001) + 40 (PTA-002) = 55 BOX
      warehouseStocks: [{ warehouse: 'Main Pharma Godown', stock: 55 }],
      batches: [
        {
          batchNo: 'PTA-001',
          mfgDate: '2026-01-01',
          expDate: '2027-12-31',
          cost: 1000,
          purchaseQty: 100,
          soldQty: 90, // 60 sold + 30 sold
          returnedQty: 5, // 5 customer return
          remainingQty: 15,
          remainingValue: 15000
        },
        {
          batchNo: 'PTA-002',
          mfgDate: '2026-02-01',
          expDate: '2028-01-31',
          cost: 1100,
          purchaseQty: 50,
          soldQty: 0,
          returnedQty: 10, // 10 purchase return
          remainingQty: 40,
          remainingValue: 44000
        }
      ],
      costLayers: [
        { layer: 'PTA-001 (1,000)', costPerUnit: 1000, purchasedQty: 100, soldQty: 90, returnedQty: 5, remainingQty: 15, remainingValue: 15000 },
        { layer: 'PTA-002 (1,100)', costPerUnit: 1100, purchasedQty: 50, soldQty: 0, returnedQty: 10, remainingQty: 40, remainingValue: 44000 }
      ],
      company: compId
    });

    // ----------------------------------------------------
    // 8. Account Ledgers
    // ----------------------------------------------------
    const ledgersData = [
      { accountName: 'Business Bank Account', groupType: 'Asset', openingBalance: 801300, balanceType: 'Dr', description: 'Business Bank Account - Current' },
      { accountName: 'Cash', groupType: 'Asset', openingBalance: 108000, balanceType: 'Dr', description: 'Main Cash-in-Hand' },
      { accountName: 'Security Deposit', groupType: 'Asset', openingBalance: 40000, balanceType: 'Dr', description: 'Refundable office/godown security deposit' },
      { accountName: 'Furniture and medicine racks', groupType: 'Asset', openingBalance: 49500, balanceType: 'Dr', description: 'Furniture & Racks (Net of depreciation)' },
      { accountName: 'Computer', groupType: 'Asset', openingBalance: 39000, balanceType: 'Dr', description: 'Computer & IT Systems (Net of depreciation)' },
      { accountName: 'Prepaid Insurance', groupType: 'Asset', openingBalance: 11000, balanceType: 'Dr', description: '11 Months remaining prepaid insurance asset' },
      { accountName: 'Employee Advance - Rahul', groupType: 'Asset', openingBalance: 0, balanceType: 'Dr', description: 'Employee Advance Ledger' },
      { accountName: 'GST Input Credit (CGST)', groupType: 'Asset', openingBalance: 9315, balanceType: 'Dr', description: 'Input CGST after April set-off' },
      { accountName: 'GST Input Credit (SGST)', groupType: 'Asset', openingBalance: 9315, balanceType: 'Dr', description: 'Input SGST after April set-off' },
      { accountName: 'Owner Capital', groupType: 'Equity', openingBalance: 928500, balanceType: 'Cr', description: 'Owner Capital Closing Balance' },
      { accountName: 'Owner Drawings', groupType: 'Equity', openingBalance: 10000, balanceType: 'Dr', description: 'Owner Drawings' },
      { accountName: 'Business Loan', groupType: 'Liability', openingBalance: 190000, balanceType: 'Cr', description: 'Remaining Business Loan Principal' },
      { accountName: 'Other Salary Deduction Payable', groupType: 'Liability', openingBalance: 2000, balanceType: 'Cr', description: 'Other Salary Deduction Payable' },
      { accountName: 'Salary Payable', groupType: 'Liability', openingBalance: 0, balanceType: 'Cr', description: 'Salary Payable (Cleared)' },
      { accountName: 'Output CGST', groupType: 'Liability', openingBalance: 0, balanceType: 'Cr', description: 'Output CGST (Settled)' },
      { accountName: 'Output SGST', groupType: 'Liability', openingBalance: 0, balanceType: 'Cr', description: 'Output SGST (Settled)' },
      { accountName: 'Sales Account', groupType: 'Income', openingBalance: 130500, balanceType: 'Cr', description: 'Net Sales Revenue' },
      { accountName: 'Sales Return', groupType: 'Income', openingBalance: 7500, balanceType: 'Dr', description: 'Sales Return' },
      { accountName: 'Cost of Goods Sold (COGS)', groupType: 'Expense', openingBalance: 85000, balanceType: 'Dr', description: 'Net COGS for April' },
      { accountName: 'Inventory / Purchase', groupType: 'Asset', openingBalance: 59000, balanceType: 'Dr', description: 'Closing Inventory Value' },
      { accountName: 'Salary Expense', groupType: 'Expense', openingBalance: 70000, balanceType: 'Dr', description: 'Staff Salaries' },
      { accountName: 'Rent', groupType: 'Expense', openingBalance: 20000, balanceType: 'Dr', description: 'Godown & Office Rent' },
      { accountName: 'Electricity', groupType: 'Expense', openingBalance: 3500, balanceType: 'Dr', description: 'Electricity Expense' },
      { accountName: 'Internet', groupType: 'Expense', openingBalance: 1500, balanceType: 'Dr', description: 'Broadband / Internet' },
      { accountName: 'Marketing', groupType: 'Expense', openingBalance: 5000, balanceType: 'Dr', description: 'Pharma Marketing & Promotion' },
      { accountName: 'Stationery', groupType: 'Expense', openingBalance: 2000, balanceType: 'Dr', description: 'Office Stationery' },
      { accountName: 'Bank Charges', groupType: 'Expense', openingBalance: 500, balanceType: 'Dr', description: 'Bank Charges' },
      { accountName: 'Interest Expense', groupType: 'Expense', openingBalance: 2000, balanceType: 'Dr', description: 'Loan Interest' },
      { accountName: 'Insurance Expense', groupType: 'Expense', openingBalance: 1000, balanceType: 'Dr', description: 'Insurance Amortization' },
      { accountName: 'Depreciation Expense', groupType: 'Expense', openingBalance: 1500, balanceType: 'Dr', description: 'Depreciation Expense' }
    ];

    for (const l of ledgersData) {
      await AccountLedger.create({ ...l, company: compId });
    }

    // ----------------------------------------------------
    // 9. Employees (Rahul Verma, Neha Singh, Mohit Kumar)
    // ----------------------------------------------------
    const empRahul = await Employee.create({
      employeeId: 'EMP-001',
      employeeName: 'Rahul Verma',
      gender: 'Male',
      mobile: '+91 98390 55551',
      email: 'rahul.sales@apexpharma.com',
      department: 'Sales',
      role: 'Pharma Sales Executive',
      joiningDate: '2026-04-01',
      status: 'Active',
      grossSalary: 25000,
      basicSalary: 15000,
      hra: 6000,
      allowance: 4000,
      netSalary: 20000,
      company: compId.toString()
    });

    const empNeha = await Employee.create({
      employeeId: 'EMP-002',
      employeeName: 'Neha Singh',
      gender: 'Female',
      mobile: '+91 98390 55552',
      email: 'neha.acc@apexpharma.com',
      department: 'Finance',
      role: 'Accountant',
      joiningDate: '2026-04-01',
      status: 'Active',
      grossSalary: 25000,
      basicSalary: 15000,
      hra: 6000,
      allowance: 4000,
      netSalary: 23000,
      company: compId.toString()
    });

    const empMohit = await Employee.create({
      employeeId: 'EMP-003',
      employeeName: 'Mohit Kumar',
      gender: 'Male',
      mobile: '+91 98390 55553',
      email: 'mohit.store@apexpharma.com',
      department: 'Logistics',
      role: 'Store & Dispatch Executive',
      joiningDate: '2026-04-01',
      status: 'Active',
      grossSalary: 20000,
      basicSalary: 12000,
      hra: 5000,
      allowance: 3000,
      netSalary: 20000,
      company: compId.toString()
    });

    // ----------------------------------------------------
    // 10. Purchases (PPL-001, MHD-001, AST-001, AST-002)
    // ----------------------------------------------------
    // Asset Purchase: Furniture
    await Purchase.create({
      purchaseDate: '2026-04-03',
      purchaseType: 'Fixed Asset',
      billNo: 'BILL-001',
      referenceNo: '',
      purchaseNo: 'PUR-AST-01',
      invoiceNo: 'AST-FURN-01',
      company: compId,
      branch: mainBranch._id,
      warehouse: mainWarehouse._id,
      paymentTerm: 'Immediate',
      purchaseStatus: 'Received',
      paymentStatus: 'Paid',
      orderItems: [{
        name: 'Furniture and medicine racks',
        code: 'AST-FURN',
        quantity: 1,
        netUnitCost: 50000,
        taxPercent: 18,
        assetAccount: 'Furniture and medicine racks'
      }],
      grandTotal: 59000,
      amountPaid: 59000,
      createdAt: new Date('2026-04-03T10:00:00Z')
    });

    // Asset Purchase: Computer
    await Purchase.create({
      purchaseDate: '2026-04-03',
      purchaseType: 'Fixed Asset',
      billNo: 'BILL-002',
      referenceNo: '',
      purchaseNo: 'PUR-AST-02',
      invoiceNo: 'AST-COMP-01',
      company: compId,
      branch: mainBranch._id,
      warehouse: mainWarehouse._id,
      paymentTerm: 'Immediate',
      purchaseStatus: 'Received',
      paymentStatus: 'Paid',
      orderItems: [{
        name: 'Computer & Office Equipment',
        code: 'AST-COMP',
        quantity: 1,
        netUnitCost: 40000,
        taxPercent: 18,
        assetAccount: 'Computer'
      }],
      grandTotal: 47200,
      amountPaid: 47200,
      createdAt: new Date('2026-04-03T11:00:00Z')
    });

    // Trading Purchase: Prime Pharma Labs (PPL-001)
    await Purchase.create({
      purchaseDate: '2026-04-04',
      purchaseType: 'Trading Goods',
      billNo: 'BILL-003',
      referenceNo: '',
      purchaseNo: 'PUR-001',
      invoiceNo: 'PPL-001',
      company: compId,
      branch: mainBranch._id,
      warehouse: mainWarehouse._id,
      supplier: sup1._id,
      paymentTerm: '30',
      dueDate: '2026-05-04',
      purchaseStatus: 'Received',
      paymentStatus: 'Partial',
      orderItems: [{
        name: 'Pharma Tablet A - Demo',
        code: 'PT-A',
        quantity: 100,
        netUnitCost: 1000,
        taxPercent: 18,
        batch: 'PTA-001',
        mfgDate: '2026-01-01',
        expDate: '2027-12-31',
        product: productA._id
      }],
      orderTax: '18000',
      grandTotal: 118000,
      amountPaid: 80000, // Due: 38,000
      note: 'Voucher 07: 100 BOX at 1,000. Batch PTA-001',
      createdAt: new Date('2026-04-04T10:00:00Z')
    });

    // Trading Purchase: Modern Healthcare Distributors (MHD-001)
    await Purchase.create({
      purchaseDate: '2026-04-06',
      purchaseType: 'Trading Goods',
      billNo: 'BILL-004',
      referenceNo: '',
      purchaseNo: 'PUR-002',
      invoiceNo: 'MHD-001',
      company: compId,
      branch: mainBranch._id,
      warehouse: mainWarehouse._id,
      supplier: sup2._id,
      paymentTerm: '30',
      dueDate: '2026-05-06',
      purchaseStatus: 'Received',
      paymentStatus: 'Partial',
      orderItems: [{
        name: 'Pharma Tablet A - Demo',
        code: 'PT-A',
        quantity: 50,
        netUnitCost: 1100,
        taxPercent: 18,
        batch: 'PTA-002',
        mfgDate: '2026-02-01',
        expDate: '2028-01-31',
        product: productA._id
      }],
      orderTax: '9900',
      grandTotal: 64900,
      amountPaid: 30000, // Due after return: 21,920
      note: 'Voucher 08: 50 BOX at 1,100. Batch PTA-002',
      createdAt: new Date('2026-04-06T10:00:00Z')
    });

    // ----------------------------------------------------
    // 11. Debit Note (Purchase Return to MHD-001)
    // ----------------------------------------------------
    await DebitNote.create({
      debitNoteNo: 'DN-001',
      voucherNo: 'VCH-15',
      noteNo: 'DN-2026-01',
      date: '2026-04-15',
      company: compId,
      branch: 'Main Branch - Lucknow',
      warehouse: 'Main Pharma Godown',
      type: 'Purchase Return',
      status: 'Approved',
      supplier: 'Modern Healthcare Distributors',
      originalInvoiceNo: 'MHD-001',
      originalInvoiceDate: '2026-04-06',
      items: [{
        product: 'Pharma Tablet A - Demo',
        qty: 10,
        rate: 1100,
        amount: 11000,
        batch: 'PTA-002',
        unit: 'BOX'
      }],
      taxAmount: 1980,
      remarks: 'Voucher 15: Return 10 BOX at 1,100 to Modern Healthcare Distributors',
      summary: {
        subTotal: 11000,
        grandTotal: 12980
      },
      createdAt: new Date('2026-04-15T11:00:00Z')
    });

    // ----------------------------------------------------
    // 12. Sales (APD-001, APD-002)
    // ----------------------------------------------------
    await Sale.create({
      invoiceNo: 'APD-001',
      saleDate: '2026-04-08',
      referenceNo: 'VCH-10',
      biller: 'Apex Pharma Distributors',
      company: compId,
      branch: mainBranch._id,
      warehouse: mainWarehouse._id,
      customer: cus1._id,
      customerMobile: '+91 98390 33333',
      orderItems: [{
        name: 'Pharma Tablet A - Demo',
        code: 'PT-A',
        quantity: 60,
        netUnitPrice: 1500,
        taxPercent: 18,
        total: 106200,
        batch: 'PTA-001',
        expDate: '2027-12-31',
        product: productA._id
      }],
      orderTax: '16200',
      subTotal: 90000,
      taxTotal: 16200,
      grandTotal: 106200,
      paymentMode: 'Credit',
      paymentStatus: 'Partial',
      amountPaid: 70000, // Due: 106,200 - 70,000 - 8,850 (credit note) = 27,350
      saleStatus: 'Completed',
      saleNote: 'Voucher 10: 60 BOX at 1,500 to City Care Medical Store',
      createdAt: new Date('2026-04-08T10:00:00Z')
    });

    await Sale.create({
      invoiceNo: 'APD-002',
      saleDate: '2026-04-10',
      referenceNo: 'VCH-11',
      biller: 'Apex Pharma Distributors',
      company: compId,
      branch: mainBranch._id,
      warehouse: mainWarehouse._id,
      customer: cus2._id,
      customerMobile: '+91 98390 44444',
      orderItems: [{
        name: 'Pharma Tablet A - Demo',
        code: 'PT-A',
        quantity: 30,
        netUnitPrice: 1600,
        taxPercent: 18,
        total: 56640,
        batch: 'PTA-001',
        expDate: '2027-12-31',
        product: productA._id
      }],
      orderTax: '8640',
      subTotal: 48000,
      taxTotal: 8640,
      grandTotal: 56640,
      paymentMode: 'Credit',
      paymentStatus: 'Partial',
      amountPaid: 30000, // Due: 56,640 - 30,000 = 26,640
      saleStatus: 'Completed',
      saleNote: 'Voucher 11: 30 BOX at 1,600 to Sunrise Hospital Pharmacy',
      createdAt: new Date('2026-04-10T10:00:00Z')
    });

    // ----------------------------------------------------
    // 13. Credit Note (Sales Return from City Care)
    // ----------------------------------------------------
    await CreditNote.create({
      creditNoteNo: 'CN-001',
      voucherNo: 'VCH-14',
      noteNo: 'CN-2026-01',
      date: '2026-04-14',
      company: compId,
      branch: 'Main Branch - Lucknow',
      warehouse: 'Main Pharma Godown',
      type: 'Sales Return',
      status: 'Approved',
      customer: 'City Care Medical Store',
      customerCode: 'CUS-001',
      originalInvoiceNo: 'APD-001',
      originalInvoiceDate: '2026-04-08',
      items: [{
        product: 'Pharma Tablet A - Demo',
        batch: 'PTA-001',
        qty: 5,
        rate: 1500,
        taxPercent: 18,
        amount: 7500,
        quarantineStatus: 'Passed',
        inspectorName: 'Mohit Kumar'
      }],
      cgst: 675,
      sgst: 675,
      adjustInvoiceNo: 'APD-001',
      adjustAmount: 8850,
      summary: {
        subTotal: 7500,
        grandTotal: 8850
      },
      createdAt: new Date('2026-04-14T11:00:00Z')
    });

    // ----------------------------------------------------
    // 14. Receipts (Vouchers 01, 02, 12, 13)
    // ----------------------------------------------------
    await Receipt.create({
      receiptNo: 'RCP-001',
      voucherNo: 'VCH-01',
      receiptDate: '2026-04-01',
      receiptType: 'Capital',
      company: compId.toString(),
      customerParty: 'Amit Sharma (Owner)',
      paymentAmount: 1000000,
      paymentMethod: 'Bank & Cash Split',
      isSplitPayment: true,
      bankAmount: 900000,
      cashAmount: 100000,
      remarks: 'Voucher 01: Owner Capital Introduced (Bank 900,000 + Cash 100,000)',
      createdAt: new Date('2026-04-01T09:00:00Z')
    });

    await Receipt.create({
      receiptNo: 'RCP-002',
      voucherNo: 'VCH-02',
      receiptDate: '2026-04-01',
      receiptType: 'Loan',
      company: compId.toString(),
      customerParty: 'Business Loan Account',
      paymentAmount: 200000,
      paymentMethod: 'Bank',
      bankAmount: 200000,
      remarks: 'Voucher 02: Business Loan disbursed into Bank',
      createdAt: new Date('2026-04-01T10:00:00Z')
    });

    await Receipt.create({
      receiptNo: 'RCP-003',
      voucherNo: 'VCH-12',
      receiptDate: '2026-04-12',
      receiptType: 'Customer',
      company: compId.toString(),
      customerParty: 'City Care Medical Store',
      referenceInvoice: 'APD-001',
      paymentAmount: 70000,
      paymentMethod: 'Bank',
      bankAmount: 70000,
      remarks: 'Voucher 12: Payment from City Care Medical Store against APD-001',
      createdAt: new Date('2026-04-12T10:00:00Z')
    });

    await Receipt.create({
      receiptNo: 'RCP-004',
      voucherNo: 'VCH-13',
      receiptDate: '2026-04-13',
      receiptType: 'Customer',
      company: compId.toString(),
      customerParty: 'Sunrise Hospital Pharmacy',
      referenceInvoice: 'APD-002',
      paymentAmount: 30000,
      paymentMethod: 'Bank',
      bankAmount: 30000,
      remarks: 'Voucher 13: Payment from Sunrise Hospital Pharmacy against APD-002',
      createdAt: new Date('2026-04-13T10:00:00Z')
    });

    // ----------------------------------------------------
    // 15. Payments (Vouchers 03, 04, 05, 06, 09, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 27, 28)
    // ----------------------------------------------------
    const paymentsData = [
      { paymentNo: 'PAY-001', referenceNo: 'VCH-03', paymentDate: '2026-04-02', paymentType: 'Security Deposit', paymentAmount: 40000, paymentMethod: 'Bank', remarks: 'Refundable office/godown Security Deposit', createdAt: '2026-04-02T10:00:00Z' },
      { paymentNo: 'PAY-002', referenceNo: 'VCH-04', paymentDate: '2026-04-02', paymentType: 'Rent', paymentAmount: 20000, paymentMethod: 'Bank', remarks: 'April Rent', createdAt: '2026-04-02T11:00:00Z' },
      { paymentNo: 'PAY-003', referenceNo: 'VCH-05', paymentDate: '2026-04-03', paymentType: 'Fixed Asset', paymentAmount: 59000, paymentMethod: 'Bank', remarks: 'Furniture and medicine racks purchase', createdAt: '2026-04-03T10:00:00Z' },
      { paymentNo: 'PAY-004', referenceNo: 'VCH-06', paymentDate: '2026-04-03', paymentType: 'Fixed Asset', paymentAmount: 47200, paymentMethod: 'Bank', remarks: 'Computer IT systems purchase', createdAt: '2026-04-03T11:00:00Z' },
      { paymentNo: 'PAY-005', referenceNo: 'VCH-09', paymentDate: '2026-04-07', paymentType: 'Supplier', supplierParty: 'Prime Pharma Laboratories', invoiceNo: 'PPL-001', paymentAmount: 80000, paymentMethod: 'Bank', remarks: 'Payment to Prime Pharma Labs on PPL-001', createdAt: '2026-04-07T10:00:00Z' },
      { paymentNo: 'PAY-006', referenceNo: 'VCH-16', paymentDate: '2026-04-16', paymentType: 'Supplier', supplierParty: 'Modern Healthcare Distributors', invoiceNo: 'MHD-001', paymentAmount: 30000, paymentMethod: 'Bank', remarks: 'Payment to Modern Healthcare Distributors on MHD-001', createdAt: '2026-04-16T10:00:00Z' },
      { paymentNo: 'PAY-007', referenceNo: 'VCH-17', paymentDate: '2026-04-17', paymentType: 'Employee Advance', paymentAmount: 5000, paymentMethod: 'Bank', remarks: 'Employee Advance - Rahul Verma', createdAt: '2026-04-17T10:00:00Z' },
      { paymentNo: 'PAY-008', referenceNo: 'VCH-18', paymentDate: '2026-04-18', paymentType: 'Electricity', paymentAmount: 3500, paymentMethod: 'Bank', remarks: 'Electricity bill for April', createdAt: '2026-04-18T10:00:00Z' },
      { paymentNo: 'PAY-009', referenceNo: 'VCH-19', paymentDate: '2026-04-19', paymentType: 'Internet', paymentAmount: 1500, paymentMethod: 'Bank', remarks: 'Internet and communications bill', createdAt: '2026-04-19T10:00:00Z' },
      { paymentNo: 'PAY-010', referenceNo: 'VCH-20', paymentDate: '2026-04-20', paymentType: 'Marketing', paymentAmount: 5000, paymentMethod: 'Bank', remarks: 'Pharma Marketing & doctor visits promotional costs', createdAt: '2026-04-20T10:00:00Z' },
      { paymentNo: 'PAY-011', referenceNo: 'VCH-21', paymentDate: '2026-04-21', paymentType: 'Stationery', paymentAmount: 2000, paymentMethod: 'Cash', cashAmount: 2000, remarks: 'Printing, register and office stationery', createdAt: '2026-04-21T10:00:00Z' },
      { paymentNo: 'PAY-012', referenceNo: 'VCH-22', paymentDate: '2026-04-22', paymentType: 'Contra', paymentAmount: 20000, paymentMethod: 'Bank', cashAmount: 20000, remarks: 'Contra bank withdrawal for cash godown operations', createdAt: '2026-04-22T10:00:00Z' },
      { paymentNo: 'PAY-013', referenceNo: 'VCH-23', paymentDate: '2026-04-23', paymentType: 'Drawings', paymentAmount: 10000, paymentMethod: 'Cash', cashAmount: 10000, remarks: 'Owner drawings from Cash', createdAt: '2026-04-23T10:00:00Z' },
      { paymentNo: 'PAY-014', referenceNo: 'VCH-24', paymentDate: '2026-04-24', paymentType: 'Insurance', paymentAmount: 12000, paymentMethod: 'Bank', remarks: 'Prepaid Annual Insurance (12 months from 01 April 2026)', createdAt: '2026-04-24T10:00:00Z' },
      { paymentNo: 'PAY-015', referenceNo: 'VCH-25', paymentDate: '2026-04-25', paymentType: 'Bank Charges', paymentAmount: 500, paymentMethod: 'Bank', remarks: 'Bank ledger maintenance and cheque book charges', createdAt: '2026-04-25T10:00:00Z' },
      { paymentNo: 'PAY-016', referenceNo: 'VCH-27', paymentDate: '2026-04-30', paymentType: 'Payroll', paymentAmount: 63000, paymentMethod: 'Bank', remarks: 'April Salary Net Pay (Rahul 20k + Neha 23k + Mohit 20k)', createdAt: '2026-04-30T16:00:00Z' },
      { paymentNo: 'PAY-017', referenceNo: 'VCH-28', paymentDate: '2026-04-30', paymentType: 'Loan Repayment', paymentAmount: 12000, principalAmount: 10000, interestAmount: 2000, paymentMethod: 'Bank', remarks: 'Business Loan instalment: Principal 10,000 + Interest 2,000', createdAt: '2026-04-30T17:00:00Z' }
    ];

    for (const p of paymentsData) {
      await Payment.create({
        ...p,
        company: compId,
        createdAt: new Date(p.createdAt)
      });
    }

    // ----------------------------------------------------
    // 16. Payslips for April 2026 (Vouchers 26 & 27)
    // ----------------------------------------------------
    await Payslip.create({
      employee: empRahul._id,
      month: 'April',
      year: '2026',
      workingDays: 30,
      paidDays: 30,
      basicSalary: 15000,
      hra: 6000,
      otherAllowances: 4000,
      grossEarnings: 25000,
      advanceDeduction: 5000,
      otherDeduction: 0,
      totalDeductions: 5000,
      netPay: 20000,
      status: 'Paid',
      company: compId
    });

    await Payslip.create({
      employee: empNeha._id,
      month: 'April',
      year: '2026',
      workingDays: 30,
      paidDays: 30,
      basicSalary: 15000,
      hra: 6000,
      otherAllowances: 4000,
      grossEarnings: 25000,
      advanceDeduction: 0,
      otherDeduction: 2000,
      otherDeductionTitle: 'Other Salary Deduction Payable',
      totalDeductions: 2000,
      netPay: 23000,
      status: 'Paid',
      company: compId
    });

    await Payslip.create({
      employee: empMohit._id,
      month: 'April',
      year: '2026',
      workingDays: 30,
      paidDays: 30,
      basicSalary: 12000,
      hra: 5000,
      otherAllowances: 3000,
      grossEarnings: 20000,
      advanceDeduction: 0,
      otherDeduction: 0,
      totalDeductions: 0,
      netPay: 20000,
      status: 'Paid',
      company: compId
    });

    // ----------------------------------------------------
    // 17. Journals (Adjustments: Vouchers 01, 26, 29, 30, 31)
    // ----------------------------------------------------
    await Journal.create({
      journalNo: 'JRN-001',
      journalDate: '2026-04-01',
      referenceNo: 'VCH-01',
      company: compId,
      narration: 'Voucher 01: Capital Introduced: Bank Dr 900,000; Cash Dr 100,000; Owner Capital Cr 1,000,000',
      entries: [
        { account: 'Business Bank Account', debit: 900000, credit: 0 },
        { account: 'Cash', debit: 100000, credit: 0 },
        { account: 'Owner Capital', debit: 0, credit: 1000000 }
      ],
      totals: { debit: 1000000, credit: 1000000 },
      createdAt: new Date('2026-04-01T09:00:00Z')
    });

    await Journal.create({
      journalNo: 'JRN-002',
      journalDate: '2026-04-30',
      referenceNo: 'VCH-26',
      company: compId,
      narration: 'Voucher 26: Salary Accrual: Salary Expense Dr 70,000; Advance Rahul Cr 5,000; Other Deduction Cr 2,000; Salary Payable Cr 63,000',
      entries: [
        { account: 'Salary Expense', debit: 70000, credit: 0 },
        { account: 'Employee Advance - Rahul', debit: 0, credit: 5000 },
        { account: 'Other Salary Deduction Payable', debit: 0, credit: 2000 },
        { account: 'Salary Payable', debit: 0, credit: 63000 }
      ],
      totals: { debit: 70000, credit: 70000 },
      createdAt: new Date('2026-04-30T15:00:00Z')
    });

    await Journal.create({
      journalNo: 'JRN-003',
      journalDate: '2026-04-30',
      referenceNo: 'VCH-29',
      company: compId,
      narration: 'Voucher 29: Monthly Insurance Amortization: Insurance Expense Dr 1,000; Prepaid Insurance Cr 1,000',
      entries: [
        { account: 'Insurance Expense', debit: 1000, credit: 0 },
        { account: 'Prepaid Insurance', debit: 0, credit: 1000 }
      ],
      totals: { debit: 1000, credit: 1000 },
      createdAt: new Date('2026-04-30T17:30:00Z')
    });

    await Journal.create({
      journalNo: 'JRN-004',
      journalDate: '2026-04-30',
      referenceNo: 'VCH-30',
      company: compId,
      narration: 'Voucher 30: Depreciation Expense Dr 1,500; Accumulated Depreciation - Furniture Cr 500; Accumulated Depreciation - Computer Cr 1,000',
      entries: [
        { account: 'Depreciation Expense', debit: 1500, credit: 0 },
        { account: 'Accumulated Depreciation - Furniture and Computer', debit: 0, credit: 500 },
        { account: 'Accumulated Depreciation - Computer', debit: 0, credit: 1000 }
      ],
      totals: { debit: 1500, credit: 1500 },
      createdAt: new Date('2026-04-30T18:00:00Z')
    });

    await Journal.create({
      journalNo: 'JRN-005',
      journalDate: '2026-04-30',
      referenceNo: 'VCH-31',
      company: compId,
      narration: 'Voucher 31: GST Set-Off: Output CGST Dr 11,745 / Input CGST Cr 11,745; Output SGST Dr 11,745 / Input SGST Cr 11,745',
      entries: [
        { account: 'Output CGST', debit: 11745, credit: 0 },
        { account: 'GST Input Credit (CGST)', debit: 0, credit: 11745 },
        { account: 'Output SGST', debit: 11745, credit: 0 },
        { account: 'GST Input Credit (SGST)', debit: 0, credit: 11745 }
      ],
      totals: { debit: 23490, credit: 23490 },
      createdAt: new Date('2026-04-30T19:00:00Z')
    });

    console.log(`LIVE ATLAS [${targetDbName}] SEEDED WITH 100% PRECISION!`);
    console.log('Company ID:', compId);
    console.log('Super Admin: superadmin@gmail.com / Super123');
    console.log('Company Admin: admin@apexpharma.com / ApexAdmin@123');
    console.log('===========================================================');

    await mongoose.disconnect();
  } catch (err) {
    console.error(`Atlas Seeding Error for [${targetDbName}]:`, err);
    try { await mongoose.disconnect(); } catch(_) {}
    throw err;
  }
}

async function runAll() {
  try {
    await seedDatabase('erp_global');
    await seedDatabase('test');
    console.log('\n>>> BOTH erp_global AND test DATABASES FULLY SEEDED ON LIVE ATLAS! <<<');
    process.exit(0);
  } catch (e) {
    console.error('Fatal error during seeding:', e);
    process.exit(1);
  }
}

runAll();
