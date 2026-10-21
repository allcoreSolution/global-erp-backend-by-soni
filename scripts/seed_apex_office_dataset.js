const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const LOCAL_URI = 'mongodb://127.0.0.1:27017/erp_global';
const ATLAS_URI = 'mongodb+srv://tiwarisoni671_db_user:HCBQL32nEKmtVe0V@cluster0.w5wpuw7.mongodb.net/erp_global?retryWrites=true&w=majority&appName=Cluster0';

async function seedApexOffice(mongoUri, targetName = 'Target Database') {
  console.log(`\n======================================================`);
  console.log(`🚀 CONNECTING & SEEDING TO: ${targetName}`);
  console.log(`URI: ${mongoUri.includes('@') ? mongoUri.split('@')[1] : mongoUri}`);
  console.log(`======================================================\n`);

  const conn = await mongoose.createConnection(mongoUri).asPromise();
  const db = conn.db;

  console.log('--- 1. COMPANY MASTER: Apex Office Solutions ---');
  let company = await db.collection('companies').findOne({ code: 'AOS' });
  if (!company) {
    company = await db.collection('companies').findOne({ name: 'Apex Office Solutions' });
  }

  const companyData = {
    name: 'Apex Office Solutions',
    code: 'AOS',
    email: 'info@apexofficesolutions.com',
    phone: '+91 9876543222',
    website: 'https://apexofficesolutions.com',
    address: 'Indira Nagar, Lucknow, Uttar Pradesh',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    gstin: '09AABCA1234F1Z5',
    pan: 'AABCA1234F',
    businessType: 'Office furniture trading',
    constitution: 'Proprietorship',
    ownerName: 'Amit Sharma',
    billingCycle: 'yearly',
    financialYear: '2026-2027',
    currency: 'INR (₹)',
    dateFormat: 'YYYY-MM-DD',
    invoicePrefix: 'AOS-',
    terms: 'Payment is due within credit period.',
    signature: 'Amit Sharma - Proprietor',
    valuationMethod: 'FIFO',
    dispatchMethod: 'FIFO',
    negativeStockAllowed: false,
    isActive: true,
    createdAt: new Date('2026-04-01T09:00:00Z'),
    updatedAt: new Date('2026-04-01T09:00:00Z')
  };

  if (!company) {
    const compRes = await db.collection('companies').insertOne(companyData);
    company = { _id: compRes.insertedId, ...companyData };
    console.log(`✓ Created Company: ${company.name} [ID: ${company._id}]`);
  } else {
    await db.collection('companies').updateOne({ _id: company._id }, { $set: companyData });
    console.log(`✓ Updated Company: ${company.name} [ID: ${company._id}]`);
  }

  const companyId = company._id;
  const companyStr = companyId.toString();

  console.log('\n--- 2. ADMIN USER: apexoffice@gmail.com ---');
  let adminRole = await db.collection('roles').findOne({ name: 'Admin' });
  if (!adminRole) {
    const rRes = await db.collection('roles').insertOne({
      name: 'Admin',
      description: 'System Administrator with full access',
      permissions: ['ALL'],
      createdAt: new Date()
    });
    adminRole = { _id: rRes.insertedId, name: 'Admin' };
  }
  const hashedPassword = await bcrypt.hash('password123', 10);

  let user = await db.collection('users').findOne({ $or: [{ email: 'apexoffice@gmail.com' }, { username: 'apexoffice' }] });
  const userData = {
    username: 'apexoffice',
    name: 'Amit Sharma',
    email: 'apexoffice@gmail.com',
    password: hashedPassword,
    role: adminRole._id,
    company: companyId,
    isActive: true,
    updatedAt: new Date()
  };

  if (!user) {
    userData.createdAt = new Date('2026-04-01T09:00:00Z');
    const uRes = await db.collection('users').insertOne(userData);
    user = { _id: uRes.insertedId, ...userData };
    console.log(`✓ Created User: ${user.email} (Username: apexoffice, Password: password123)`);
  } else {
    await db.collection('users').updateOne({ _id: user._id }, { $set: userData });
    console.log(`✓ Updated User: ${user.email}`);
  }

  console.log('\n--- 3. BRANCH & WAREHOUSE ---');
  let branch = await db.collection('branches').findOne({ code: 'AOS-LKO', company: companyId });
  if (!branch) {
    const bRes = await db.collection('branches').insertOne({
      id: 'BR-AOS-01',
      code: 'AOS-LKO',
      name: 'Lucknow Main Branch',
      manager: 'Amit Sharma',
      status: 'Active',
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      company: companyId,
      createdAt: new Date('2026-04-01T09:00:00Z'),
      updatedAt: new Date()
    });
    branch = { _id: bRes.insertedId, name: 'Lucknow Main Branch' };
  }
  console.log(`✓ Branch: ${branch.name}`);

  let warehouse = await db.collection('warehouses').findOne({ name: 'Main Godown', company: companyId });
  if (!warehouse) {
    const wRes = await db.collection('warehouses').insertOne({
      name: 'Main Godown',
      code: 'WH-AOS-01',
      location: 'Indira Nagar, Lucknow',
      status: true,
      branch: branch._id,
      company: companyId,
      createdAt: new Date('2026-04-01T09:00:00Z'),
      updatedAt: new Date()
    });
    warehouse = { _id: wRes.insertedId, name: 'Main Godown' };
  }
  console.log(`✓ Warehouse: ${warehouse.name}`);

  console.log('\n--- 4. ACCOUNT LEDGERS (32 LEDGERS) ---');
  const ledgersToCreate = [
    { accountName: 'Owner Capital', groupType: 'Equity', balanceType: 'Cr', description: 'Amit Sharma Capital A/C' },
    { accountName: 'Owner Drawings', groupType: 'Equity', balanceType: 'Dr', description: 'Drawings for personal use' },
    { accountName: 'Business Loan', groupType: 'Liability', balanceType: 'Cr', description: 'Business Loan A/C' },
    { accountName: 'Business Bank Account', groupType: 'Asset', balanceType: 'Dr', description: 'Main Bank Account' },
    { accountName: 'Cash', groupType: 'Asset', balanceType: 'Dr', description: 'Cash in Hand' },
    { accountName: 'Security Deposit', groupType: 'Asset', balanceType: 'Dr', description: 'Refundable Godown/Office Deposit' },
    { accountName: 'Furniture', groupType: 'Asset', balanceType: 'Dr', description: 'Fixed Asset - Office Furniture' },
    { accountName: 'Computer', groupType: 'Asset', balanceType: 'Dr', description: 'Fixed Asset - Office Computers' },
    { accountName: 'Prepaid Insurance', groupType: 'Asset', balanceType: 'Dr', description: 'Prepaid Business Insurance' },
    { accountName: 'Employee Advance - Rahul', groupType: 'Asset', balanceType: 'Dr', description: 'Advance against salary' },
    { accountName: 'Inventory / Purchase', groupType: 'Asset', balanceType: 'Dr', description: 'Trading Goods / Purchases' },
    { accountName: 'Sales', groupType: 'Income', balanceType: 'Cr', description: 'Office Furniture Trading Sales' },
    { accountName: 'Sales Return', groupType: 'Income', balanceType: 'Dr', description: 'Returns from Customers' },
    { accountName: 'Purchase Return', groupType: 'Expense', balanceType: 'Cr', description: 'Returns to Suppliers' },
    { accountName: 'COGS', groupType: 'Expense', balanceType: 'Dr', description: 'Cost of Goods Sold' },
    { accountName: 'Input CGST', groupType: 'Asset', balanceType: 'Dr', description: 'Input Central GST Credit' },
    { accountName: 'Input SGST', groupType: 'Asset', balanceType: 'Dr', description: 'Input State GST Credit' },
    { accountName: 'Output CGST', groupType: 'Liability', balanceType: 'Cr', description: 'Output Central GST Collected' },
    { accountName: 'Output SGST', groupType: 'Liability', balanceType: 'Cr', description: 'Output State GST Collected' },
    { accountName: 'Salary Expense', groupType: 'Expense', balanceType: 'Dr', description: 'Staff Salaries' },
    { accountName: 'Salary Payable', groupType: 'Liability', balanceType: 'Cr', description: 'Salary Liability' },
    { accountName: 'Other Salary Deduction Payable', groupType: 'Liability', balanceType: 'Cr', description: 'Staff Deductions' },
    { accountName: 'Rent', groupType: 'Expense', balanceType: 'Dr', description: 'Godown & Office Rent' },
    { accountName: 'Electricity', groupType: 'Expense', balanceType: 'Dr', description: 'Utility - Electricity' },
    { accountName: 'Internet', groupType: 'Expense', balanceType: 'Dr', description: 'Utility - Internet' },
    { accountName: 'Marketing', groupType: 'Expense', balanceType: 'Dr', description: 'Sales & Promotion' },
    { accountName: 'Stationery', groupType: 'Expense', balanceType: 'Dr', description: 'Office Stationery' },
    { accountName: 'Bank Charges', groupType: 'Expense', balanceType: 'Dr', description: 'Bank fee and charges' },
    { accountName: 'Interest', groupType: 'Expense', balanceType: 'Dr', description: 'Interest on Business Loan' },
    { accountName: 'Insurance', groupType: 'Expense', balanceType: 'Dr', description: 'Monthly Insurance Expense' },
    { accountName: 'Depreciation', groupType: 'Expense', balanceType: 'Dr', description: 'Asset Depreciation' },
    { accountName: 'Accumulated Depreciation - Furniture', groupType: 'Asset', balanceType: 'Cr', description: 'Contra Asset - Furniture' },
    { accountName: 'Accumulated Depreciation - Computer', groupType: 'Asset', balanceType: 'Cr', description: 'Contra Asset - Computer' }
  ];

  const ledgerMap = {};
  for (const item of ledgersToCreate) {
    let ledger = await db.collection('accountledgers').findOne({ accountName: item.accountName, company: companyId });
    if (!ledger) {
      const lRes = await db.collection('accountledgers').insertOne({
        ...item,
        openingBalance: 0,
        isActive: true,
        company: companyId,
        createdAt: new Date('2026-04-01T09:00:00Z'),
        updatedAt: new Date()
      });
      ledger = { _id: lRes.insertedId, ...item };
    }
    ledgerMap[item.accountName] = ledger._id;
  }
  console.log(`✓ Verified & Created ${Object.keys(ledgerMap).length} Account Ledgers.`);

  console.log('\n--- 5. SUPPLIERS (SUP-001 & SUP-002) ---');
  try {
    await db.collection('suppliers').dropIndex('supplierCode_1');
  } catch (e) {}
  try {
    await db.collection('suppliers').createIndex({ supplierCode: 1, company: 1 }, { unique: true });
  } catch (e) {}
  await db.collection('suppliers').deleteMany({ company: companyId });

  const suppliers = [
    {
      supplierCode: 'SUP-001',
      type: 'Supplier',
      companyName: 'Prime Furniture Traders',
      contactPerson: 'Ramesh Patel',
      phone: '+91 9839111111',
      email: 'sales@primefurniture.com',
      paymentTerms: '30 days',
      creditPeriod: 30,
      creditLimit: 200000,
      balance: 38000, // 118,000 - 80,000 payment = 38,000
      openingBalance: 0,
      gstStatus: 'Registered',
      gstin: '09AABCP9999A1Z1',
      pan: 'AABCP9999A',
      taxPreference: 'Taxable',
      billingAddress: { street1: 'Phase 2, Transport Nagar', city: 'Lucknow', state: 'Uttar Pradesh', zip: '226012', country: 'India' },
      shippingAddress: { street1: 'Phase 2, Transport Nagar', city: 'Lucknow', state: 'Uttar Pradesh', zip: '226012', country: 'India' },
      company: companyId,
      status: true,
      createdAt: new Date('2026-04-01T10:00:00Z'),
      updatedAt: new Date()
    },
    {
      supplierCode: 'SUP-002',
      type: 'Supplier',
      companyName: 'Modern Office Products',
      contactPerson: 'Suresh Kumar',
      phone: '+91 9839222222',
      email: 'orders@modernoffice.com',
      paymentTerms: '30 days',
      creditPeriod: 30,
      creditLimit: 150000,
      balance: 21920, // 64,900 - 30,000 payment - 12,980 return = 21,920
      openingBalance: 0,
      gstStatus: 'Registered',
      gstin: '09AABCM8888B1Z2',
      pan: 'AABCM8888B',
      taxPreference: 'Taxable',
      billingAddress: { street1: 'Hazratganj Commercial Plaza', city: 'Lucknow', state: 'Uttar Pradesh', zip: '226001', country: 'India' },
      shippingAddress: { street1: 'Hazratganj Commercial Plaza', city: 'Lucknow', state: 'Uttar Pradesh', zip: '226001', country: 'India' },
      company: companyId,
      status: true,
      createdAt: new Date('2026-04-01T10:00:00Z'),
      updatedAt: new Date()
    }
  ];

  const suppRes = await db.collection('suppliers').insertMany(suppliers);
  const supp1Id = suppRes.insertedIds[0];
  const supp2Id = suppRes.insertedIds[1];
  console.log(`✓ Inserted 2 Suppliers: Prime Furniture Traders & Modern Office Products`);

  console.log('\n--- 6. CUSTOMERS (CUS-001 & CUS-002) ---');
  try {
    await db.collection('customers').dropIndex('customerCode_1');
  } catch (e) {}
  try {
    await db.collection('customers').createIndex({ customerCode: 1, company: 1 }, { unique: true });
  } catch (e) {}
  await db.collection('customers').deleteMany({ company: companyId });

  const customers = [
    {
      customerCode: 'CUS-001',
      name: 'Bright Academy',
      ownerName: 'Sunil Rastogi',
      businessName: 'Bright Academy',
      type: 'Customer',
      category: 'Institutional Buyer',
      phone: '+91 9839333333',
      email: 'admin@brightacademy.edu',
      pan: 'AABCU7777C',
      gstin: '09AABCU7777C1Z3',
      creditLimit: 150000,
      creditPeriod: 15,
      openingBalance: 0,
      balance: 27350, // 106,200 - 70,000 receipt - 8,850 return = 27,350
      currentDue: 27350,
      balanceType: 'Dr',
      billingAddress: { street: 'Aliganj Main Road, Sector B', city: 'Lucknow', state: 'Uttar Pradesh', zip: '226024' },
      shippingAddress: { street: 'Aliganj Main Road, Sector B', city: 'Lucknow', state: 'Uttar Pradesh', zip: '226024' },
      company: companyId,
      status: true,
      createdAt: new Date('2026-04-01T10:00:00Z'),
      updatedAt: new Date()
    },
    {
      customerCode: 'CUS-002',
      name: 'Sunrise Consultancy',
      ownerName: 'Pradeep Mehra',
      businessName: 'Sunrise Consultancy',
      type: 'Customer',
      category: 'Corporate Office',
      phone: '+91 9839444444',
      email: 'contact@sunriseconsultancy.com',
      pan: 'AABCS6666D',
      gstin: '09AABCS6666D1Z4',
      creditLimit: 200000,
      creditPeriod: 30,
      openingBalance: 0,
      balance: 26640, // 56,640 - 30,000 receipt = 26,640
      currentDue: 26640,
      balanceType: 'Dr',
      billingAddress: { street: 'Gomti Nagar Commercial Complex', city: 'Lucknow', state: 'Uttar Pradesh', zip: '226010' },
      shippingAddress: { street: 'Gomti Nagar Commercial Complex', city: 'Lucknow', state: 'Uttar Pradesh', zip: '226010' },
      company: companyId,
      status: true,
      createdAt: new Date('2026-04-01T10:00:00Z'),
      updatedAt: new Date()
    }
  ];

  const custRes = await db.collection('customers').insertMany(customers);
  const cust1Id = custRes.insertedIds[0];
  const cust2Id = custRes.insertedIds[1];
  console.log(`✓ Inserted 2 Customers: Bright Academy & Sunrise Consultancy`);

  console.log('\n--- 7. PRODUCT MASTER: Office Chair - Model A (CHAIR-A) ---');
  await db.collection('products').deleteMany({
    $or: [{ company: companyId }, { productCode: 'CHAIR-A' }]
  });

  const product = {
    productName: 'Office Chair - Model A',
    productCode: 'CHAIR-A',
    sku: 'CHAIR-A',
    productType: 'Standard',
    productUnit: 'PCS',
    saleUnit: 'PCS',
    purchaseUnit: 'PCS',
    packingDetails: '1 chair per PCS',
    productCost: '1000',
    productPrice: '1500',
    wholesalePrice: '1000',
    mrp: 2000,
    productTax: '18% GST',
    taxMethod: 'Exclusive',
    currentStock: 55, // 150 purchased - 90 sold + 5 sale return - 10 purchase return = 55
    alertQuantity: '10',
    hasInitialStock: false,
    initialStockQty: '0',
    costLayers: [
      {
        layer: 'First Purchase (04 Apr)',
        costPerUnit: 1000,
        purchasedQty: 100,
        soldQty: 90,
        returnedQty: 5,
        remainingQty: 15,
        remainingValue: 15000
      },
      {
        layer: 'Second Purchase (06 Apr)',
        costPerUnit: 1100,
        purchasedQty: 50,
        returnedQty: 10,
        remainingQty: 40,
        remainingValue: 44000
      }
    ],
    warehouseStocks: [
      {
        warehouse: 'Main Godown',
        stock: 55
      }
    ],
    valuation: 'FIFO',
    negativeStockAllowed: false,
    company: companyId,
    createdAt: new Date('2026-04-01T10:00:00Z'),
    updatedAt: new Date()
  };

  const prodRes = await db.collection('products').insertOne(product);
  const productId = prodRes.insertedId;
  console.log(`✓ Inserted Product: Office Chair - Model A (55 PCS in stock, Total FIFO Value: ₹59,000)`);

  console.log('\n--- 8. PURCHASES (04 APR & 06 APR) ---');
  await db.collection('purchases').deleteMany({ company: companyId });

  const purchases = [
    {
      purchaseNo: 'PUR-AOS-001',
      referenceNo: 'PFT-001',
      purchaseDate: '2026-04-04',
      company: companyId,
      branch: branch._id,
      warehouse: warehouse._id,
      supplier: supp1Id,
      paymentTerm: '30',
      dueDate: '2026-05-04',
      purchaseStatus: 'Received',
      paymentStatus: 'Partial',
      currency: 'INR',
      orderItems: [
        {
          name: 'Office Chair - Model A',
          code: 'CHAIR-A',
          quantity: 100,
          netUnitCost: 1000,
          productPrice: 1500,
          discount: 0,
          taxPercent: 18,
          product: productId
        }
      ],
      orderTax: '18% GST',
      discountValue: 0,
      shippingCost: 0,
      grandTotal: 118000, // 100,000 + 18,000 tax
      amountPaid: 80000,
      note: 'Prime Furniture Traders; invoice PFT-001. Buy 100 PCS at 1,000. Inventory/Purchase Dr 100,000; Input CGST Dr 9,000; Input SGST Dr 9,000; Supplier Cr 118,000.',
      createdAt: new Date('2026-04-04T11:00:00Z'),
      updatedAt: new Date()
    },
    {
      purchaseNo: 'PUR-AOS-002',
      referenceNo: 'MOP-001',
      purchaseDate: '2026-04-06',
      company: companyId,
      branch: branch._id,
      warehouse: warehouse._id,
      supplier: supp2Id,
      paymentTerm: '30',
      dueDate: '2026-05-06',
      purchaseStatus: 'Received',
      paymentStatus: 'Partial',
      currency: 'INR',
      orderItems: [
        {
          name: 'Office Chair - Model A',
          code: 'CHAIR-A',
          quantity: 50,
          netUnitCost: 1100,
          productPrice: 1600,
          discount: 0,
          taxPercent: 18,
          product: productId
        }
      ],
      orderTax: '18% GST',
      discountValue: 0,
      shippingCost: 0,
      grandTotal: 64900, // 55,000 + 9,900 tax
      amountPaid: 30000,
      note: 'Modern Office Products; invoice MOP-001. Buy 50 PCS at 1,100. Inventory/Purchase Dr 55,000; Input CGST Dr 4,950; Input SGST Dr 4,950; Supplier Cr 64,900.',
      createdAt: new Date('2026-04-06T11:00:00Z'),
      updatedAt: new Date()
    }
  ];

  await db.collection('purchases').insertMany(purchases);
  console.log(`✓ Inserted 2 Purchase Invoices: PFT-001 (₹118,000) & MOP-001 (₹64,900)`);

  console.log('\n--- 9. SALES (08 APR & 10 APR) ---');
  await db.collection('sales').deleteMany({ company: companyId });

  const sales = [
    {
      invoiceNo: 'AOS-001',
      saleDate: '2026-04-08',
      referenceNo: 'ORD-001',
      biller: 'Amit Sharma',
      company: companyId,
      branch: branch._id,
      warehouse: warehouse._id,
      customer: cust1Id,
      customerMobile: '+91 9839333333',
      orderItems: [
        {
          name: 'Office Chair - Model A',
          code: 'CHAIR-A',
          quantity: 60,
          netUnitPrice: 1500,
          discount: 0,
          taxPercent: 18,
          total: 106200, // 90,000 + 16,200
          product: productId
        }
      ],
      subTotal: 90000,
      discountTotal: 0,
      taxTotal: 16200,
      grandTotal: 106200,
      amountPaid: 70000,
      paymentMode: 'Credit',
      saleStatus: 'Completed',
      paymentStatus: 'Partial',
      saleNote: 'Bright Academy; AOS-001. Sell 60 PCS at 1,500. Customer Dr 106,200; Sales Cr 90,000; Output CGST Cr 8,100; Output SGST Cr 8,100.',
      createdAt: new Date('2026-04-08T12:00:00Z'),
      updatedAt: new Date()
    },
    {
      invoiceNo: 'AOS-002',
      saleDate: '2026-04-10',
      referenceNo: 'ORD-002',
      biller: 'Amit Sharma',
      company: companyId,
      branch: branch._id,
      warehouse: warehouse._id,
      customer: cust2Id,
      customerMobile: '+91 9839444444',
      orderItems: [
        {
          name: 'Office Chair - Model A',
          code: 'CHAIR-A',
          quantity: 30,
          netUnitPrice: 1600,
          discount: 0,
          taxPercent: 18,
          total: 56640, // 48,000 + 8,640
          product: productId
        }
      ],
      subTotal: 48000,
      discountTotal: 0,
      taxTotal: 8640,
      grandTotal: 56640,
      amountPaid: 30000,
      paymentMode: 'Credit',
      saleStatus: 'Completed',
      paymentStatus: 'Partial',
      saleNote: 'Sunrise Consultancy; AOS-002. Sell 30 PCS at 1,600. Customer Dr 56,640; Sales Cr 48,000; Output CGST Cr 4,320; Output SGST Cr 4,320.',
      createdAt: new Date('2026-04-10T12:00:00Z'),
      updatedAt: new Date()
    }
  ];

  await db.collection('sales').insertMany(sales);
  console.log(`✓ Inserted 2 Sales Invoices: AOS-001 (₹106,200) & AOS-002 (₹56,640)`);

  console.log('\n--- 10. SALES RETURN & CREDIT NOTE (14 APR) ---');
  await db.collection('creditnotes').deleteMany({ company: { $in: [companyId, companyStr] } });
  await db.collection('salereturns').deleteMany({ company: { $in: [companyId, companyStr] } });

  await db.collection('creditnotes').insertOne({
    creditNoteNo: 'CN-AOS-001',
    noteNo: 'NOTE-CN-AOS-001',
    voucherNo: 'VCH-CN-AOS-001',
    date: '2026-04-14',
    company: companyStr,
    branch: 'Lucknow Main Branch',
    type: 'Sales Return',
    status: 'Approved',
    customer: 'Bright Academy',
    customerCode: 'CUS-001',
    originalInvoiceNo: 'AOS-001',
    originalInvoiceDate: '2026-04-08',
    items: [
      {
        product: 'Office Chair - Model A',
        code: 'CHAIR-A',
        qty: 5,
        rate: 1500,
        taxPercent: 18,
        amount: 8850
      }
    ],
    cgst: 675,
    sgst: 675,
    summary: { subTotal: 7500, grandTotal: 8850 },
    remarks: 'Bright Academy returns 5 PCS at 1,500. Sales Return Dr 7,500; Output CGST Dr 675; Output SGST Dr 675; Customer Cr 8,850.',
    createdAt: new Date('2026-04-14T14:00:00Z'),
    updatedAt: new Date()
  });

  await db.collection('salereturns').insertOne({
    returnNo: 'SR-AOS-001',
    returnNumber: 'SR-AOS-001',
    invoiceNo: 'AOS-001',
    customer: 'Bright Academy',
    customerMobile: '+91 9839333333',
    date: '2026-04-14',
    totalAmount: 8850,
    items: [
      {
        name: 'Office Chair - Model A',
        code: 'CHAIR-A',
        quantity: 5,
        price: 1500,
        taxPercent: 18,
        total: 8850
      }
    ],
    reason: 'Defect / Exchange requested',
    company: companyId,
    createdAt: new Date('2026-04-14T14:00:00Z')
  });
  console.log(`✓ Inserted Sales Return & Credit Note CN-AOS-001 (5 PCS, ₹8,850)`);

  console.log('\n--- 11. PURCHASE RETURN & DEBIT NOTE (15 APR) ---');
  await db.collection('debitnotes').deleteMany({ company: { $in: [companyId, companyStr] } });
  await db.collection('purchasereturns').deleteMany({ company: { $in: [companyId, companyStr] } });

  await db.collection('debitnotes').insertOne({
    debitNoteNo: 'DN-AOS-001',
    voucherNo: 'VCH-DN-AOS-001',
    noteNo: 'NOTE-DN-AOS-001',
    date: '2026-04-15',
    company: companyId,
    branch: 'Lucknow Main Branch',
    type: 'Purchase Return',
    status: 'Approved',
    supplier: 'Modern Office Products',
    originalInvoiceNo: 'MOP-001',
    originalInvoiceDate: '2026-04-06',
    items: [
      {
        product: 'Office Chair - Model A',
        qty: 10,
        rate: 1100,
        amount: 11000
      }
    ],
    discount: 0,
    taxAmount: 1980, // CGST 990 + SGST 990
    summary: { subTotal: 11000, grandTotal: 12980 },
    remarks: 'Return 10 PCS at 1,100 to Modern Office Products. Supplier Dr 12,980; Inventory/Purchase Return Cr 11,000; Input CGST Cr 990; Input SGST Cr 990.',
    createdAt: new Date('2026-04-15T15:00:00Z'),
    updatedAt: new Date()
  });

  await db.collection('purchasereturns').insertOne({
    returnNo: 'PR-AOS-001',
    returnNumber: 'PR-AOS-001',
    purchaseNo: 'PUR-AOS-002',
    referenceNo: 'MOP-001',
    supplier: supp2Id,
    returnDate: '2026-04-15',
    grandTotal: 12980,
    items: [
      {
        name: 'Office Chair - Model A',
        code: 'CHAIR-A',
        quantity: 10,
        netUnitCost: 1100,
        taxPercent: 18,
        total: 12980
      }
    ],
    company: companyId,
    createdAt: new Date('2026-04-15T15:00:00Z')
  });
  console.log(`✓ Inserted Purchase Return & Debit Note DN-AOS-001 (10 PCS, ₹12,980)`);

  console.log('\n--- 12. RECEIPTS (BANK & CASH) ---');
  await db.collection('receipts').deleteMany({ company: { $in: [companyId, companyStr] } });
  await db.collection('bankreceipts').deleteMany({ company: { $in: [companyId, companyStr] } });

  const receipts = [
    {
      receiptNo: 'RCP-AOS-001',
      voucherNo: 'VCH-RCP-AOS-001',
      receiptDate: '2026-04-01',
      receiptType: 'Capital Introduction',
      company: companyStr,
      branch: 'Lucknow Main Branch',
      warehouse: 'Main Godown',
      status: 'Posted',
      customerParty: 'Amit Sharma (Proprietor)',
      paymentAmount: 1000000,
      paymentMethod: 'Multiple (Bank 900,000 + Cash 100,000)',
      account: 'Owner Capital',
      remarks: 'Entry 01: Bank Dr 900,000; Cash Dr 100,000; Owner Capital Cr 1,000,000.',
      createdAt: new Date('2026-04-01T09:30:00Z')
    },
    {
      receiptNo: 'RCP-AOS-002',
      voucherNo: 'VCH-RCP-AOS-002',
      receiptDate: '2026-04-01',
      receiptType: 'Business Loan',
      company: companyStr,
      branch: 'Lucknow Main Branch',
      warehouse: 'Main Godown',
      status: 'Posted',
      customerParty: 'Business Loan Account',
      paymentAmount: 200000,
      paymentMethod: 'Bank Transfer (NEFT/RTGS)',
      account: 'Business Loan',
      remarks: 'Entry 02: Bank Dr 200,000; Business Loan Cr 200,000.',
      createdAt: new Date('2026-04-01T10:00:00Z')
    },
    {
      receiptNo: 'RCP-AOS-003',
      voucherNo: 'VCH-RCP-AOS-003',
      receiptDate: '2026-04-12',
      receiptType: 'Customer Collection',
      company: companyStr,
      branch: 'Lucknow Main Branch',
      warehouse: 'Main Godown',
      status: 'Posted',
      customerParty: 'Bright Academy',
      referenceInvoice: 'AOS-001',
      paymentAmount: 70000,
      paymentMethod: 'Bank Transfer (NEFT)',
      account: 'Business Bank Account',
      remarks: 'Entry 12: Bank Dr 70,000; Bright Academy Cr 70,000. Allocate against AOS-001.',
      invoices: [{ referenceNo: 'AOS-001', invoiceNo: 'AOS-001', invoiceAmount: 106200, dueAmount: 36200, adjustAmount: 70000 }],
      totals: { received: 70000, adjusted: 70000, unadjusted: 0 },
      createdAt: new Date('2026-04-12T11:00:00Z')
    },
    {
      receiptNo: 'RCP-AOS-004',
      voucherNo: 'VCH-RCP-AOS-004',
      receiptDate: '2026-04-13',
      receiptType: 'Customer Collection',
      company: companyStr,
      branch: 'Lucknow Main Branch',
      warehouse: 'Main Godown',
      status: 'Posted',
      customerParty: 'Sunrise Consultancy',
      referenceInvoice: 'AOS-002',
      paymentAmount: 30000,
      paymentMethod: 'Bank Transfer (NEFT)',
      account: 'Business Bank Account',
      remarks: 'Entry 13: Bank Dr 30,000; Sunrise Consultancy Cr 30,000. Allocate against AOS-002.',
      invoices: [{ referenceNo: 'AOS-002', invoiceNo: 'AOS-002', invoiceAmount: 56640, dueAmount: 26640, adjustAmount: 30000 }],
      totals: { received: 30000, adjusted: 30000, unadjusted: 0 },
      createdAt: new Date('2026-04-13T11:00:00Z')
    }
  ];

  await db.collection('receipts').insertMany(receipts);

  // Bank Receipts Collection
  await db.collection('bankreceipts').insertMany([
    {
      receiptNo: 'BRCP-AOS-001',
      receiptDate: '2026-04-12',
      company: companyStr,
      branch: 'Lucknow Main Branch',
      bankAccount: 'Business Bank Account',
      customerParty: 'Bright Academy',
      invoiceNo: 'AOS-001',
      amount: 70000,
      method: 'NEFT',
      bankLedger: 'Business Bank Account',
      customerLedger: 'Bright Academy',
      remarks: 'Collection against AOS-001',
      createdAt: new Date('2026-04-12T11:00:00Z')
    },
    {
      receiptNo: 'BRCP-AOS-002',
      receiptDate: '2026-04-13',
      company: companyStr,
      branch: 'Lucknow Main Branch',
      bankAccount: 'Business Bank Account',
      customerParty: 'Sunrise Consultancy',
      invoiceNo: 'AOS-002',
      amount: 30000,
      method: 'NEFT',
      bankLedger: 'Business Bank Account',
      customerLedger: 'Sunrise Consultancy',
      remarks: 'Collection against AOS-002',
      createdAt: new Date('2026-04-13T11:00:00Z')
    }
  ]);
  console.log(`✓ Inserted 4 Receipts (Capital: 1,000,000, Loan: 200,000, Bright: 70,000, Sunrise: 30,000)`);

  console.log('\n--- 13. PAYMENTS (SUPPLIERS & EXPENSES) ---');
  await db.collection('payments').deleteMany({ company: { $in: [companyId, companyStr] } });
  await db.collection('bankpayments').deleteMany({ company: { $in: [companyId, companyStr] } });

  const payments = [
    {
      paymentNo: 'PAY-AOS-001',
      paymentDate: '2026-04-02',
      paymentType: 'Security Deposit',
      company: companyStr,
      status: 'Posted',
      supplierParty: 'Godown Owner',
      paymentAmount: 40000,
      paymentMethod: 'Bank',
      paidFromAccount: 'Business Bank Account',
      remarks: 'Entry 03: Refundable office/godown Security Deposit Dr 40,000; Bank Cr 40,000.'
    },
    {
      paymentNo: 'PAY-AOS-002',
      paymentDate: '2026-04-02',
      paymentType: 'Rent',
      company: companyStr,
      status: 'Posted',
      supplierParty: 'Landlord',
      paymentAmount: 20000,
      paymentMethod: 'Bank',
      paidFromAccount: 'Business Bank Account',
      remarks: 'Entry 04: April Rent Dr 20,000; Bank Cr 20,000.'
    },
    {
      paymentNo: 'PAY-AOS-003',
      paymentDate: '2026-04-03',
      paymentType: 'Fixed Asset',
      company: companyStr,
      status: 'Posted',
      supplierParty: 'Furniture Vendor',
      paymentAmount: 59000,
      paymentMethod: 'Bank',
      paidFromAccount: 'Business Bank Account',
      remarks: 'Entry 05: Furniture Dr 50,000; Input CGST Dr 4,500; Input SGST Dr 4,500; Bank Cr 59,000.'
    },
    {
      paymentNo: 'PAY-AOS-004',
      paymentDate: '2026-04-03',
      paymentType: 'Fixed Asset',
      company: companyStr,
      status: 'Posted',
      supplierParty: 'Computer Vendor',
      paymentAmount: 47200,
      paymentMethod: 'Bank',
      paidFromAccount: 'Business Bank Account',
      remarks: 'Entry 06: Computer Dr 40,000; Input CGST Dr 3,600; Input SGST Dr 3,600; Bank Cr 47,200.'
    },
    {
      paymentNo: 'PAY-AOS-005',
      paymentDate: '2026-04-07',
      paymentType: 'Supplier',
      company: companyStr,
      status: 'Posted',
      supplierParty: 'Prime Furniture Traders',
      invoiceNo: 'PFT-001',
      paymentAmount: 80000,
      paymentMethod: 'Bank',
      paidFromAccount: 'Business Bank Account',
      remarks: 'Entry 09: Prime Furniture Traders Dr 80,000; Bank Cr 80,000. Allocate against PFT-001.'
    },
    {
      paymentNo: 'PAY-AOS-006',
      paymentDate: '2026-04-16',
      paymentType: 'Supplier',
      company: companyStr,
      status: 'Posted',
      supplierParty: 'Modern Office Products',
      invoiceNo: 'MOP-001',
      paymentAmount: 30000,
      paymentMethod: 'Bank',
      paidFromAccount: 'Business Bank Account',
      remarks: 'Entry 16: Modern Office Products Dr 30,000; Bank Cr 30,000. Allocate against MOP-001.'
    },
    {
      paymentNo: 'PAY-AOS-007',
      paymentDate: '2026-04-17',
      paymentType: 'Employee Advance',
      company: companyStr,
      status: 'Posted',
      supplierParty: 'Rahul Verma',
      paymentAmount: 5000,
      paymentMethod: 'Bank',
      paidFromAccount: 'Business Bank Account',
      remarks: 'Entry 17: Employee Advance - Rahul Dr 5,000; Bank Cr 5,000.'
    },
    {
      paymentNo: 'PAY-AOS-008',
      paymentDate: '2026-04-18',
      paymentType: 'Utility',
      company: companyStr,
      status: 'Posted',
      supplierParty: 'Electricity Board',
      paymentAmount: 3500,
      paymentMethod: 'Bank',
      paidFromAccount: 'Business Bank Account',
      remarks: 'Entry 18: Electricity Dr 3,500; Bank Cr 3,500.'
    },
    {
      paymentNo: 'PAY-AOS-009',
      paymentDate: '2026-04-19',
      paymentType: 'Utility',
      company: companyStr,
      status: 'Posted',
      supplierParty: 'Internet Service Provider',
      paymentAmount: 1500,
      paymentMethod: 'Bank',
      paidFromAccount: 'Business Bank Account',
      remarks: 'Entry 19: Internet Dr 1,500; Bank Cr 1,500.'
    },
    {
      paymentNo: 'PAY-AOS-010',
      paymentDate: '2026-04-20',
      paymentType: 'Marketing',
      company: companyStr,
      status: 'Posted',
      supplierParty: 'Marketing Agency',
      paymentAmount: 5000,
      paymentMethod: 'Bank',
      paidFromAccount: 'Business Bank Account',
      remarks: 'Entry 20: Marketing Dr 5,000; Bank Cr 5,000.'
    },
    {
      paymentNo: 'PAY-AOS-011',
      paymentDate: '2026-04-21',
      paymentType: 'Stationery',
      company: companyStr,
      status: 'Posted',
      supplierParty: 'Stationery Shop',
      paymentAmount: 2000,
      paymentMethod: 'Cash',
      paidFromAccount: 'Cash',
      remarks: 'Entry 21: Stationery Dr 2,000; Cash Cr 2,000.'
    },
    {
      paymentNo: 'PAY-AOS-012',
      paymentDate: '2026-04-23',
      paymentType: 'Drawings',
      company: companyStr,
      status: 'Posted',
      supplierParty: 'Amit Sharma (Drawings)',
      paymentAmount: 10000,
      paymentMethod: 'Cash',
      paidFromAccount: 'Cash',
      remarks: 'Entry 23: Owner Drawings Dr 10,000; Cash Cr 10,000.'
    },
    {
      paymentNo: 'PAY-AOS-013',
      paymentDate: '2026-04-24',
      paymentType: 'Insurance',
      company: companyStr,
      status: 'Posted',
      supplierParty: 'Insurance Company',
      paymentAmount: 12000,
      paymentMethod: 'Bank',
      paidFromAccount: 'Business Bank Account',
      remarks: 'Entry 24: Prepaid Insurance Dr 12,000; Bank Cr 12,000 (12 months from 01 April 2026).'
    },
    {
      paymentNo: 'PAY-AOS-014',
      paymentDate: '2026-04-25',
      paymentType: 'Bank Charges',
      company: companyStr,
      status: 'Posted',
      supplierParty: 'Bank',
      paymentAmount: 500,
      paymentMethod: 'Bank',
      paidFromAccount: 'Business Bank Account',
      remarks: 'Entry 25: Bank Charges Dr 500; Bank Cr 500.'
    },
    {
      paymentNo: 'PAY-AOS-015',
      paymentDate: '2026-04-30',
      paymentType: 'Payroll',
      company: companyStr,
      status: 'Posted',
      supplierParty: 'Staff Net Salary',
      paymentAmount: 63000,
      paymentMethod: 'Bank',
      paidFromAccount: 'Business Bank Account',
      remarks: 'Entry 27: Bank salary payments: Rahul 20,000; Neha 23,000; Mohit 20,000. Total Salary Payable Dr 63,000; Bank Cr 63,000.'
    },
    {
      paymentNo: 'PAY-AOS-016',
      paymentDate: '2026-04-30',
      paymentType: 'Loan Repayment',
      company: companyStr,
      status: 'Posted',
      supplierParty: 'Bank (Loan Dept)',
      paymentAmount: 12000,
      paymentMethod: 'Bank',
      paidFromAccount: 'Business Bank Account',
      remarks: 'Entry 28: Business Loan Dr 10,000; Interest Expense Dr 2,000; Bank Cr 12,000.'
    }
  ];

  await db.collection('payments').insertMany(payments.map(p => ({
    ...p,
    createdAt: new Date(`${p.paymentDate}T12:00:00Z`),
    updatedAt: new Date()
  })));

  // Bank Payments Collection
  const bankPaymentsList = payments.filter(p => p.paymentMethod === 'Bank').map((p) => ({
    paymentId: `BPAY-${p.paymentNo}`,
    paymentNo: `B${p.paymentNo}`,
    paymentDate: p.paymentDate,
    company: companyStr,
    branch: 'Lucknow Main Branch',
    bankAccount: 'Business Bank Account',
    paymentType: p.paymentType,
    supplierParty: p.supplierParty,
    amount: p.paymentAmount,
    method: 'NEFT',
    bankLedger: 'Business Bank Account',
    remarks: p.remarks,
    createdAt: new Date(`${p.paymentDate}T12:00:00Z`),
    updatedAt: new Date()
  }));

  await db.collection('bankpayments').insertMany(bankPaymentsList);
  console.log(`✓ Inserted ${payments.length} Payments & ${bankPaymentsList.length} Bank Payments.`);

  console.log('\n--- 14. CONTRA ENTRY (22 APR) ---');
  await db.collection('contras').deleteMany({ company: { $in: [companyId, companyStr] } });

  await db.collection('contras').insertOne({
    contraNo: 'CNTR-AOS-001',
    contraDate: '2026-04-22',
    company: companyStr,
    branch: 'Lucknow Main Branch',
    voucherType: 'Contra',
    status: 'Posted',
    fromAccount: 'Business Bank Account',
    toAccount: 'Cash',
    amount: 20000,
    transferMode: 'Cash Withdrawal',
    referenceNo: 'CHQ-220401',
    narration: 'Entry 22: Cash (contra withdrawal) Dr 20,000; Bank Cr 20,000.',
    createdAt: new Date('2026-04-22T12:00:00Z'),
    updatedAt: new Date()
  });
  console.log(`✓ Inserted Contra Entry: Cash Withdrawal ₹20,000 (Cash Dr / Bank Cr)`);

  console.log('\n--- 15. HRMS, EMPLOYEES & PAYROLL MASTER ---');
  await db.collection('employees').deleteMany({ company: { $in: [companyId, companyStr] } });

  const employees = [
    {
      employeeId: 'EMP-AOS-001',
      employeeName: 'Rahul Verma',
      gender: 'Male',
      mobile: '+91 9839155551',
      email: 'rahul.verma@apexoffice.com',
      company: companyStr,
      branch: 'Lucknow Main Branch',
      department: 'Sales & Marketing',
      role: 'Sales Executive',
      status: 'Active',
      joiningDate: '2026-04-01',
      basicSalary: 15000,
      hra: 5000,
      allowance: 5000,
      grossSalary: 25000,
      advanceGiven: 5000,
      otherDeduction: 0,
      netSalary: 20000,
      createdAt: new Date('2026-04-01T09:00:00Z')
    },
    {
      employeeId: 'EMP-AOS-002',
      employeeName: 'Neha Singh',
      gender: 'Female',
      mobile: '+91 9839155552',
      email: 'neha.singh@apexoffice.com',
      company: companyStr,
      branch: 'Lucknow Main Branch',
      department: 'Accounts & Finance',
      role: 'Accountant',
      status: 'Active',
      joiningDate: '2026-04-01',
      basicSalary: 15000,
      hra: 5000,
      allowance: 5000,
      grossSalary: 25000,
      advanceGiven: 0,
      otherDeduction: 2000,
      netSalary: 23000,
      createdAt: new Date('2026-04-01T09:00:00Z')
    },
    {
      employeeId: 'EMP-AOS-003',
      employeeName: 'Mohit Kumar',
      gender: 'Male',
      mobile: '+91 9839155553',
      email: 'mohit.kumar@apexoffice.com',
      company: companyStr,
      branch: 'Lucknow Main Branch',
      department: 'Store & Dispatch',
      role: 'Store Executive',
      status: 'Active',
      joiningDate: '2026-04-01',
      basicSalary: 12000,
      hra: 4000,
      allowance: 4000,
      grossSalary: 20000,
      advanceGiven: 0,
      otherDeduction: 0,
      netSalary: 20000,
      createdAt: new Date('2026-04-01T09:00:00Z')
    }
  ];

  const empRes = await db.collection('employees').insertMany(employees);
  const empIds = Object.values(empRes.insertedIds);
  console.log(`✓ Inserted 3 Employees: Rahul Verma, Neha Singh, Mohit Kumar`);

  // Payslips
  await db.collection('payslips').deleteMany({ company: { $in: [companyId, companyStr] } });
  const payslips = [
    {
      payslipNo: 'PS-AOS-202604-01',
      employee: empIds[0],
      employeeId: 'EMP-AOS-001',
      employeeName: 'Rahul Verma',
      designation: 'Sales Executive',
      month: 4,
      year: 2026,
      basicSalary: 15000,
      hra: 5000,
      allowance: 5000,
      grossSalary: 25000,
      advanceDeduction: 5000,
      otherDeduction: 0,
      totalDeductions: 5000,
      netSalary: 20000,
      paymentStatus: 'Paid',
      paymentMode: 'Bank Transfer (NEFT)',
      paymentDate: '2026-04-30',
      company: companyId,
      createdAt: new Date('2026-04-30T10:00:00Z')
    },
    {
      payslipNo: 'PS-AOS-202604-02',
      employee: empIds[1],
      employeeId: 'EMP-AOS-002',
      employeeName: 'Neha Singh',
      designation: 'Accountant',
      month: 4,
      year: 2026,
      basicSalary: 15000,
      hra: 5000,
      allowance: 5000,
      grossSalary: 25000,
      advanceDeduction: 0,
      otherDeduction: 2000,
      totalDeductions: 2000,
      netSalary: 23000,
      paymentStatus: 'Paid',
      paymentMode: 'Bank Transfer (NEFT)',
      paymentDate: '2026-04-30',
      company: companyId,
      createdAt: new Date('2026-04-30T10:00:00Z')
    },
    {
      payslipNo: 'PS-AOS-202604-03',
      employee: empIds[2],
      employeeId: 'EMP-AOS-003',
      employeeName: 'Mohit Kumar',
      designation: 'Store Executive',
      month: 4,
      year: 2026,
      basicSalary: 12000,
      hra: 4000,
      allowance: 4000,
      grossSalary: 20000,
      advanceDeduction: 0,
      otherDeduction: 0,
      totalDeductions: 0,
      netSalary: 20000,
      paymentStatus: 'Paid',
      paymentMode: 'Bank Transfer (NEFT)',
      paymentDate: '2026-04-30',
      company: companyId,
      createdAt: new Date('2026-04-30T10:00:00Z')
    }
  ];
  await db.collection('payslips').insertMany(payslips);
  console.log(`✓ Inserted 3 Payslips for April 2026 (Net: ₹63,000)`);

  console.log('\n--- 16. DOUBLE-ENTRY JOURNAL VOUCHERS (vouchers) ---');
  await db.collection('vouchers').deleteMany({ company: { $in: [companyId, companyStr] } });

  const vouchers = [
    // Entry 01: Capital Introduction
    {
      voucherNo: 'JV-AOS-001',
      date: '2026-04-01',
      voucherType: 'Receipt',
      company: companyId,
      status: 'Posted',
      generalNarration: 'Entry 01: Owner Capital Introduced (Bank 900,000 + Cash 100,000; Owner Capital Cr 1,000,000)',
      totalDebit: 1000000,
      totalCredit: 1000000,
      entries: [
        { account: ledgerMap['Business Bank Account'], debitAmount: 900000, creditAmount: 0, narration: 'Bank Dr' },
        { account: ledgerMap['Cash'], debitAmount: 100000, creditAmount: 0, narration: 'Cash Dr' },
        { account: ledgerMap['Owner Capital'], debitAmount: 0, creditAmount: 1000000, narration: 'Owner Capital Cr' }
      ]
    },
    // Entry 02: Business Loan
    {
      voucherNo: 'JV-AOS-002',
      date: '2026-04-01',
      voucherType: 'Receipt',
      company: companyId,
      status: 'Posted',
      generalNarration: 'Entry 02: Business Loan received in Bank (Bank Dr 200,000; Business Loan Cr 200,000)',
      totalDebit: 200000,
      totalCredit: 200000,
      entries: [
        { account: ledgerMap['Business Bank Account'], debitAmount: 200000, creditAmount: 0, narration: 'Bank Dr' },
        { account: ledgerMap['Business Loan'], debitAmount: 0, creditAmount: 200000, narration: 'Business Loan Cr' }
      ]
    },
    // Entry 05: Furniture Asset Purchase
    {
      voucherNo: 'JV-AOS-003',
      date: '2026-04-03',
      voucherType: 'Payment',
      company: companyId,
      status: 'Posted',
      generalNarration: 'Entry 05: Furniture Dr 50,000; Input CGST Dr 4,500; Input SGST Dr 4,500; Bank Cr 59,000.',
      totalDebit: 59000,
      totalCredit: 59000,
      entries: [
        { account: ledgerMap['Furniture'], debitAmount: 50000, creditAmount: 0, narration: 'Furniture Dr' },
        { account: ledgerMap['Input CGST'], debitAmount: 4500, creditAmount: 0, narration: 'Input CGST Dr' },
        { account: ledgerMap['Input SGST'], debitAmount: 4500, creditAmount: 0, narration: 'Input SGST Dr' },
        { account: ledgerMap['Business Bank Account'], debitAmount: 0, creditAmount: 59000, narration: 'Bank Cr' }
      ]
    },
    // Entry 06: Computer Asset Purchase
    {
      voucherNo: 'JV-AOS-004',
      date: '2026-04-03',
      voucherType: 'Payment',
      company: companyId,
      status: 'Posted',
      generalNarration: 'Entry 06: Computer Dr 40,000; Input CGST Dr 3,600; Input SGST Dr 3,600; Bank Cr 47,200.',
      totalDebit: 47200,
      totalCredit: 47200,
      entries: [
        { account: ledgerMap['Computer'], debitAmount: 40000, creditAmount: 0, narration: 'Computer Dr' },
        { account: ledgerMap['Input CGST'], debitAmount: 3600, creditAmount: 0, narration: 'Input CGST Dr' },
        { account: ledgerMap['Input SGST'], debitAmount: 3600, creditAmount: 0, narration: 'Input SGST Dr' },
        { account: ledgerMap['Business Bank Account'], debitAmount: 0, creditAmount: 47200, narration: 'Bank Cr' }
      ]
    },
    // Entry 26: Salary Accrual
    {
      voucherNo: 'JV-AOS-005',
      date: '2026-04-30',
      voucherType: 'Journal',
      company: companyId,
      status: 'Posted',
      generalNarration: 'Entry 26: Salary accrual: Salary Expense Dr 70,000; Employee Advance - Rahul Cr 5,000; Other Salary Deduction Payable Cr 2,000; Salary Payable Cr 63,000.',
      totalDebit: 70000,
      totalCredit: 70000,
      entries: [
        { account: ledgerMap['Salary Expense'], debitAmount: 70000, creditAmount: 0, narration: 'Salary Expense Dr' },
        { account: ledgerMap['Employee Advance - Rahul'], debitAmount: 0, creditAmount: 5000, narration: 'Employee Advance Cr' },
        { account: ledgerMap['Other Salary Deduction Payable'], debitAmount: 0, creditAmount: 2000, narration: 'Other Salary Deduction Cr' },
        { account: ledgerMap['Salary Payable'], debitAmount: 0, creditAmount: 63000, narration: 'Salary Payable Cr' }
      ]
    },
    // Entry 28: Loan Installment
    {
      voucherNo: 'JV-AOS-006',
      date: '2026-04-30',
      voucherType: 'Payment',
      company: companyId,
      status: 'Posted',
      generalNarration: 'Entry 28: Business Loan Dr 10,000; Interest Expense Dr 2,000; Bank Cr 12,000. Remaining loan = 190,000.',
      totalDebit: 12000,
      totalCredit: 12000,
      entries: [
        { account: ledgerMap['Business Loan'], debitAmount: 10000, creditAmount: 0, narration: 'Loan Principal Dr' },
        { account: ledgerMap['Interest'], debitAmount: 2000, creditAmount: 0, narration: 'Interest Expense Dr' },
        { account: ledgerMap['Business Bank Account'], debitAmount: 0, creditAmount: 12000, narration: 'Bank Cr' }
      ]
    },
    // Entry 29: Prepaid Insurance Monthly Amortization
    {
      voucherNo: 'JV-AOS-007',
      date: '2026-04-30',
      voucherType: 'Journal',
      company: companyId,
      status: 'Posted',
      generalNarration: 'Entry 29: Insurance Expense Dr 1,000; Prepaid Insurance Cr 1,000. Remaining prepaid asset = 11,000.',
      totalDebit: 1000,
      totalCredit: 1000,
      entries: [
        { account: ledgerMap['Insurance'], debitAmount: 1000, creditAmount: 0, narration: 'Monthly Insurance Expense Dr' },
        { account: ledgerMap['Prepaid Insurance'], debitAmount: 0, creditAmount: 1000, narration: 'Prepaid Insurance Amortization Cr' }
      ]
    },
    // Entry 30: Depreciation Expense
    {
      voucherNo: 'JV-AOS-008',
      date: '2026-04-30',
      voucherType: 'Journal',
      company: companyId,
      status: 'Posted',
      generalNarration: 'Entry 30: Depreciation Expense Dr 1,500; Accumulated Depreciation - Furniture Cr 500; Accumulated Depreciation - Computer Cr 1,000.',
      totalDebit: 1500,
      totalCredit: 1500,
      entries: [
        { account: ledgerMap['Depreciation'], debitAmount: 1500, creditAmount: 0, narration: 'Depreciation Expense Dr' },
        { account: ledgerMap['Accumulated Depreciation - Furniture'], debitAmount: 0, creditAmount: 500, narration: 'Acc Dep Furniture Cr' },
        { account: ledgerMap['Accumulated Depreciation - Computer'], debitAmount: 0, creditAmount: 1000, narration: 'Acc Dep Computer Cr' }
      ]
    },
    // Entry 31: GST Set-Off
    {
      voucherNo: 'JV-AOS-009',
      date: '2026-04-30',
      voucherType: 'Journal',
      company: companyId,
      status: 'Posted',
      generalNarration: 'Entry 31: GST set-off: Output CGST Dr 11,745 / Input CGST Cr 11,745; Output SGST Dr 11,745 / Input SGST Cr 11,745.',
      totalDebit: 23490,
      totalCredit: 23490,
      entries: [
        { account: ledgerMap['Output CGST'], debitAmount: 11745, creditAmount: 0, narration: 'Output CGST Set-off Dr' },
        { account: ledgerMap['Output SGST'], debitAmount: 11745, creditAmount: 0, narration: 'Output SGST Set-off Dr' },
        { account: ledgerMap['Input CGST'], debitAmount: 0, creditAmount: 11745, narration: 'Input CGST Adjusted Cr' },
        { account: ledgerMap['Input SGST'], debitAmount: 0, creditAmount: 11745, narration: 'Input SGST Adjusted Cr' }
      ]
    }
  ];

  await db.collection('vouchers').insertMany(vouchers.map(v => ({
    ...v,
    createdAt: new Date(`${v.date}T18:00:00Z`),
    updatedAt: new Date()
  })));
  console.log(`✓ Inserted ${vouchers.length} Journal Vouchers (Entries 01, 02, 05, 06, 26, 28, 29, 30, 31).`);

  console.log('\n--- 17. HRMS DEPARTMENTS & DESIGNATIONS & OTHER MASTERS ---');
  await db.collection('departments').deleteMany({ company: { $in: [companyId, companyStr] } });
  const departments = [
    { deptCode: 'D-AOS-SALES', deptName: 'Sales & Marketing', description: 'Commercial Furniture Sales', status: 'Active', company: companyStr, createdAt: new Date() },
    { deptCode: 'D-AOS-ACCTS', deptName: 'Accounts & Finance', description: 'Financial Accounting & Taxation', status: 'Active', company: companyStr, createdAt: new Date() },
    { deptCode: 'D-AOS-STORE', deptName: 'Store & Dispatch', description: 'Godown & Logistics', status: 'Active', company: companyStr, createdAt: new Date() }
  ];
  await db.collection('departments').insertMany(departments);

  await db.collection('designations').deleteMany({ company: { $in: [companyId, companyStr] } });
  const designations = [
    { desigCode: 'DES-AOS-SE', desigName: 'Sales Executive', desigType: 'Executive', department: 'Sales & Marketing', status: 'Active', jobTitle: 'Sales Executive', employmentType: 'Permanent', company: companyStr, createdAt: new Date() },
    { desigCode: 'DES-AOS-ACC', desigName: 'Accountant', desigType: 'Executive', department: 'Accounts & Finance', status: 'Active', jobTitle: 'Accountant', employmentType: 'Permanent', company: companyStr, createdAt: new Date() },
    { desigCode: 'DES-AOS-STE', desigName: 'Store Executive', desigType: 'Executive', department: 'Store & Dispatch', status: 'Active', jobTitle: 'Store Executive', employmentType: 'Permanent', company: companyStr, createdAt: new Date() }
  ];
  await db.collection('designations').insertMany(designations);

  // Units
  const unit = {
    unitCode: 'PCS',
    code: 'PCS',
    unitName: 'Pieces (PCS)',
    name: 'Pieces',
    shortName: 'PCS',
    baseUnit: 'None (Root Unit)',
    operator: 'None',
    operationValue: 1,
    company: companyId,
    status: 'Active',
    createdAt: new Date('2026-04-01T09:00:00Z')
  };
  await db.collection('units').updateOne(
    { $or: [{ unitCode: 'PCS' }, { code: 'PCS' }] },
    { $set: unit },
    { upsert: true }
  );

  // Categories
  const category = {
    name: 'Office Furniture',
    categoryName: 'Office Furniture',
    categoryCode: 'CAT-FURN',
    parent: 'None',
    status: true,
    company: companyId,
    createdAt: new Date('2026-04-01T09:00:00Z')
  };
  await db.collection('categories').updateOne(
    { name: 'Office Furniture' },
    { $set: category },
    { upsert: true }
  );

  // Brands
  const brand = {
    name: 'Apex Signature',
    brandName: 'Apex Signature',
    brandCode: 'BRD-APEX',
    status: true,
    featured: true,
    company: companyId,
    createdAt: new Date('2026-04-01T09:00:00Z')
  };
  await db.collection('brands').updateOne(
    { name: 'Apex Signature' },
    { $set: brand },
    { upsert: true }
  );

  // Tax Slabs
  const taxSlab = {
    id: 'TAX-AOS-18',
    name: '18% GST',
    taxName: '18% GST',
    type: 'GST',
    rate: 18,
    taxRate: 18,
    status: 'Active',
    gstType: 'CGST + SGST',
    cgst: 9,
    sgst: 9,
    igst: 18,
    cess: 0,
    transactionSales: true,
    transactionPurchase: true,
    placeState: 'Uttar Pradesh',
    taxTreatment: 'Intra-State',
    company: companyStr,
    createdAt: new Date('2026-04-01T09:00:00Z')
  };
  await db.collection('taxslabs').updateOne(
    { id: 'TAX-AOS-18' },
    { $set: taxSlab },
    { upsert: true }
  );

  // Salary Structures
  await db.collection('salarystructures').deleteMany({ company: { $in: [companyId, companyStr] } });
  const salaryStructures = [
    {
      code: 'SS-AOS-RAHUL',
      name: 'Salary Structure - Rahul Verma',
      employeeId: 'EMP-AOS-001',
      employeeName: 'Rahul Verma',
      company: companyStr,
      branch: 'Lucknow Main Branch',
      department: 'Sales & Marketing',
      designation: 'Sales Executive',
      currency: 'INR',
      effectiveFrom: '2026-04-01',
      status: 'Active',
      workingDays: '30',
      earnings: [
        { component: 'Basic Salary', type: 'Fixed', amount: 15000, calculatedValue: 15000 },
        { component: 'HRA', type: 'Fixed', amount: 5000, calculatedValue: 5000 },
        { component: 'Conveyance & Sales Allowance', type: 'Fixed', amount: 5000, calculatedValue: 5000 }
      ],
      deductions: [
        { component: 'Salary Advance Recovery', type: 'Fixed', amount: 5000, calculatedValue: 5000 }
      ],
      totals: { basic: 15000, grossEarnings: 25000, totalDeductions: 5000, netSalary: 20000, employerCost: 25000, ctc: 25000 },
      createdAt: new Date('2026-04-01T09:00:00Z')
    },
    {
      code: 'SS-AOS-NEHA',
      name: 'Salary Structure - Neha Singh',
      employeeId: 'EMP-AOS-002',
      employeeName: 'Neha Singh',
      company: companyStr,
      branch: 'Lucknow Main Branch',
      department: 'Accounts & Finance',
      designation: 'Accountant',
      currency: 'INR',
      effectiveFrom: '2026-04-01',
      status: 'Active',
      workingDays: '30',
      earnings: [
        { component: 'Basic Salary', type: 'Fixed', amount: 15000, calculatedValue: 15000 },
        { component: 'HRA', type: 'Fixed', amount: 5000, calculatedValue: 5000 },
        { component: 'Special Allowance', type: 'Fixed', amount: 5000, calculatedValue: 5000 }
      ],
      deductions: [
        { component: 'Other Salary Deduction', type: 'Fixed', amount: 2000, calculatedValue: 2000 }
      ],
      totals: { basic: 15000, grossEarnings: 25000, totalDeductions: 2000, netSalary: 23000, employerCost: 25000, ctc: 25000 },
      createdAt: new Date('2026-04-01T09:00:00Z')
    },
    {
      code: 'SS-AOS-MOHIT',
      name: 'Salary Structure - Mohit Kumar',
      employeeId: 'EMP-AOS-003',
      employeeName: 'Mohit Kumar',
      company: companyStr,
      branch: 'Lucknow Main Branch',
      department: 'Store & Dispatch',
      designation: 'Store Executive',
      currency: 'INR',
      effectiveFrom: '2026-04-01',
      status: 'Active',
      workingDays: '30',
      earnings: [
        { component: 'Basic Salary', type: 'Fixed', amount: 12000, calculatedValue: 12000 },
        { component: 'HRA', type: 'Fixed', amount: 4000, calculatedValue: 4000 },
        { component: 'Warehouse Allowance', type: 'Fixed', amount: 4000, calculatedValue: 4000 }
      ],
      deductions: [],
      totals: { basic: 12000, grossEarnings: 20000, totalDeductions: 0, netSalary: 20000, employerCost: 20000, ctc: 20000 },
      createdAt: new Date('2026-04-01T09:00:00Z')
    }
  ];
  await db.collection('salarystructures').insertMany(salaryStructures);

  console.log(`✓ Seeded Units (PCS), Categories, Brands, Tax Slabs, Salary Structures, Departments, Designations`);

  console.log(`\n======================================================`);
  console.log(`✅ FINISHED SEEDING FOR: ${targetName}`);
  console.log(`======================================================\n`);

  await conn.close();
}

async function main() {
  try {
    // 1. Seed Local
    await seedApexOffice(LOCAL_URI, 'Local MongoDB (127.0.0.1:27017)');
    // 2. Seed Atlas Cloud
    await seedApexOffice(ATLAS_URI, 'MongoDB Atlas Cloud');

    console.log('\n🎉 ALL APEX OFFICE SOLUTIONS DATA SEEDED SUCCESSFULLY TO BOTH DATABASES!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Failed:', err);
    process.exit(1);
  }
}

main();
