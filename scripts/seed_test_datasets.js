const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Company = require('../src/models/Company');
const User = require('../src/models/User');
const Role = require('../src/models/Role');
const { Branch } = require('../src/models/Branch');
const { Warehouse } = require('../src/models/Warehouse');
const { Supplier } = require('../src/models/Supplier');
const { Customer } = require('../src/models/Customer');
const { Product, Category, Brand } = require('../src/models/Product');
const { Purchase } = require('../src/models/Purchase');
const { Sale } = require('../src/models/Sale');
const { Payment } = require('../src/models/Payment');
const { Receipt } = require('../src/models/Receipt');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/global_erp';

async function seed() {
  console.log('Connecting to MongoDB at:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log('MongoDB Connected successfully!');

  // Find Admin role
  let adminRole = await Role.findOne({ name: { $in: ['Admin', 'CompanyAdmin'] } });
  if (!adminRole) {
    adminRole = await Role.findOne();
  }

  // Active default company (for live UI preview)
  const defaultCompany = await Company.findById('6a9e7740644976ba22c3c99a') || await Company.findOne();
  const defaultBranch = await Branch.findOne({ company: defaultCompany._id }) || await Branch.findOne();
  const defaultWarehouse = await Warehouse.findOne({ company: defaultCompany._id }) || await Warehouse.findOne();

  // ─────────────────────────────────────────────────────────────────────────
  // 1. DATASET 1: APEX PHARMA DISTRIBUTORS
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n--- Seeding Dataset 1: Apex Pharma Distributors ---');
  let pharmaCompany = await Company.findOne({ name: 'Apex Pharma Distributors' });
  if (!pharmaCompany) {
    pharmaCompany = await Company.create({
      name: 'Apex Pharma Distributors',
      code: 'APD',
      email: 'info@apexpharma.com',
      phone: '+91-9876500001',
      address: 'Indira Nagar',
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      gstin: '09AAAAA0000A1Z5',
      financialYear: '2026-2027',
      currency: 'INR (₹)',
      terms: 'Payment is due within 30 days.'
    });
  }

  let pharmaUser = await User.findOne({ email: 'apexpharma@gmail.com' });
  if (!pharmaUser) {
    pharmaUser = await User.create({
      username: 'apexpharma_admin',
      email: 'apexpharma@gmail.com',
      password: 'Admin@123',
      role: adminRole._id,
      company: pharmaCompany._id
    });
    console.log('User created: apexpharma@gmail.com / Admin@123');
  }

  let pharmaBranch = await Branch.findOne({ code: 'APD-LKO' });
  if (!pharmaBranch) {
    pharmaBranch = await Branch.create({
      id: 'BR-APD-01',
      code: 'APD-LKO',
      name: 'Apex Pharma HQ Lucknow',
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      company: pharmaCompany._id
    });
  }

  let pharmaWarehouse = await Warehouse.findOne({ code: 'WH-PHARMA-01' });
  if (!pharmaWarehouse) {
    pharmaWarehouse = await Warehouse.create({
      code: 'WH-PHARMA-01',
      name: 'Main Pharma Godown',
      location: 'Indira Nagar, Lucknow',
      branch: pharmaBranch._id,
      company: pharmaCompany._id
    });
  }

  // Suppliers
  const pSup1 = await Supplier.findOneAndUpdate(
    { supplierCode: 'SUP-APD-001' },
    {
      supplierCode: 'SUP-APD-001',
      companyName: 'Prime Pharma Laboratories',
      contactPerson: 'Sunil Verma',
      phone: '9876511001',
      email: 'orders@primepharma.com',
      gstin: '09AAACP1111A1Z1',
      paymentTerms: 'Net 30',
      creditLimit: 200000,
      balance: 38000,
      company: pharmaCompany._id,
      billingAddress: { city: 'Lucknow', state: 'Uttar Pradesh', country: 'India' }
    },
    { upsert: true, returnDocument: 'after' }
  );

  const pSup2 = await Supplier.findOneAndUpdate(
    { supplierCode: 'SUP-APD-002' },
    {
      supplierCode: 'SUP-APD-002',
      companyName: 'Modern Healthcare Distributors',
      contactPerson: 'Anil Gupta',
      phone: '9876511002',
      email: 'sales@modernhealthcare.com',
      gstin: '09AAACM2222A1Z2',
      paymentTerms: 'Net 30',
      creditLimit: 150000,
      balance: 21920,
      company: pharmaCompany._id,
      billingAddress: { city: 'Kanpur', state: 'Uttar Pradesh', country: 'India' }
    },
    { upsert: true, returnDocument: 'after' }
  );

  // Customers
  const pCus1 = await Customer.findOneAndUpdate(
    { customerCode: 'CUS-APD-001' },
    {
      customerCode: 'CUS-APD-001',
      name: 'City Care Medical Store',
      ownerName: 'Dr. R. K. Sharma',
      phone: '9876522001',
      email: 'citycare@gmail.com',
      pan: 'AAAAA1111A',
      creditPeriod: 15,
      creditLimit: 100000,
      openingBalance: 0,
      company: pharmaCompany._id,
      billingAddress: { street: 'Hazratganj', city: 'Lucknow', state: 'Uttar Pradesh', zip: '226001' }
    },
    { upsert: true, returnDocument: 'after' }
  );

  const pCus2 = await Customer.findOneAndUpdate(
    { customerCode: 'CUS-APD-002' },
    {
      customerCode: 'CUS-APD-002',
      name: 'Sunrise Hospital Pharmacy',
      ownerName: 'Purchase Dept',
      phone: '9876522002',
      email: 'pharmacy@sunrisehospital.com',
      pan: 'AAAAA2222A',
      creditPeriod: 30,
      creditLimit: 150000,
      openingBalance: 0,
      company: pharmaCompany._id,
      billingAddress: { street: 'Gomti Nagar', city: 'Lucknow', state: 'Uttar Pradesh', zip: '226010' }
    },
    { upsert: true, returnDocument: 'after' }
  );

  // Product
  let pharmaCat = await Category.findOne({ name: 'Pharmaceuticals' });
  if (!pharmaCat) pharmaCat = await Category.create({ name: 'Pharmaceuticals', company: pharmaCompany._id });

  let pharmaBrand = await Brand.findOne({ name: 'Apex Pharma' });
  if (!pharmaBrand) pharmaBrand = await Brand.create({ name: 'Apex Pharma', company: pharmaCompany._id });

  const pProd = await Product.findOneAndUpdate(
    { productCode: 'PT-A' },
    {
      productName: 'Pharma Tablet A - Demo',
      productCode: 'PT-A',
      sku: 'SKU-PTA-01',
      productUnit: 'BOX',
      productCost: '1000',
      productPrice: '1500',
      productTax: '18%',
      currentStock: 55,
      category: pharmaCat._id,
      brand: pharmaBrand._id,
      hasBatchAndExpiry: true,
      company: pharmaCompany._id
    },
    { upsert: true, returnDocument: 'after' }
  );

  // Purchases
  await Purchase.findOneAndUpdate(
    { purchaseNo: 'PUR-PPL-001' },
    {
      purchaseDate: '2026-04-04',
      referenceNo: 'PPL-001',
      purchaseNo: 'PUR-PPL-001',
      company: pharmaCompany._id,
      branch: pharmaBranch._id,
      warehouse: pharmaWarehouse._id,
      supplier: pSup1._id,
      purchaseStatus: 'Received',
      paymentStatus: 'Partial',
      grandTotal: 118000,
      amountPaid: 80000,
      orderTax: '18%',
      orderItems: [{
        name: 'Pharma Tablet A - Demo (Batch PTA-001, Exp 31/12/2027)',
        code: 'PT-A',
        quantity: 100,
        netUnitCost: 1000,
        taxPercent: 18,
        productPrice: 1500,
        product: pProd._id
      }]
    },
    { upsert: true, returnDocument: 'after' }
  );

  await Purchase.findOneAndUpdate(
    { purchaseNo: 'PUR-MHD-001' },
    {
      purchaseDate: '2026-04-06',
      referenceNo: 'MHD-001',
      purchaseNo: 'PUR-MHD-001',
      company: pharmaCompany._id,
      branch: pharmaBranch._id,
      warehouse: pharmaWarehouse._id,
      supplier: pSup2._id,
      purchaseStatus: 'Received',
      paymentStatus: 'Partial',
      grandTotal: 64900,
      amountPaid: 30000,
      orderTax: '18%',
      orderItems: [{
        name: 'Pharma Tablet A - Demo (Batch PTA-002, Exp 31/01/2028)',
        code: 'PT-A',
        quantity: 50,
        netUnitCost: 1100,
        taxPercent: 18,
        productPrice: 1600,
        product: pProd._id
      }]
    },
    { upsert: true, returnDocument: 'after' }
  );

  // Sales
  await Sale.findOneAndUpdate(
    { invoiceNo: 'INV-APD-001' },
    {
      invoiceNo: 'INV-APD-001',
      saleDate: '2026-04-08',
      referenceNo: 'APD-001',
      company: pharmaCompany._id,
      branch: pharmaBranch._id,
      warehouse: pharmaWarehouse._id,
      customer: pCus1._id,
      saleStatus: 'Completed',
      paymentStatus: 'Partial',
      grandTotal: 106200,
      amountPaid: 70000,
      orderTax: '18%',
      orderItems: [{
        name: 'Pharma Tablet A - Demo (Batch PTA-001)',
        code: 'PT-A',
        quantity: 60,
        netUnitPrice: 1500,
        taxPercent: 18,
        total: 106200,
        product: pProd._id
      }]
    },
    { upsert: true, returnDocument: 'after' }
  );

  await Sale.findOneAndUpdate(
    { invoiceNo: 'INV-APD-002' },
    {
      invoiceNo: 'INV-APD-002',
      saleDate: '2026-04-10',
      referenceNo: 'APD-002',
      company: pharmaCompany._id,
      branch: pharmaBranch._id,
      warehouse: pharmaWarehouse._id,
      customer: pCus2._id,
      saleStatus: 'Completed',
      paymentStatus: 'Partial',
      grandTotal: 56640,
      amountPaid: 30000,
      orderTax: '18%',
      orderItems: [{
        name: 'Pharma Tablet A - Demo (Batch PTA-001)',
        code: 'PT-A',
        quantity: 30,
        netUnitPrice: 1600,
        taxPercent: 18,
        total: 56640,
        product: pProd._id
      }]
    },
    { upsert: true, returnDocument: 'after' }
  );

  console.log('✓ Apex Pharma Distributors seeded successfully!');

  // ─────────────────────────────────────────────────────────────────────────
  // 2. DATASET 2: APEX OFFICE SOLUTIONS
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n--- Seeding Dataset 2: Apex Office Solutions ---');
  let officeCompany = await Company.findOne({ name: 'Apex Office Solutions' });
  if (!officeCompany) {
    officeCompany = await Company.create({
      name: 'Apex Office Solutions',
      code: 'AOS',
      email: 'info@apexofficesolutions.com',
      phone: '+91-9876500002',
      address: 'Indira Nagar',
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      gstin: '09BBBBB0000B1Z6',
      financialYear: '2026-2027',
      currency: 'INR (₹)',
      terms: 'Payment is due within 30 days.'
    });
  }

  let officeUser = await User.findOne({ email: 'apexoffice@gmail.com' });
  if (!officeUser) {
    officeUser = await User.create({
      username: 'apexoffice_admin',
      email: 'apexoffice@gmail.com',
      password: 'Admin@123',
      role: adminRole._id,
      company: officeCompany._id
    });
    console.log('User created: apexoffice@gmail.com / Admin@123');
  }

  let officeBranch = await Branch.findOne({ code: 'AOS-LKO' });
  if (!officeBranch) {
    officeBranch = await Branch.create({
      id: 'BR-AOS-01',
      code: 'AOS-LKO',
      name: 'Apex Office HQ Lucknow',
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      company: officeCompany._id
    });
  }

  let officeWarehouse = await Warehouse.findOne({ code: 'WH-AOS-01' });
  if (!officeWarehouse) {
    officeWarehouse = await Warehouse.create({
      code: 'WH-AOS-01',
      name: 'Main Godown',
      location: 'Indira Nagar, Lucknow',
      branch: officeBranch._id,
      company: officeCompany._id
    });
  }

  // Suppliers
  const oSup1 = await Supplier.findOneAndUpdate(
    { supplierCode: 'SUP-AOS-001' },
    {
      supplierCode: 'SUP-AOS-001',
      companyName: 'Prime Furniture Traders',
      contactPerson: 'Vikas Sharma',
      phone: '9876533001',
      email: 'contact@primefurniture.com',
      gstin: '09BBBBP3333B1Z3',
      paymentTerms: 'Net 30',
      creditLimit: 200000,
      balance: 38000,
      company: officeCompany._id,
      billingAddress: { city: 'Lucknow', state: 'Uttar Pradesh', country: 'India' }
    },
    { upsert: true, returnDocument: 'after' }
  );

  const oSup2 = await Supplier.findOneAndUpdate(
    { supplierCode: 'SUP-AOS-002' },
    {
      supplierCode: 'SUP-AOS-002',
      companyName: 'Modern Office Products',
      contactPerson: 'Suresh Verma',
      phone: '9876533002',
      email: 'sales@modernoffice.com',
      gstin: '09BBBBM4444B1Z4',
      paymentTerms: 'Net 30',
      creditLimit: 150000,
      balance: 21920,
      company: officeCompany._id,
      billingAddress: { city: 'Kanpur', state: 'Uttar Pradesh', country: 'India' }
    },
    { upsert: true, returnDocument: 'after' }
  );

  // Customers
  const oCus1 = await Customer.findOneAndUpdate(
    { customerCode: 'CUS-AOS-001' },
    {
      customerCode: 'CUS-AOS-001',
      name: 'Bright Academy',
      ownerName: 'Director Admin',
      phone: '9876544001',
      email: 'admin@brightacademy.edu',
      pan: 'BBBBA1111B',
      creditPeriod: 15,
      creditLimit: 100000,
      openingBalance: 0,
      company: officeCompany._id,
      billingAddress: { street: 'Aliganj', city: 'Lucknow', state: 'Uttar Pradesh', zip: '226024' }
    },
    { upsert: true, returnDocument: 'after' }
  );

  const oCus2 = await Customer.findOneAndUpdate(
    { customerCode: 'CUS-AOS-002' },
    {
      customerCode: 'CUS-AOS-002',
      name: 'Sunrise Consultancy',
      ownerName: 'Finance Manager',
      phone: '9876544002',
      email: 'accounts@sunriseconsultancy.com',
      pan: 'BBBBA2222B',
      creditPeriod: 30,
      creditLimit: 150000,
      openingBalance: 0,
      company: officeCompany._id,
      billingAddress: { street: 'Vibhuti Khand', city: 'Lucknow', state: 'Uttar Pradesh', zip: '226010' }
    },
    { upsert: true, returnDocument: 'after' }
  );

  // Product
  let officeCat = await Category.findOne({ name: 'Office Furniture' });
  if (!officeCat) officeCat = await Category.create({ name: 'Office Furniture', company: officeCompany._id });

  let officeBrand = await Brand.findOne({ name: 'Apex Office' });
  if (!officeBrand) officeBrand = await Brand.create({ name: 'Apex Office', company: officeCompany._id });

  const oProd = await Product.findOneAndUpdate(
    { productCode: 'CHAIR-A' },
    {
      productName: 'Office Chair - Model A',
      productCode: 'CHAIR-A',
      sku: 'SKU-CHAIR-A',
      productUnit: 'PCS',
      productCost: '1000',
      productPrice: '1500',
      productTax: '18%',
      currentStock: 55,
      category: officeCat._id,
      brand: officeBrand._id,
      company: officeCompany._id
    },
    { upsert: true, returnDocument: 'after' }
  );

  // Purchases
  await Purchase.findOneAndUpdate(
    { purchaseNo: 'PUR-PFT-001' },
    {
      purchaseDate: '2026-04-04',
      referenceNo: 'PFT-001',
      purchaseNo: 'PUR-PFT-001',
      company: officeCompany._id,
      branch: officeBranch._id,
      warehouse: officeWarehouse._id,
      supplier: oSup1._id,
      purchaseStatus: 'Received',
      paymentStatus: 'Partial',
      grandTotal: 118000,
      amountPaid: 80000,
      orderTax: '18%',
      orderItems: [{
        name: 'Office Chair - Model A',
        code: 'CHAIR-A',
        quantity: 100,
        netUnitCost: 1000,
        taxPercent: 18,
        productPrice: 1500,
        product: oProd._id
      }]
    },
    { upsert: true, returnDocument: 'after' }
  );

  await Purchase.findOneAndUpdate(
    { purchaseNo: 'PUR-MOP-001' },
    {
      purchaseDate: '2026-04-06',
      referenceNo: 'MOP-001',
      purchaseNo: 'PUR-MOP-001',
      company: officeCompany._id,
      branch: officeBranch._id,
      warehouse: officeWarehouse._id,
      supplier: oSup2._id,
      purchaseStatus: 'Received',
      paymentStatus: 'Partial',
      grandTotal: 64900,
      amountPaid: 30000,
      orderTax: '18%',
      orderItems: [{
        name: 'Office Chair - Model A',
        code: 'CHAIR-A',
        quantity: 50,
        netUnitCost: 1100,
        taxPercent: 18,
        productPrice: 1600,
        product: oProd._id
      }]
    },
    { upsert: true, returnDocument: 'after' }
  );

  // Sales
  await Sale.findOneAndUpdate(
    { invoiceNo: 'INV-AOS-001' },
    {
      invoiceNo: 'INV-AOS-001',
      saleDate: '2026-04-08',
      referenceNo: 'AOS-001',
      company: officeCompany._id,
      branch: officeBranch._id,
      warehouse: officeWarehouse._id,
      customer: oCus1._id,
      saleStatus: 'Completed',
      paymentStatus: 'Partial',
      grandTotal: 106200,
      amountPaid: 70000,
      orderTax: '18%',
      orderItems: [{
        name: 'Office Chair - Model A',
        code: 'CHAIR-A',
        quantity: 60,
        netUnitPrice: 1500,
        taxPercent: 18,
        total: 106200,
        product: oProd._id
      }]
    },
    { upsert: true, returnDocument: 'after' }
  );

  await Sale.findOneAndUpdate(
    { invoiceNo: 'INV-AOS-002' },
    {
      invoiceNo: 'INV-AOS-002',
      saleDate: '2026-04-10',
      referenceNo: 'AOS-002',
      company: officeCompany._id,
      branch: officeBranch._id,
      warehouse: officeWarehouse._id,
      customer: oCus2._id,
      saleStatus: 'Completed',
      paymentStatus: 'Partial',
      grandTotal: 56640,
      amountPaid: 30000,
      orderTax: '18%',
      orderItems: [{
        name: 'Office Chair - Model A',
        code: 'CHAIR-A',
        quantity: 30,
        netUnitPrice: 1600,
        taxPercent: 18,
        total: 56640,
        product: oProd._id
      }]
    },
    { upsert: true, returnDocument: 'after' }
  );

  console.log('✓ Apex Office Solutions seeded successfully!');

  // ─────────────────────────────────────────────────────────────────────────
  // 3. ALSO INJECT BOTH SUPPLIERS INTO CURRENT ACTIVE COMPANY FOR IMMEDIATE LIVE VIEW
  // ─────────────────────────────────────────────────────────────────────────
  if (defaultCompany && defaultBranch && defaultWarehouse) {
    console.log('\n--- Injected into Active Company (' + defaultCompany.name + ') for instant browser test ---');
    
    // Injected Suppliers
    const liveSup1 = await Supplier.findOneAndUpdate(
      { supplierCode: 'SUP-LIVE-001' },
      {
        supplierCode: 'SUP-LIVE-001',
        companyName: 'Prime Furniture Traders',
        contactPerson: 'Vikas Sharma',
        phone: '9876533001',
        email: 'contact@primefurniture.com',
        gstin: '09BBBBP3333B1Z3',
        paymentTerms: 'Net 30',
        creditLimit: 200000,
        balance: 38000,
        company: defaultCompany._id,
        billingAddress: { city: 'Lucknow', state: 'Uttar Pradesh', country: 'India' }
      },
      { upsert: true, returnDocument: 'after' }
    );

    const liveSup2 = await Supplier.findOneAndUpdate(
      { supplierCode: 'SUP-LIVE-002' },
      {
        supplierCode: 'SUP-LIVE-002',
        companyName: 'Modern Office Products',
        contactPerson: 'Suresh Verma',
        phone: '9876533002',
        email: 'sales@modernoffice.com',
        gstin: '09BBBBM4444B1Z4',
        paymentTerms: 'Net 30',
        creditLimit: 150000,
        balance: 21920,
        company: defaultCompany._id,
        billingAddress: { city: 'Kanpur', state: 'Uttar Pradesh', country: 'India' }
      },
      { upsert: true, returnDocument: 'after' }
    );

    const liveSup3 = await Supplier.findOneAndUpdate(
      { supplierCode: 'SUP-LIVE-003' },
      {
        supplierCode: 'SUP-LIVE-003',
        companyName: 'Prime Pharma Laboratories',
        contactPerson: 'Sunil Verma',
        phone: '9876511001',
        email: 'orders@primepharma.com',
        gstin: '09AAACP1111A1Z1',
        paymentTerms: 'Net 30',
        creditLimit: 200000,
        balance: 38000,
        company: defaultCompany._id,
        billingAddress: { city: 'Lucknow', state: 'Uttar Pradesh', country: 'India' }
      },
      { upsert: true, returnDocument: 'after' }
    );

    const liveSup4 = await Supplier.findOneAndUpdate(
      { supplierCode: 'SUP-LIVE-004' },
      {
        supplierCode: 'SUP-LIVE-004',
        companyName: 'Modern Healthcare Distributors',
        contactPerson: 'Anil Gupta',
        phone: '9876511002',
        email: 'sales@modernhealthcare.com',
        gstin: '09AAACM2222A1Z2',
        paymentTerms: 'Net 30',
        creditLimit: 150000,
        balance: 21920,
        company: defaultCompany._id,
        billingAddress: { city: 'Kanpur', state: 'Uttar Pradesh', country: 'India' }
      },
      { upsert: true, returnDocument: 'after' }
    );

    // Injected Purchases
    await Purchase.findOneAndUpdate(
      { purchaseNo: 'PUR-LIVE-PFT-001' },
      {
        purchaseDate: '2026-04-04',
        referenceNo: 'PFT-001',
        purchaseNo: 'PUR-LIVE-PFT-001',
        company: defaultCompany._id,
        branch: defaultBranch._id,
        warehouse: defaultWarehouse._id,
        supplier: liveSup1._id,
        purchaseStatus: 'Received',
        paymentStatus: 'Partial',
        grandTotal: 118000,
        amountPaid: 80000,
        orderTax: '18%',
        orderItems: [{
          name: 'Office Chair - Model A',
          code: 'CHAIR-A',
          quantity: 100,
          netUnitCost: 1000,
          taxPercent: 18,
          productPrice: 1500
        }]
      },
      { upsert: true, returnDocument: 'after' }
    );

    await Purchase.findOneAndUpdate(
      { purchaseNo: 'PUR-LIVE-MOP-001' },
      {
        purchaseDate: '2026-04-06',
        referenceNo: 'MOP-001',
        purchaseNo: 'PUR-LIVE-MOP-001',
        company: defaultCompany._id,
        branch: defaultBranch._id,
        warehouse: defaultWarehouse._id,
        supplier: liveSup2._id,
        purchaseStatus: 'Received',
        paymentStatus: 'Partial',
        grandTotal: 64900,
        amountPaid: 30000,
        orderTax: '18%',
        orderItems: [{
          name: 'Office Chair - Model A',
          code: 'CHAIR-A',
          quantity: 50,
          netUnitCost: 1100,
          taxPercent: 18,
          productPrice: 1600
        }]
      },
      { upsert: true, returnDocument: 'after' }
    );

    await Purchase.findOneAndUpdate(
      { purchaseNo: 'PUR-LIVE-PPL-001' },
      {
        purchaseDate: '2026-04-04',
        referenceNo: 'PPL-001',
        purchaseNo: 'PUR-LIVE-PPL-001',
        company: defaultCompany._id,
        branch: defaultBranch._id,
        warehouse: defaultWarehouse._id,
        supplier: liveSup3._id,
        purchaseStatus: 'Received',
        paymentStatus: 'Partial',
        grandTotal: 118000,
        amountPaid: 80000,
        orderTax: '18%',
        orderItems: [{
          name: 'Pharma Tablet A - Demo',
          code: 'PT-A',
          quantity: 100,
          netUnitCost: 1000,
          taxPercent: 18,
          productPrice: 1500
        }]
      },
      { upsert: true, returnDocument: 'after' }
    );

    await Purchase.findOneAndUpdate(
      { purchaseNo: 'PUR-LIVE-MHD-001' },
      {
        purchaseDate: '2026-04-06',
        referenceNo: 'MHD-001',
        purchaseNo: 'PUR-LIVE-MHD-001',
        company: defaultCompany._id,
        branch: defaultBranch._id,
        warehouse: defaultWarehouse._id,
        supplier: liveSup4._id,
        purchaseStatus: 'Received',
        paymentStatus: 'Partial',
        grandTotal: 64900,
        amountPaid: 30000,
        orderTax: '18%',
        orderItems: [{
          name: 'Pharma Tablet A - Demo',
          code: 'PT-A',
          quantity: 50,
          netUnitCost: 1100,
          taxPercent: 18,
          productPrice: 1600
        }]
      },
      { upsert: true, returnDocument: 'after' }
    );

    // Injected Products for active company
    let liveCat = await Category.findOne({ name: 'Commercial Goods', company: defaultCompany._id });
    if (!liveCat) liveCat = await Category.create({ name: 'Commercial Goods', company: defaultCompany._id });

    let liveBrand = await Brand.findOne({ name: 'Global Brand', company: defaultCompany._id });
    if (!liveBrand) liveBrand = await Brand.create({ name: 'Global Brand', company: defaultCompany._id });

    const liveProdChair = await Product.findOneAndUpdate(
      { productCode: 'CHAIR-LIVE-A', company: defaultCompany._id },
      {
        productName: 'Office Chair - Model A',
        productCode: 'CHAIR-LIVE-A',
        sku: 'SKU-LIVE-CHAIR-A',
        productUnit: 'PCS',
        productCost: '1000',
        productPrice: '1500',
        productTax: '18%',
        currentStock: 150,
        category: liveCat._id,
        brand: liveBrand._id,
        company: defaultCompany._id
      },
      { upsert: true, returnDocument: 'after' }
    );

    const liveProdPharma = await Product.findOneAndUpdate(
      { productCode: 'PT-LIVE-A', company: defaultCompany._id },
      {
        productName: 'Pharma Tablet A - Demo',
        productCode: 'PT-LIVE-A',
        sku: 'SKU-LIVE-PTA-01',
        productUnit: 'BOX',
        productCost: '1000',
        productPrice: '1500',
        productTax: '18%',
        currentStock: 150,
        category: liveCat._id,
        brand: liveBrand._id,
        hasBatchAndExpiry: true,
        company: defaultCompany._id
      },
      { upsert: true, returnDocument: 'after' }
    );

    // Injected Customers for active company
    const liveCus1 = await Customer.findOneAndUpdate(
      { customerCode: 'CUS-LIVE-001' },
      {
        customerCode: 'CUS-LIVE-001',
        name: 'Bright Academy',
        ownerName: 'Director Admin',
        phone: '9876544001',
        email: 'admin@brightacademy.edu',
        pan: 'BBBBA1111B',
        creditPeriod: 15,
        creditLimit: 200000,
        openingBalance: 0,
        company: defaultCompany._id,
        billingAddress: { street: 'Aliganj', city: 'Lucknow', state: 'Uttar Pradesh', zip: '226024' }
      },
      { upsert: true, returnDocument: 'after' }
    );

    const liveCus2 = await Customer.findOneAndUpdate(
      { customerCode: 'CUS-LIVE-002' },
      {
        customerCode: 'CUS-LIVE-002',
        name: 'City Care Medical Store',
        ownerName: 'Dr. R. K. Sharma',
        phone: '9876522001',
        email: 'citycare@gmail.com',
        pan: 'AAAAA1111A',
        creditPeriod: 15,
        creditLimit: 200000,
        openingBalance: 0,
        company: defaultCompany._id,
        billingAddress: { street: 'Hazratganj', city: 'Lucknow', state: 'Uttar Pradesh', zip: '226001' }
      },
      { upsert: true, returnDocument: 'after' }
    );

    // Injected Sales for active company
    await Sale.findOneAndUpdate(
      { invoiceNo: 'INV-LIVE-AOS-001' },
      {
        invoiceNo: 'INV-LIVE-AOS-001',
        saleDate: '2026-04-08',
        referenceNo: 'AOS-001',
        company: defaultCompany._id,
        branch: defaultBranch._id,
        warehouse: defaultWarehouse._id,
        customer: liveCus1._id,
        saleStatus: 'Completed',
        paymentStatus: 'Partial',
        grandTotal: 106200,
        amountPaid: 70000,
        orderTax: '18%',
        orderItems: [{
          name: 'Office Chair - Model A',
          code: 'CHAIR-A',
          quantity: 60,
          netUnitPrice: 1500,
          taxPercent: 18,
          total: 106200,
          product: liveProdChair._id
        }]
      },
      { upsert: true, returnDocument: 'after' }
    );

    await Sale.findOneAndUpdate(
      { invoiceNo: 'INV-LIVE-APD-001' },
      {
        invoiceNo: 'INV-LIVE-APD-001',
        saleDate: '2026-04-08',
        referenceNo: 'APD-001',
        company: defaultCompany._id,
        branch: defaultBranch._id,
        warehouse: defaultWarehouse._id,
        customer: liveCus2._id,
        saleStatus: 'Completed',
        paymentStatus: 'Partial',
        grandTotal: 106200,
        amountPaid: 70000,
        orderTax: '18%',
        orderItems: [{
          name: 'Pharma Tablet A - Demo',
          code: 'PT-A',
          quantity: 60,
          netUnitPrice: 1500,
          taxPercent: 18,
          total: 106200,
          product: liveProdPharma._id
        }]
      },
      { upsert: true, returnDocument: 'after' }
    );

    // Injected Payments to Suppliers
    await Payment.findOneAndUpdate(
      { paymentNo: 'PAY-LIVE-001' },
      {
        paymentNo: 'PAY-LIVE-001',
        paymentDate: '2026-04-12',
        company: defaultCompany._id,
        supplierParty: liveSup1.companyName,
        paymentType: 'Supplier',
        paymentMethod: 'Bank Transfer',
        paymentAmount: 50000
      },
      { upsert: true, returnDocument: 'after' }
    );

    await Payment.findOneAndUpdate(
      { paymentNo: 'PAY-LIVE-002' },
      {
        paymentNo: 'PAY-LIVE-002',
        paymentDate: '2026-04-12',
        company: defaultCompany._id,
        supplierParty: liveSup3.companyName,
        paymentType: 'Supplier',
        paymentMethod: 'Bank Transfer',
        paymentAmount: 50000
      },
      { upsert: true, returnDocument: 'after' }
    );

    console.log('✓ Successfully injected full dataset into active company!');
  }

  console.log('\n======================================================');
  console.log('ALL TEST DATASETS SUCCESSFULLY SEEDED INTO DATABASE!');
  console.log('======================================================');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seeding Error:', err);
  process.exit(1);
});
