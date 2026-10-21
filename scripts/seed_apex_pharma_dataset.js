const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/erp_global';

async function seedApexPharma() {
  console.log(`Connecting to MongoDB (${MONGO_URI})...`);
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB!');
  const db = mongoose.connection.db;

  console.log('\n--- 1. CREATING COMPANY: Apex Pharma Distributors ---');
  // Upsert Apex Pharma Distributors
  let company = await db.collection('companies').findOne({ code: 'APD' });
  if (!company) {
    company = await db.collection('companies').findOne({ name: 'Apex Pharma Distributors' });
  }

  const companyData = {
    name: 'Apex Pharma Distributors',
    code: 'APD',
    email: 'info@apexpharma.com',
    phone: '+91 9876543210',
    website: 'https://apexpharma.com',
    address: 'Indira Nagar, Lucknow, Uttar Pradesh',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    gstin: '09AABCA1234F1Z5',
    businessType: 'Pharmaceutical wholesale and distribution',
    constitution: 'Proprietorship',
    ownerName: 'Amit Sharma',
    billingCycle: 'yearly',
    financialYear: '2026-2027',
    currency: 'INR (₹)',
    dateFormat: 'YYYY-MM-DD',
    invoicePrefix: 'APD-',
    terms: 'Payment is due within credit period.',
    signature: 'Amit Sharma - Proprietor',
    drugLicenceNo: 'DL-20B-12345/21B-67890',
    drugLicenceValidity: '2029-03-31',
    valuationMethod: 'FIFO',
    dispatchMethod: 'FEFO',
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

  console.log('\n--- 2. CREATING ADMIN USER: apexpharma@gmail.com ---');
  const adminRole = await db.collection('roles').findOne({ name: 'Admin' });
  const hashedPassword = await bcrypt.hash('password123', 10);

  let user = await db.collection('users').findOne({ email: 'apexpharma@gmail.com' });
  const userData = {
    name: 'Amit Sharma',
    email: 'apexpharma@gmail.com',
    password: hashedPassword,
    role: adminRole ? adminRole._id : null,
    company: companyId,
    isActive: true,
    updatedAt: new Date()
  };

  if (!user) {
    userData.createdAt = new Date('2026-04-01T09:00:00Z');
    const uRes = await db.collection('users').insertOne(userData);
    user = { _id: uRes.insertedId, ...userData };
    console.log(`✓ Created User: ${user.email} (Password: password123)`);
  } else {
    await db.collection('users').updateOne({ _id: user._id }, { $set: userData });
    console.log(`✓ Updated User: ${user.email}`);
  }

  console.log('\n--- 3. CREATING BRANCH & WAREHOUSE ---');
  let branch = await db.collection('branches').findOne({ code: 'LKO-MAIN', company: companyId });
  if (!branch) {
    const bRes = await db.collection('branches').insertOne({
      id: 'BR-LKO-01',
      code: 'LKO-MAIN',
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

  let warehouse = await db.collection('warehouses').findOne({ name: 'Main Pharma Godown', company: companyId });
  if (!warehouse) {
    const wRes = await db.collection('warehouses').insertOne({
      name: 'Main Pharma Godown',
      code: 'WH-LKO-01',
      location: 'Indira Nagar, Lucknow',
      status: true,
      branch: branch._id,
      company: companyId,
      createdAt: new Date('2026-04-01T09:00:00Z'),
      updatedAt: new Date()
    });
    warehouse = { _id: wRes.insertedId, name: 'Main Pharma Godown' };
  }
  console.log(`✓ Warehouse: ${warehouse.name}`);

  console.log('\n--- 4. CREATING ACCOUNT LEDGERS ---');
  const ledgersToCreate = [
    { accountName: 'Owner Capital', groupType: 'Equity', balanceType: 'Cr', description: 'Amit Sharma Capital A/C' },
    { accountName: 'Owner Drawings', groupType: 'Equity', balanceType: 'Dr', description: 'Drawings for personal use' },
    { accountName: 'Business Loan', groupType: 'Liability', balanceType: 'Cr', description: 'Business Loan A/C' },
    { accountName: 'Business Bank Account', groupType: 'Asset', balanceType: 'Dr', description: 'Main Bank Account' },
    { accountName: 'Cash', groupType: 'Asset', balanceType: 'Dr', description: 'Cash in Hand' },
    { accountName: 'Security Deposit', groupType: 'Asset', balanceType: 'Dr', description: 'Refundable Godown/Office Deposit' },
    { accountName: 'Furniture', groupType: 'Asset', balanceType: 'Dr', description: 'Furniture and medicine racks' },
    { accountName: 'Computer', groupType: 'Asset', balanceType: 'Dr', description: 'Office Computers and IT Assets' },
    { accountName: 'Prepaid Insurance', groupType: 'Asset', balanceType: 'Dr', description: 'Prepaid Business Insurance' },
    { accountName: 'Employee Advance - Rahul', groupType: 'Asset', balanceType: 'Dr', description: 'Advance against salary' },
    { accountName: 'Inventory / Purchase', groupType: 'Asset', balanceType: 'Dr', description: 'Trading Goods / Purchases' },
    { accountName: 'Sales', groupType: 'Income', balanceType: 'Cr', description: 'Pharma Wholesale Sales' },
    { accountName: 'Sales Return', groupType: 'Income', balanceType: 'Dr', description: 'Returns from Customers' },
    { accountName: 'Purchase Return', groupType: 'Expense', balanceType: 'Cr', description: 'Returns to Suppliers' },
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
    { accountName: 'Interest Expense', groupType: 'Expense', balanceType: 'Dr', description: 'Interest on Business Loan' },
    { accountName: 'Insurance Expense', groupType: 'Expense', balanceType: 'Dr', description: 'Monthly Insurance Expense' },
    { accountName: 'Depreciation Expense', groupType: 'Expense', balanceType: 'Dr', description: 'Asset Depreciation' },
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

  console.log('\n--- 5. CREATING SUPPLIERS ---');
  // Delete previous test suppliers for this company
  await db.collection('suppliers').deleteMany({ company: companyId });

  const suppliers = [
    {
      supplierCode: 'SUP-001',
      type: 'Supplier / Manufacturer',
      companyName: 'Prime Pharma Laboratories',
      contactPerson: 'Vikas Sharma',
      phone: '+91 9839011111',
      email: 'sales@primepharma.com',
      paymentTerms: '30 days',
      creditLimit: 200000,
      balance: 38000, // 118,000 - 80,000
      gstStatus: 'Registered',
      gstin: '09AABCP1111A1Z1',
      pan: 'AABCP1111A',
      taxPreference: 'Taxable',
      drugLicenceNo: 'DL-20B-78901/21B-23456',
      drugLicenceValidity: '2028-12-31',
      billingAddress: { street1: 'Phase 1, Industrial Area', city: 'Lucknow', state: 'Uttar Pradesh', zip: '226012', country: 'India' },
      shippingAddress: { street1: 'Phase 1, Industrial Area', city: 'Lucknow', state: 'Uttar Pradesh', zip: '226012', country: 'India' },
      company: companyId,
      status: true,
      createdAt: new Date('2026-04-01T10:00:00Z'),
      updatedAt: new Date()
    },
    {
      supplierCode: 'SUP-002',
      type: 'Supplier / Distributor',
      companyName: 'Modern Healthcare Distributors',
      contactPerson: 'Sanjay Gupta',
      phone: '+91 9839022222',
      email: 'orders@modernhealthcare.com',
      paymentTerms: '30 days',
      creditLimit: 150000,
      balance: 21920, // 64,900 - 30,000 payment - 12,980 return
      gstStatus: 'Registered',
      gstin: '09AABCM2222B1Z2',
      pan: 'AABCM2222B',
      taxPreference: 'Taxable',
      drugLicenceNo: 'DL-20B-34567/21B-89012',
      drugLicenceValidity: '2028-10-31',
      billingAddress: { street1: 'Aminabad Market', city: 'Lucknow', state: 'Uttar Pradesh', zip: '226018', country: 'India' },
      shippingAddress: { street1: 'Aminabad Market', city: 'Lucknow', state: 'Uttar Pradesh', zip: '226018', country: 'India' },
      company: companyId,
      status: true,
      createdAt: new Date('2026-04-01T10:00:00Z'),
      updatedAt: new Date()
    }
  ];

  const suppRes = await db.collection('suppliers').insertMany(suppliers);
  const supp1Id = suppRes.insertedIds[0];
  const supp2Id = suppRes.insertedIds[1];
  console.log(`✓ Inserted 2 Suppliers: Prime Pharma & Modern Healthcare`);

  console.log('\n--- 6. CREATING CUSTOMERS ---');
  await db.collection('customers').deleteMany({ company: companyId });

  const customers = [
    {
      customerCode: 'CUS-001',
      name: 'City Care Medical Store',
      ownerName: 'Rajesh Agarwal',
      businessName: 'City Care Medical Store',
      type: 'Customer / Chemist',
      category: 'Pharma Retailer',
      phone: '+91 9839033333',
      email: 'citycare@gmail.com',
      pan: 'AABCU3333C',
      gstin: '09AABCU3333C1Z3',
      creditLimit: 150000,
      creditPeriod: 15,
      openingBalance: 0,
      balanceType: 'Dr',
      drugLicenceNo: 'DL-20B-56789/21B-12345',
      drugLicenceValidity: '2028-06-30',
      billingAddress: { street: 'Hazratganj Main Road', city: 'Lucknow', state: 'Uttar Pradesh', zip: '226001' },
      shippingAddress: { street: 'Hazratganj Main Road', city: 'Lucknow', state: 'Uttar Pradesh', zip: '226001' },
      company: companyId,
      status: true,
      createdAt: new Date('2026-04-01T10:00:00Z'),
      updatedAt: new Date()
    },
    {
      customerCode: 'CUS-002',
      name: 'Sunrise Hospital Pharmacy',
      ownerName: 'Dr. A. K. Verma',
      businessName: 'Sunrise Hospital Pharmacy',
      type: 'Customer / Hospital',
      category: 'Hospital Pharmacy',
      phone: '+91 9839044444',
      email: 'pharmacy@sunrisehospital.com',
      pan: 'AABCS4444D',
      gstin: '09AABCS4444D1Z4',
      creditLimit: 200000,
      creditPeriod: 30,
      openingBalance: 0,
      balanceType: 'Dr',
      drugLicenceNo: 'DL-20B-90123/21B-45678',
      drugLicenceValidity: '2029-01-31',
      billingAddress: { street: 'Gomti Nagar Extension', city: 'Lucknow', state: 'Uttar Pradesh', zip: '226010' },
      shippingAddress: { street: 'Gomti Nagar Extension', city: 'Lucknow', state: 'Uttar Pradesh', zip: '226010' },
      company: companyId,
      status: true,
      createdAt: new Date('2026-04-01T10:00:00Z'),
      updatedAt: new Date()
    }
  ];

  const custRes = await db.collection('customers').insertMany(customers);
  const cust1Id = custRes.insertedIds[0];
  const cust2Id = custRes.insertedIds[1];
  console.log(`✓ Inserted 2 Customers: City Care Medical & Sunrise Hospital`);

  console.log('\n--- 7. CREATING PRODUCT (PHARMA TABLET A - DEMO) ---');
  await db.collection('products').deleteMany({
    $or: [{ company: companyId }, { productCode: 'PT-A' }]
  });

  const product = {
    productName: 'Pharma Tablet A - Demo',
    productCode: 'PT-A',
    sku: 'PT-A',
    productType: 'Standard',
    productUnit: 'BOX',
    saleUnit: 'BOX',
    purchaseUnit: 'BOX',
    packingDetails: '10 strips x 10 tablets per BOX',
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
    batches: [
      {
        batchNo: 'PTA-001',
        mfgDate: '2026-01-01',
        expDate: '2027-12-31',
        cost: 1000,
        purchaseQty: 100,
        soldQty: 90,
        returnedQty: 5,
        remainingQty: 15,
        remainingValue: 15000
      },
      {
        batchNo: 'PTA-002',
        mfgDate: '2026-02-01',
        expDate: '2028-01-31',
        cost: 1100,
        purchaseQty: 50,
        returnedQty: 10,
        remainingQty: 40,
        remainingValue: 44000
      }
    ],
    warehouseStocks: [
      {
        warehouse: 'Main Pharma Godown',
        stock: 55
      }
    ],
    valuation: 'FIFO',
    dispatchRule: 'FEFO',
    negativeStockAllowed: false,
    company: companyId,
    createdAt: new Date('2026-04-01T10:00:00Z'),
    updatedAt: new Date()
  };

  const prodRes = await db.collection('products').insertOne(product);
  const productId = prodRes.insertedId;
  console.log(`✓ Inserted Product: Pharma Tablet A - Demo (55 BOX in stock, Total Cost Value: ₹59,000)`);

  console.log('\n--- 8. CREATING PURCHASES (04 APR & 06 APR) ---');
  await db.collection('purchases').deleteMany({ company: companyId });

  const purchases = [
    {
      purchaseNo: 'PUR-001',
      referenceNo: 'PPL-001',
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
          name: 'Pharma Tablet A - Demo',
          code: 'PT-A',
          quantity: 100,
          netUnitCost: 1000,
          productPrice: 1500,
          discount: 0,
          taxPercent: 18,
          batch: 'PTA-001',
          mfgDate: '2026-01-01',
          expDate: '2027-12-31',
          product: productId
        }
      ],
      orderTax: '18% GST',
      discountValue: 0,
      shippingCost: 0,
      grandTotal: 118000, // 100,000 + 18,000 tax
      amountPaid: 80000,
      note: 'Buy 100 BOX at 1,000. Input CGST 9,000 + SGST 9,000. Batch PTA-001.',
      createdAt: new Date('2026-04-04T11:00:00Z'),
      updatedAt: new Date()
    },
    {
      purchaseNo: 'PUR-002',
      referenceNo: 'MHD-001',
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
          name: 'Pharma Tablet A - Demo',
          code: 'PT-A',
          quantity: 50,
          netUnitCost: 1100,
          productPrice: 1600,
          discount: 0,
          taxPercent: 18,
          batch: 'PTA-002',
          mfgDate: '2026-02-01',
          expDate: '2028-01-31',
          product: productId
        }
      ],
      orderTax: '18% GST',
      discountValue: 0,
      shippingCost: 0,
      grandTotal: 64900, // 55,000 + 9,900 tax
      amountPaid: 30000,
      note: 'Buy 50 BOX at 1,100. Input CGST 4,950 + SGST 4,950. Batch PTA-002.',
      createdAt: new Date('2026-04-06T11:00:00Z'),
      updatedAt: new Date()
    }
  ];

  await db.collection('purchases').insertMany(purchases);
  console.log(`✓ Inserted 2 Purchase Invoices: PPL-001 (₹118,000) & MHD-001 (₹64,900)`);

  console.log('\n--- 9. CREATING SALES (08 APR & 10 APR) ---');
  await db.collection('sales').deleteMany({ company: companyId });

  const sales = [
    {
      invoiceNo: 'APD-001',
      saleDate: '2026-04-08',
      referenceNo: 'ORD-001',
      biller: 'Amit Sharma',
      company: companyId,
      branch: branch._id,
      warehouse: warehouse._id,
      customer: cust1Id,
      customerMobile: '+91 9839033333',
      orderItems: [
        {
          name: 'Pharma Tablet A - Demo',
          code: 'PT-A',
          quantity: 60,
          netUnitPrice: 1500,
          discount: 0,
          taxPercent: 18,
          total: 106200, // 90,000 + 16,200
          batch: 'PTA-001',
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
      saleNote: 'Sell 60 BOX at 1,500. Output CGST 8,100; Output SGST 8,100. Batch PTA-001.',
      createdAt: new Date('2026-04-08T12:00:00Z'),
      updatedAt: new Date()
    },
    {
      invoiceNo: 'APD-002',
      saleDate: '2026-04-10',
      referenceNo: 'ORD-002',
      biller: 'Amit Sharma',
      company: companyId,
      branch: branch._id,
      warehouse: warehouse._id,
      customer: cust2Id,
      customerMobile: '+91 9839044444',
      orderItems: [
        {
          name: 'Pharma Tablet A - Demo',
          code: 'PT-A',
          quantity: 30,
          netUnitPrice: 1600,
          discount: 0,
          taxPercent: 18,
          total: 56640, // 48,000 + 8,640
          batch: 'PTA-001',
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
      saleNote: 'Sell 30 BOX at 1,600. Output CGST 4,320; Output SGST 4,320. Batch PTA-001.',
      createdAt: new Date('2026-04-10T12:00:00Z'),
      updatedAt: new Date()
    }
  ];

  await db.collection('sales').insertMany(sales);
  console.log(`✓ Inserted 2 Sales Invoices: APD-001 (₹106,200) & APD-002 (₹56,640)`);

  console.log('\n--- 10. CREATING SALES RETURN & CREDIT NOTE (14 APR) ---');
  await db.collection('creditnotes').deleteMany({ company: companyId.toString() });
  await db.collection('salereturns').deleteMany({ company: companyId });

  await db.collection('creditnotes').insertOne({
    creditNoteNo: 'CN-001',
    voucherNo: 'VCH-CN-001',
    date: '2026-04-14',
    company: companyId.toString(),
    branch: 'Lucknow Main Branch',
    type: 'Sales Return',
    status: 'Approved',
    customer: 'City Care Medical Store',
    customerCode: 'CUS-001',
    originalInvoiceNo: 'APD-001',
    originalInvoiceDate: '2026-04-08',
    items: [
      {
        product: 'Pharma Tablet A - Demo',
        batch: 'PTA-001',
        qty: 5,
        rate: 1500,
        taxPercent: 18,
        amount: 8850
      }
    ],
    cgst: 675,
    sgst: 675,
    summary: { subTotal: 7500, grandTotal: 8850 },
    remarks: 'City Care Medical Store returns 5 BOX at 1,500. Restored to batch PTA-001.',
    createdAt: new Date('2026-04-14T14:00:00Z'),
    updatedAt: new Date()
  });

  await db.collection('salereturns').insertOne({
    returnNo: 'SR-001',
    invoiceNo: 'APD-001',
    customer: 'City Care Medical Store',
    customerMobile: '+91 9839033333',
    date: '2026-04-14',
    totalAmount: 8850,
    items: [
      {
        name: 'Pharma Tablet A - Demo',
        code: 'PT-A',
        quantity: 5,
        price: 1500,
        taxPercent: 18,
        total: 8850
      }
    ],
    reason: 'Approved sales return',
    company: companyId,
    createdAt: new Date('2026-04-14T14:00:00Z')
  });
  console.log(`✓ Inserted Sales Return & Credit Note CN-001 (5 BOX, ₹8,850)`);

  console.log('\n--- 11. CREATING PURCHASE RETURN & DEBIT NOTE (15 APR) ---');
  await db.collection('debitnotes').deleteMany({ company: companyId });
  await db.collection('purchasereturns').deleteMany({ company: companyId });

  await db.collection('debitnotes').insertOne({
    debitNoteNo: 'DN-001',
    voucherNo: 'VCH-DN-001',
    noteNo: 'NOTE-DN-001',
    date: '2026-04-15',
    company: companyId,
    branch: 'Lucknow Main Branch',
    type: 'Purchase Return',
    status: 'Approved',
    supplier: 'Modern Healthcare Distributors',
    originalInvoiceNo: 'MHD-001',
    originalInvoiceDate: '2026-04-06',
    items: [
      {
        product: 'Pharma Tablet A - Demo',
        qty: 10,
        rate: 1100,
        amount: 11000
      }
    ],
    discount: 0,
    taxAmount: 1980, // CGST 990 + SGST 990
    summary: { subTotal: 11000, grandTotal: 12980 },
    remarks: 'Return 10 BOX at 1,100 to Modern Healthcare Distributors. Batch PTA-002.',
    createdAt: new Date('2026-04-15T15:00:00Z'),
    updatedAt: new Date()
  });

  await db.collection('purchasereturns').insertOne({
    returnNo: 'PR-001',
    purchaseNo: 'PUR-002',
    referenceNo: 'MHD-001',
    supplier: supp2Id,
    returnDate: '2026-04-15',
    grandTotal: 12980,
    items: [
      {
        name: 'Pharma Tablet A - Demo',
        code: 'PT-A',
        quantity: 10,
        netUnitCost: 1100,
        taxPercent: 18,
        total: 12980
      }
    ],
    company: companyId,
    createdAt: new Date('2026-04-15T15:00:00Z')
  });
  console.log(`✓ Inserted Purchase Return & Debit Note DN-001 (10 BOX, ₹12,980)`);

  console.log('\n--- 12. CREATING RECEIPTS (BANK & CASH) ---');
  await db.collection('receipts').deleteMany({ company: companyId.toString() });
  await db.collection('bankreceipts').deleteMany({ company: companyId.toString() });

  const receipts = [
    {
      receiptNo: 'RCP-001',
      voucherNo: 'VCH-RCP-001',
      receiptDate: '2026-04-01',
      receiptType: 'Capital Introduction',
      company: companyId.toString(),
      branch: 'Lucknow Main Branch',
      warehouse: 'Main Pharma Godown',
      status: 'Posted',
      customerParty: 'Amit Sharma (Proprietor)',
      paymentAmount: 1000000,
      paymentMethod: 'Multiple (Bank 900,000 + Cash 100,000)',
      account: 'Owner Capital',
      remarks: 'Entry 01: Bank Dr 900,000; Cash Dr 100,000; Owner Capital Cr 1,000,000.',
      createdAt: new Date('2026-04-01T09:30:00Z')
    },
    {
      receiptNo: 'RCP-002',
      voucherNo: 'VCH-RCP-002',
      receiptDate: '2026-04-01',
      receiptType: 'Business Loan',
      company: companyId.toString(),
      branch: 'Lucknow Main Branch',
      warehouse: 'Main Pharma Godown',
      status: 'Posted',
      customerParty: 'Business Loan Account',
      paymentAmount: 200000,
      paymentMethod: 'Bank Transfer (NEFT/RTGS)',
      account: 'Business Loan',
      remarks: 'Entry 02: Bank Dr 200,000; Business Loan Cr 200,000.',
      createdAt: new Date('2026-04-01T10:00:00Z')
    },
    {
      receiptNo: 'RCP-003',
      voucherNo: 'VCH-RCP-003',
      receiptDate: '2026-04-12',
      receiptType: 'Customer Collection',
      company: companyId.toString(),
      branch: 'Lucknow Main Branch',
      warehouse: 'Main Pharma Godown',
      status: 'Posted',
      customerParty: 'City Care Medical Store',
      referenceInvoice: 'APD-001',
      paymentAmount: 70000,
      paymentMethod: 'Bank Transfer (NEFT)',
      account: 'Business Bank Account',
      remarks: 'Entry 12: Bank Dr 70,000; City Care Medical Store Cr 70,000 (against APD-001).',
      invoices: [{ referenceNo: 'APD-001', invoiceNo: 'APD-001', invoiceAmount: 106200, dueAmount: 36200, adjustAmount: 70000 }],
      totals: { received: 70000, adjusted: 70000, unadjusted: 0 },
      createdAt: new Date('2026-04-12T11:00:00Z')
    },
    {
      receiptNo: 'RCP-004',
      voucherNo: 'VCH-RCP-004',
      receiptDate: '2026-04-13',
      receiptType: 'Customer Collection',
      company: companyId.toString(),
      branch: 'Lucknow Main Branch',
      warehouse: 'Main Pharma Godown',
      status: 'Posted',
      customerParty: 'Sunrise Hospital Pharmacy',
      referenceInvoice: 'APD-002',
      paymentAmount: 30000,
      paymentMethod: 'Bank Transfer (NEFT)',
      account: 'Business Bank Account',
      remarks: 'Entry 13: Bank Dr 30,000; Sunrise Hospital Pharmacy Cr 30,000 (against APD-002).',
      invoices: [{ referenceNo: 'APD-002', invoiceNo: 'APD-002', invoiceAmount: 56640, dueAmount: 26640, adjustAmount: 30000 }],
      totals: { received: 30000, adjusted: 30000, unadjusted: 0 },
      createdAt: new Date('2026-04-13T11:00:00Z')
    }
  ];

  await db.collection('receipts').insertMany(receipts);

  // Bank Receipts
  await db.collection('bankreceipts').insertMany([
    {
      receiptNo: 'BRCP-001',
      receiptDate: '2026-04-12',
      company: companyId.toString(),
      branch: 'Lucknow Main Branch',
      bankAccount: 'Business Bank Account',
      customerParty: 'City Care Medical Store',
      invoiceNo: 'APD-001',
      amount: 70000,
      method: 'NEFT',
      bankLedger: 'Business Bank Account',
      customerLedger: 'City Care Medical Store',
      remarks: 'Collection against APD-001',
      createdAt: new Date('2026-04-12T11:00:00Z')
    },
    {
      receiptNo: 'BRCP-002',
      receiptDate: '2026-04-13',
      company: companyId.toString(),
      branch: 'Lucknow Main Branch',
      bankAccount: 'Business Bank Account',
      customerParty: 'Sunrise Hospital Pharmacy',
      invoiceNo: 'APD-002',
      amount: 30000,
      method: 'NEFT',
      bankLedger: 'Business Bank Account',
      customerLedger: 'Sunrise Hospital Pharmacy',
      remarks: 'Collection against APD-002',
      createdAt: new Date('2026-04-13T11:00:00Z')
    }
  ]);
  console.log(`✓ Inserted 4 Receipts (Capital: 1,000,000, Loan: 200,000, City Care: 70,000, Sunrise: 30,000)`);

  console.log('\n--- 13. CREATING PAYMENTS (SUPPLIERS & EXPENSES) ---');
  await db.collection('payments').deleteMany({ company: companyId.toString() });
  await db.collection('bankpayments').deleteMany({ company: companyId.toString() });

  const payments = [
    {
      paymentNo: 'PAY-001',
      paymentDate: '2026-04-02',
      paymentType: 'Security Deposit',
      company: companyId.toString(),
      status: 'Posted',
      supplierParty: 'Godown Owner',
      paymentAmount: 40000,
      paymentMethod: 'Bank',
      paidFromAccount: 'Business Bank Account',
      remarks: 'Entry 03: Refundable office/godown Security Deposit Dr 40,000; Bank Cr 40,000.'
    },
    {
      paymentNo: 'PAY-002',
      paymentDate: '2026-04-02',
      paymentType: 'Rent',
      company: companyId.toString(),
      status: 'Posted',
      supplierParty: 'Landlord',
      paymentAmount: 20000,
      paymentMethod: 'Bank',
      paidFromAccount: 'Business Bank Account',
      remarks: 'Entry 04: April Rent Dr 20,000; Bank Cr 20,000.'
    },
    {
      paymentNo: 'PAY-003',
      paymentDate: '2026-04-03',
      paymentType: 'Fixed Asset',
      company: companyId.toString(),
      status: 'Posted',
      supplierParty: 'Furniture Vendor',
      paymentAmount: 59000,
      paymentMethod: 'Bank',
      paidFromAccount: 'Business Bank Account',
      remarks: 'Entry 05: Furniture and racks Dr 50,000; Input CGST Dr 4,500; Input SGST Dr 4,500; Bank Cr 59,000.'
    },
    {
      paymentNo: 'PAY-004',
      paymentDate: '2026-04-03',
      paymentType: 'Fixed Asset',
      company: companyId.toString(),
      status: 'Posted',
      supplierParty: 'IT Solutions Vendor',
      paymentAmount: 47200,
      paymentMethod: 'Bank',
      paidFromAccount: 'Business Bank Account',
      remarks: 'Entry 06: Computer Dr 40,000; Input CGST Dr 3,600; Input SGST Dr 3,600; Bank Cr 47,200.'
    },
    {
      paymentNo: 'PAY-005',
      paymentDate: '2026-04-07',
      paymentType: 'Supplier',
      company: companyId.toString(),
      status: 'Posted',
      supplierParty: 'Prime Pharma Laboratories',
      invoiceNo: 'PPL-001',
      paymentAmount: 80000,
      paymentMethod: 'Bank',
      paidFromAccount: 'Business Bank Account',
      remarks: 'Entry 09: Prime Pharma Laboratories Dr 80,000; Bank Cr 80,000 (against PPL-001).'
    },
    {
      paymentNo: 'PAY-006',
      paymentDate: '2026-04-16',
      paymentType: 'Supplier',
      company: companyId.toString(),
      status: 'Posted',
      supplierParty: 'Modern Healthcare Distributors',
      invoiceNo: 'MHD-001',
      paymentAmount: 30000,
      paymentMethod: 'Bank',
      paidFromAccount: 'Business Bank Account',
      remarks: 'Entry 16: Modern Healthcare Distributors Dr 30,000; Bank Cr 30,000 (against MHD-001).'
    },
    {
      paymentNo: 'PAY-007',
      paymentDate: '2026-04-17',
      paymentType: 'Employee Advance',
      company: companyId.toString(),
      status: 'Posted',
      supplierParty: 'Rahul Verma',
      paymentAmount: 5000,
      paymentMethod: 'Bank',
      paidFromAccount: 'Business Bank Account',
      remarks: 'Entry 17: Employee Advance - Rahul Dr 5,000; Bank Cr 5,000.'
    },
    {
      paymentNo: 'PAY-008',
      paymentDate: '2026-04-18',
      paymentType: 'Utility',
      company: companyId.toString(),
      status: 'Posted',
      supplierParty: 'Electricity Board',
      paymentAmount: 3500,
      paymentMethod: 'Bank',
      paidFromAccount: 'Business Bank Account',
      remarks: 'Entry 18: Electricity Dr 3,500; Bank Cr 3,500.'
    },
    {
      paymentNo: 'PAY-009',
      paymentDate: '2026-04-19',
      paymentType: 'Utility',
      company: companyId.toString(),
      status: 'Posted',
      supplierParty: 'Internet Service Provider',
      paymentAmount: 1500,
      paymentMethod: 'Bank',
      paidFromAccount: 'Business Bank Account',
      remarks: 'Entry 19: Internet Dr 1,500; Bank Cr 1,500.'
    },
    {
      paymentNo: 'PAY-010',
      paymentDate: '2026-04-20',
      paymentType: 'Marketing',
      company: companyId.toString(),
      status: 'Posted',
      supplierParty: 'Marketing Agency',
      paymentAmount: 5000,
      paymentMethod: 'Bank',
      paidFromAccount: 'Business Bank Account',
      remarks: 'Entry 20: Marketing Dr 5,000; Bank Cr 5,000.'
    },
    {
      paymentNo: 'PAY-011',
      paymentDate: '2026-04-21',
      paymentType: 'Stationery',
      company: companyId.toString(),
      status: 'Posted',
      supplierParty: 'Stationery Shop',
      paymentAmount: 2000,
      paymentMethod: 'Cash',
      paidFromAccount: 'Cash',
      remarks: 'Entry 21: Stationery Dr 2,000; Cash Cr 2,000.'
    },
    {
      paymentNo: 'PAY-012',
      paymentDate: '2026-04-23',
      paymentType: 'Drawings',
      company: companyId.toString(),
      status: 'Posted',
      supplierParty: 'Amit Sharma (Drawings)',
      paymentAmount: 10000,
      paymentMethod: 'Cash',
      paidFromAccount: 'Cash',
      remarks: 'Entry 23: Owner Drawings Dr 10,000; Cash Cr 10,000.'
    },
    {
      paymentNo: 'PAY-013',
      paymentDate: '2026-04-24',
      paymentType: 'Insurance',
      company: companyId.toString(),
      status: 'Posted',
      supplierParty: 'Insurance Company',
      paymentAmount: 12000,
      paymentMethod: 'Bank',
      paidFromAccount: 'Business Bank Account',
      remarks: 'Entry 24: Prepaid Insurance Dr 12,000; Bank Cr 12,000 (12 months from 01 April).'
    },
    {
      paymentNo: 'PAY-014',
      paymentDate: '2026-04-25',
      paymentType: 'Bank Charges',
      company: companyId.toString(),
      status: 'Posted',
      supplierParty: 'Bank',
      paymentAmount: 500,
      paymentMethod: 'Bank',
      paidFromAccount: 'Business Bank Account',
      remarks: 'Entry 25: Bank Charges Dr 500; Bank Cr 500.'
    },
    {
      paymentNo: 'PAY-015',
      paymentDate: '2026-04-30',
      paymentType: 'Payroll',
      company: companyId.toString(),
      status: 'Posted',
      supplierParty: 'Staff Net Salary',
      paymentAmount: 63000,
      paymentMethod: 'Bank',
      paidFromAccount: 'Business Bank Account',
      remarks: 'Entry 27: Total Salary Payable Dr 63,000; Bank Cr 63,000 (Rahul 20k, Neha 23k, Mohit 20k).'
    },
    {
      paymentNo: 'PAY-016',
      paymentDate: '2026-04-30',
      paymentType: 'Loan Repayment',
      company: companyId.toString(),
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

  // Bank payments collection
  const bankPaymentsList = payments.filter(p => p.paymentMethod === 'Bank').map((p, idx) => ({
    paymentId: `BPAY-${p.paymentNo}`,
    paymentNo: `B${p.paymentNo}`,
    paymentDate: p.paymentDate,
    company: companyId.toString(),
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

  console.log('\n--- 14. CREATING CONTRA ENTRY (22 APR) ---');
  await db.collection('contras').deleteMany({ company: companyId.toString() });

  await db.collection('contras').insertOne({
    contraNo: 'CNTR-001',
    contraDate: '2026-04-22',
    company: companyId.toString(),
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

  console.log('\n--- 15. CREATING EMPLOYEES & PAYROLL MASTER ---');
  await db.collection('employees').deleteMany({ company: companyId.toString() });

  const employees = [
    {
      employeeId: 'EMP-001',
      employeeName: 'Rahul Verma',
      gender: 'Male',
      mobile: '+91 9839055551',
      email: 'rahul.verma@apexpharma.com',
      company: companyId.toString(),
      branch: 'Lucknow Main Branch',
      department: 'Sales & Marketing',
      role: 'Pharma Sales Executive',
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
      employeeId: 'EMP-002',
      employeeName: 'Neha Singh',
      gender: 'Female',
      mobile: '+91 9839055552',
      email: 'neha.singh@apexpharma.com',
      company: companyId.toString(),
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
      employeeId: 'EMP-003',
      employeeName: 'Mohit Kumar',
      gender: 'Male',
      mobile: '+91 9839055553',
      email: 'mohit.kumar@apexpharma.com',
      company: companyId.toString(),
      branch: 'Lucknow Main Branch',
      department: 'Store & Dispatch',
      role: 'Store & Dispatch Executive',
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

  await db.collection('employees').insertMany(employees);
  console.log(`✓ Inserted 3 Employees (Rahul Verma, Neha Singh, Mohit Kumar)`);

  console.log('\n--- 16. CREATING DOUBLE-ENTRY VOUCHERS (JOURNAL / MONTH-END) ---');
  await db.collection('vouchers').deleteMany({ company: companyId });

  const vouchers = [
    // Entry 01: Capital Introduction
    {
      voucherNo: 'JV-001',
      date: '2026-04-01',
      voucherType: 'Receipt',
      company: companyId,
      status: 'Posted',
      generalNarration: 'Entry 01: Owner Capital Introduced (Bank 900,000 + Cash 100,000)',
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
      voucherNo: 'JV-002',
      date: '2026-04-01',
      voucherType: 'Receipt',
      company: companyId,
      status: 'Posted',
      generalNarration: 'Entry 02: Business Loan received in Bank',
      totalDebit: 200000,
      totalCredit: 200000,
      entries: [
        { account: ledgerMap['Business Bank Account'], debitAmount: 200000, creditAmount: 0, narration: 'Bank Dr' },
        { account: ledgerMap['Business Loan'], debitAmount: 0, creditAmount: 200000, narration: 'Business Loan Cr' }
      ]
    },
    // Entry 05: Furniture Asset Purchase
    {
      voucherNo: 'JV-003',
      date: '2026-04-03',
      voucherType: 'Payment',
      company: companyId,
      status: 'Posted',
      generalNarration: 'Entry 05: Furniture and medicine racks Dr 50,000; Input CGST 4,500; Input SGST 4,500; Bank Cr 59,000.',
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
      voucherNo: 'JV-004',
      date: '2026-04-03',
      voucherType: 'Payment',
      company: companyId,
      status: 'Posted',
      generalNarration: 'Entry 06: Computer Dr 40,000; Input CGST 3,600; Input SGST 3,600; Bank Cr 47,200.',
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
      voucherNo: 'JV-005',
      date: '2026-04-30',
      voucherType: 'Journal',
      company: companyId,
      status: 'Posted',
      generalNarration: 'Entry 26: Salary Accrual for April 2026 (Expense Dr 70,000; Advance Cr 5,000; Other Deduction Cr 2,000; Salary Payable Cr 63,000)',
      totalDebit: 70000,
      totalCredit: 70000,
      entries: [
        { account: ledgerMap['Salary Expense'], debitAmount: 70000, creditAmount: 0, narration: 'Salary Expense Dr' },
        { account: ledgerMap['Employee Advance - Rahul'], debitAmount: 0, creditAmount: 5000, narration: 'Employee Advance Cr' },
        { account: ledgerMap['Other Salary Deduction Payable'], debitAmount: 0, creditAmount: 2000, narration: 'Other Deduction Cr' },
        { account: ledgerMap['Salary Payable'], debitAmount: 0, creditAmount: 63000, narration: 'Salary Payable Cr' }
      ]
    },
    // Entry 28: Loan Installment
    {
      voucherNo: 'JV-006',
      date: '2026-04-30',
      voucherType: 'Payment',
      company: companyId,
      status: 'Posted',
      generalNarration: 'Entry 28: Business Loan Dr 10,000; Interest Expense Dr 2,000; Bank Cr 12,000.',
      totalDebit: 12000,
      totalCredit: 12000,
      entries: [
        { account: ledgerMap['Business Loan'], debitAmount: 10000, creditAmount: 0, narration: 'Loan Principal Repayment Dr' },
        { account: ledgerMap['Interest Expense'], debitAmount: 2000, creditAmount: 0, narration: 'Interest Expense Dr' },
        { account: ledgerMap['Business Bank Account'], debitAmount: 0, creditAmount: 12000, narration: 'Bank Cr' }
      ]
    },
    // Entry 29: Prepaid Insurance Monthly Amortization
    {
      voucherNo: 'JV-007',
      date: '2026-04-30',
      voucherType: 'Journal',
      company: companyId,
      status: 'Posted',
      generalNarration: 'Entry 29: Insurance Expense Dr 1,000; Prepaid Insurance Cr 1,000.',
      totalDebit: 1000,
      totalCredit: 1000,
      entries: [
        { account: ledgerMap['Insurance Expense'], debitAmount: 1000, creditAmount: 0, narration: 'Monthly Insurance Expense Dr' },
        { account: ledgerMap['Prepaid Insurance'], debitAmount: 0, creditAmount: 1000, narration: 'Prepaid Insurance Cr' }
      ]
    },
    // Entry 30: Depreciation Expense
    {
      voucherNo: 'JV-008',
      date: '2026-04-30',
      voucherType: 'Journal',
      company: companyId,
      status: 'Posted',
      generalNarration: 'Entry 30: Depreciation Expense Dr 1,500; Acc. Dep Furniture Cr 500; Acc. Dep Computer Cr 1,000.',
      totalDebit: 1500,
      totalCredit: 1500,
      entries: [
        { account: ledgerMap['Depreciation Expense'], debitAmount: 1500, creditAmount: 0, narration: 'Depreciation Expense Dr' },
        { account: ledgerMap['Accumulated Depreciation - Furniture'], debitAmount: 0, creditAmount: 500, narration: 'Acc Dep Furniture Cr' },
        { account: ledgerMap['Accumulated Depreciation - Computer'], debitAmount: 0, creditAmount: 1000, narration: 'Acc Dep Computer Cr' }
      ]
    },
    // Entry 31: GST Set-Off
    {
      voucherNo: 'JV-009',
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
  console.log(`✓ Inserted ${vouchers.length} Journal/Double-Entry Vouchers (Capital, Loan, Assets, Salary Accrual, Depreciation, GST Set-Off).`);

  console.log('\n================================================================');
  console.log('🎉 APEX PHARMA DISTRIBUTORS COMPLETE DATASET SEEDING FINISHED!');
  console.log('================================================================\n');

  process.exit(0);
}

seedApexPharma().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
