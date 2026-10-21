const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/erp_global';

async function seedRemainingData() {
  console.log(`Connecting to MongoDB (${MONGO_URI})...`);
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB!');
  const db = mongoose.connection.db;

  const company = await db.collection('companies').findOne({ code: 'APD' });
  if (!company) {
    console.error('Company APD not found!');
    process.exit(1);
  }
  const companyId = company._id;
  const companyStr = companyId.toString();

  console.log(`\nUsing Company: ${company.name} [ID: ${companyId}]`);

  // 1. DEPARTMENTS
  console.log('\n--- 1. SEEDING DEPARTMENTS ---');
  await db.collection('departments').deleteMany({
    $or: [{ company: companyId }, { company: companyStr }]
  });

  const departments = [
    {
      deptCode: 'D-SALES',
      deptName: 'Sales & Marketing',
      description: 'Pharma Field Sales, Distribution & Marketing',
      status: 'Active',
      company: companyStr,
      createdAt: new Date('2026-04-01T09:00:00Z'),
      updatedAt: new Date()
    },
    {
      deptCode: 'D-ACCTS',
      deptName: 'Accounts & Finance',
      description: 'Billing, Bookkeeping, Taxation & Payroll',
      status: 'Active',
      company: companyStr,
      createdAt: new Date('2026-04-01T09:00:00Z'),
      updatedAt: new Date()
    },
    {
      deptCode: 'D-LOGIS',
      deptName: 'Warehouse & Logistics',
      description: 'Godown Management, Batch Sorting & Dispatch',
      status: 'Active',
      company: companyStr,
      createdAt: new Date('2026-04-01T09:00:00Z'),
      updatedAt: new Date()
    }
  ];
  for (const d of departments) {
    await db.collection('departments').updateOne(
      { deptCode: d.deptCode },
      { $set: d },
      { upsert: true }
    );
  }
  console.log(`✓ Upserted ${departments.length} Departments`);

  // 2. DESIGNATIONS
  console.log('\n--- 2. SEEDING DESIGNATIONS ---');

  const designations = [
    {
      desigCode: 'DES-PSE',
      desigName: 'Pharma Sales Executive',
      desigType: 'Executive',
      department: 'Sales & Marketing',
      status: 'Active',
      jobTitle: 'Pharma Sales Executive',
      employmentType: 'Permanent',
      company: companyStr,
      createdAt: new Date('2026-04-01T09:00:00Z'),
      updatedAt: new Date()
    },
    {
      desigCode: 'DES-ACCT',
      desigName: 'Accountant',
      desigType: 'Executive',
      department: 'Accounts & Finance',
      status: 'Active',
      jobTitle: 'Accountant',
      employmentType: 'Permanent',
      company: companyStr,
      createdAt: new Date('2026-04-01T09:00:00Z'),
      updatedAt: new Date()
    },
    {
      desigCode: 'DES-SDE',
      desigName: 'Store & Dispatch Executive',
      desigType: 'Executive',
      department: 'Warehouse & Logistics',
      status: 'Active',
      jobTitle: 'Store & Dispatch Executive',
      employmentType: 'Permanent',
      company: companyStr,
      createdAt: new Date('2026-04-01T09:00:00Z'),
      updatedAt: new Date()
    }
  ];
  for (const d of designations) {
    await db.collection('designations').updateOne(
      { desigCode: d.desigCode },
      { $set: d },
      { upsert: true }
    );
  }
  console.log(`✓ Upserted ${designations.length} Designations`);

  // 3. UPDATE EMPLOYEES WITH DEPARTMENTS & LINKAGE
  console.log('\n--- 3. UPDATING EMPLOYEES ---');
  const empList = await db.collection('employees').find({
    $or: [{ company: companyId }, { company: companyStr }]
  }).toArray();

  for (const emp of empList) {
    let dept = 'Sales & Marketing';
    let desig = 'Pharma Sales Executive';
    if (emp.employeeName.includes('Neha')) {
      dept = 'Accounts & Finance';
      desig = 'Accountant';
    } else if (emp.employeeName.includes('Mohit')) {
      dept = 'Warehouse & Logistics';
      desig = 'Store & Dispatch Executive';
    }
    await db.collection('employees').updateOne(
      { _id: emp._id },
      {
        $set: {
          department: dept,
          role: desig,
          branch: 'Lucknow Main Branch',
          company: companyStr,
          companyId: companyId
        }
      }
    );
  }
  console.log(`✓ Updated ${empList.length} Employees with Department & Role`);

  // 4. SALARY STRUCTURES
  console.log('\n--- 4. SEEDING SALARY STRUCTURES ---');
  await db.collection('salarystructures').deleteMany({
    $or: [{ company: companyId }, { company: companyStr }]
  });

  const salaryStructures = [
    {
      code: 'SS-RAHUL',
      name: 'Salary Structure - Rahul Verma',
      employeeId: 'EMP-001',
      employeeName: 'Rahul Verma',
      company: companyStr,
      branch: 'Lucknow Main Branch',
      department: 'Sales & Marketing',
      designation: 'Pharma Sales Executive',
      currency: 'INR',
      effectiveFrom: '2026-04-01',
      status: 'Active',
      workingDays: '30',
      earnings: [
        { component: 'Basic Salary', type: 'Fixed', amount: 15000, calculatedValue: 15000 },
        { component: 'HRA', type: 'Fixed', amount: 5000, calculatedValue: 5000 },
        { component: 'Conveyance & Medical', type: 'Fixed', amount: 5000, calculatedValue: 5000 }
      ],
      deductions: [
        { component: 'Salary Advance Recovery', type: 'Fixed', amount: 5000, calculatedValue: 5000 }
      ],
      totals: {
        basic: 15000,
        grossEarnings: 25000,
        totalDeductions: 5000,
        netSalary: 20000,
        employerCost: 25000,
        ctc: 25000
      },
      createdAt: new Date('2026-04-01T09:00:00Z'),
      updatedAt: new Date()
    },
    {
      code: 'SS-NEHA',
      name: 'Salary Structure - Neha Singh',
      employeeId: 'EMP-002',
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
      totals: {
        basic: 15000,
        grossEarnings: 25000,
        totalDeductions: 2000,
        netSalary: 23000,
        employerCost: 25000,
        ctc: 25000
      },
      createdAt: new Date('2026-04-01T09:00:00Z'),
      updatedAt: new Date()
    },
    {
      code: 'SS-MOHIT',
      name: 'Salary Structure - Mohit Kumar',
      employeeId: 'EMP-003',
      employeeName: 'Mohit Kumar',
      company: companyStr,
      branch: 'Lucknow Main Branch',
      department: 'Warehouse & Logistics',
      designation: 'Store & Dispatch Executive',
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
      totals: {
        basic: 12000,
        grossEarnings: 20000,
        totalDeductions: 0,
        netSalary: 20000,
        employerCost: 20000,
        ctc: 20000
      },
      createdAt: new Date('2026-04-01T09:00:00Z'),
      updatedAt: new Date()
    }
  ];
  await db.collection('salarystructures').insertMany(salaryStructures);
  console.log(`✓ Inserted ${salaryStructures.length} Salary Structures`);

  // 5. PAYSLIPS (APRIL 2026)
  console.log('\n--- 5. SEEDING PAYSLIPS (APRIL 2026) ---');
  await db.collection('payslips').deleteMany({
    $or: [{ company: companyId }, { company: companyStr }]
  });

  const empRahul = empList.find(e => e.employeeName.includes('Rahul'));
  const empNeha = empList.find(e => e.employeeName.includes('Neha'));
  const empMohit = empList.find(e => e.employeeName.includes('Mohit'));

  const payslips = [
    {
      employee: empRahul ? empRahul._id : new mongoose.Types.ObjectId(),
      month: 'April',
      year: '2026',
      workingDays: 30,
      paidDays: 30,
      basicSalary: 15000,
      hra: 5000,
      da: 0,
      otherAllowances: 5000,
      pfDeduction: 0,
      esiDeduction: 0,
      loanDeduction: 5000, // Employee Advance Recovery
      grossEarnings: 25000,
      totalDeductions: 5000,
      netPay: 20000,
      status: 'Paid',
      company: companyId,
      createdAt: new Date('2026-04-30T17:00:00Z'),
      updatedAt: new Date()
    },
    {
      employee: empNeha ? empNeha._id : new mongoose.Types.ObjectId(),
      month: 'April',
      year: '2026',
      workingDays: 30,
      paidDays: 30,
      basicSalary: 15000,
      hra: 5000,
      da: 0,
      otherAllowances: 5000,
      pfDeduction: 0,
      esiDeduction: 0,
      loanDeduction: 2000, // Other salary deduction
      grossEarnings: 25000,
      totalDeductions: 2000,
      netPay: 23000,
      status: 'Paid',
      company: companyId,
      createdAt: new Date('2026-04-30T17:00:00Z'),
      updatedAt: new Date()
    },
    {
      employee: empMohit ? empMohit._id : new mongoose.Types.ObjectId(),
      month: 'April',
      year: '2026',
      workingDays: 30,
      paidDays: 30,
      basicSalary: 12000,
      hra: 4000,
      da: 0,
      otherAllowances: 4000,
      pfDeduction: 0,
      esiDeduction: 0,
      loanDeduction: 0,
      grossEarnings: 20000,
      totalDeductions: 0,
      netPay: 20000,
      status: 'Paid',
      company: companyId,
      createdAt: new Date('2026-04-30T17:00:00Z'),
      updatedAt: new Date()
    }
  ];
  await db.collection('payslips').insertMany(payslips);
  console.log(`✓ Inserted ${payslips.length} Payslips for April 2026 (Total Net Pay: ₹63,000)`);

  // 6. UNITS & CONVERSIONS
  console.log('\n--- 6. SEEDING UNITS & CONVERSIONS ---');
  await db.collection('units').deleteMany({
    $or: [{ company: companyId }, { company: companyStr }]
  });

  const units = [
    {
      unitCode: 'BOX',
      code: 'BOX',
      unitName: 'Box (Root Unit)',
      name: 'Box',
      baseUnit: 'None (Root Unit)',
      operator: 'None',
      operationValue: 1,
      company: companyId,
      createdAt: new Date('2026-04-01T09:00:00Z')
    },
    {
      unitCode: 'STRIP',
      code: 'STRIP',
      unitName: 'Strip (10 Tablets)',
      name: 'Strip',
      baseUnit: 'BOX',
      operator: '/',
      operationValue: 10,
      company: companyId,
      createdAt: new Date('2026-04-01T09:00:00Z')
    },
    {
      unitCode: 'TAB',
      code: 'TAB',
      unitName: 'Tablet',
      name: 'Tablet',
      baseUnit: 'STRIP',
      operator: '/',
      operationValue: 10,
      company: companyId,
      createdAt: new Date('2026-04-01T09:00:00Z')
    }
  ];
  for (const u of units) {
    await db.collection('units').updateOne(
      { $or: [{ unitCode: u.unitCode }, { code: u.code }] },
      { $set: u },
      { upsert: true }
    );
  }
  console.log(`✓ Upserted ${units.length} Units (BOX, STRIP, TAB with 1 BOX = 10 Strips = 100 Tablets)`);

  // 7. BRANDS & CATEGORIES
  console.log('\n--- 7. SEEDING BRANDS & CATEGORIES ---');
  await db.collection('brands').deleteMany({
    $or: [{ company: companyId }, { company: companyStr }]
  });
  await db.collection('categories').deleteMany({
    $or: [{ company: companyId }, { company: companyStr }]
  });

  const brands = [
    {
      name: 'Prime Pharma Laboratories',
      status: true,
      featured: true,
      company: companyId,
      createdAt: new Date('2026-04-01T09:00:00Z')
    },
    {
      name: 'Modern Healthcare',
      status: true,
      featured: false,
      company: companyId,
      createdAt: new Date('2026-04-01T09:00:00Z')
    },
    {
      name: 'Apex Pharma',
      status: true,
      featured: true,
      company: companyId,
      createdAt: new Date('2026-04-01T09:00:00Z')
    }
  ];
  for (const b of brands) {
    await db.collection('brands').updateOne(
      { name: b.name },
      { $set: b },
      { upsert: true }
    );
  }

  const categories = [
    {
      name: 'Pharmaceutical Wholesale',
      parent: 'None',
      status: true,
      company: companyId,
      createdAt: new Date('2026-04-01T09:00:00Z')
    },
    {
      name: 'Antibiotics & Anti-infectives',
      parent: 'Pharmaceutical Wholesale',
      status: true,
      company: companyId,
      createdAt: new Date('2026-04-01T09:00:00Z')
    },
    {
      name: 'Tablets & Capsules',
      parent: 'Pharmaceutical Wholesale',
      status: true,
      company: companyId,
      createdAt: new Date('2026-04-01T09:00:00Z')
    }
  ];
  for (const c of categories) {
    await db.collection('categories').updateOne(
      { name: c.name },
      { $set: c },
      { upsert: true }
    );
  }
  console.log(`✓ Upserted ${brands.length} Brands & ${categories.length} Categories`);

  // 8. TAX SLABS
  console.log('\n--- 8. SEEDING TAX SLABS ---');
  await db.collection('taxslabs').deleteMany({
    $or: [{ company: companyId }, { company: companyStr }]
  });

  const taxSlabs = [
    {
      id: 'TAX-GST-18',
      name: 'GST 18%',
      type: 'GST',
      rate: 18,
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
    },
    {
      id: 'TAX-GST-12',
      name: 'GST 12%',
      type: 'GST',
      rate: 12,
      status: 'Active',
      gstType: 'CGST + SGST',
      cgst: 6,
      sgst: 6,
      igst: 12,
      cess: 0,
      transactionSales: true,
      transactionPurchase: true,
      placeState: 'Uttar Pradesh',
      taxTreatment: 'Intra-State',
      company: companyStr,
      createdAt: new Date('2026-04-01T09:00:00Z')
    },
    {
      id: 'TAX-GST-5',
      name: 'GST 5%',
      type: 'GST',
      rate: 5,
      status: 'Active',
      gstType: 'CGST + SGST',
      cgst: 2.5,
      sgst: 2.5,
      igst: 5,
      cess: 0,
      transactionSales: true,
      transactionPurchase: true,
      placeState: 'Uttar Pradesh',
      taxTreatment: 'Intra-State',
      company: companyStr,
      createdAt: new Date('2026-04-01T09:00:00Z')
    },
    {
      id: 'TAX-GST-0',
      name: 'GST 0% (Exempt)',
      type: 'GST',
      rate: 0,
      status: 'Active',
      gstType: 'Exempt',
      cgst: 0,
      sgst: 0,
      igst: 0,
      cess: 0,
      transactionSales: true,
      transactionPurchase: true,
      placeState: 'Uttar Pradesh',
      taxTreatment: 'Intra-State',
      company: companyStr,
      createdAt: new Date('2026-04-01T09:00:00Z')
    }
  ];
  for (const t of taxSlabs) {
    await db.collection('taxslabs').updateOne(
      { id: t.id },
      { $set: t },
      { upsert: true }
    );
  }
  console.log(`✓ Upserted ${taxSlabs.length} Tax Slabs`);

  // 9. PRICE LIST
  console.log('\n--- 9. SEEDING PRICE LISTS ---');
  await db.collection('pricelists').deleteMany({
    $or: [{ company: companyId }, { company: companyStr }]
  });

  const priceLists = [
    {
      id: 'PL-APD-01',
      priceListCode: 'PL-APD-01',
      name: 'Pharma Wholesale & Retail Price List 2026-27',
      priceType: 'Sales',
      applicableFor: 'Retailer',
      customerType: 'Retailer',
      currency: 'INR',
      effectiveFrom: '2026-04-01',
      defaultPriceList: true,
      status: true,
      notes: 'Standard Pricing for Apex Pharma Distributors. Includes Retail and Wholesale slabs.',
      productPricing: [
        {
          product: 'Pharma Tablet A - Demo',
          sku: 'PT-A',
          unit: 'BOX',
          retailRate: '1500',
          wholesaleRate: '1000',
          effectiveFrom: '2026-04-01'
        }
      ],
      quantityPricing: [
        { minQty: 1, maxQty: 49, price: '1500' },
        { minQty: 50, maxQty: 1000, price: '1000' }
      ],
      company: companyStr,
      createdAt: new Date('2026-04-01T09:00:00Z')
    }
  ];
  for (const pl of priceLists) {
    await db.collection('pricelists').updateOne(
      { id: pl.id },
      { $set: pl },
      { upsert: true }
    );
  }
  console.log(`✓ Upserted ${priceLists.length} Price Lists`);

  // 10. EXPENSE CATEGORIES
  console.log('\n--- 10. SEEDING EXPENSE CATEGORIES ---');
  await db.collection('expensecategories').deleteMany({
    $or: [{ company: companyId }, { company: companyStr }]
  });

  const expenseCategories = [
    { name: 'Office & Godown Rent', description: 'Monthly rent for warehouse & office', company: companyId, isActive: true },
    { name: 'Electricity & Utilities', description: 'Power and electricity bills', company: companyId, isActive: true },
    { name: 'Internet & Communications', description: 'Broadband and phone expenses', company: companyId, isActive: true },
    { name: 'Marketing & Promotions', description: 'Chemist visits, samples and marketing', company: companyId, isActive: true },
    { name: 'Office Stationery', description: 'Paper, bills, packaging supplies', company: companyId, isActive: true },
    { name: 'Bank Charges & Interest', description: 'Loan interest and bank service fees', company: companyId, isActive: true },
    { name: 'Insurance Expense', description: 'Stock & premises insurance coverage', company: companyId, isActive: true },
    { name: 'Staff Welfare & Advance', description: 'Employee advances and welfare', company: companyId, isActive: true }
  ];
  await db.collection('expensecategories').insertMany(expenseCategories);
  console.log(`✓ Inserted ${expenseCategories.length} Expense Categories`);

  // 11. SECTION 09 - ADDITIONAL PHARMA WORKFLOW TEST SETUP
  console.log('\n--- 11. PHARMA WORKFLOW TEST CASES SETUP ---');
  // Stock Adjustment for Damaged stock (2 BOX of PTA-001)
  await db.collection('adjustments').deleteMany({
    $or: [{ company: companyId }, { company: companyStr }]
  });

  const damagedAdjustment = {
    warehouse: 'Main Pharma Godown',
    documentName: 'ADJ-DMG-001',
    items: [
      {
        name: 'Pharma Tablet A - Demo',
        code: 'PT-A',
        batch: 'PTA-001',
        cost: 1000,
        quantity: 2,
        reason: 'Damage in transit/handling'
      }
    ],
    note: 'Workflow Test: 2 BOX of PTA-001 quarantined as damaged.',
    company: companyId,
    createdAt: new Date('2026-04-20T16:00:00Z')
  };
  await db.collection('adjustments').insertOne(damagedAdjustment);
  console.log(`✓ Recorded Pharma Stock Adjustment for Damaged stock (2 BOX of PTA-001)`);

  // Ensure all collections have matching company field in both string and ObjectId formats
  const apdUpdates = [
    'payments', 'receipts', 'bankpayments', 'bankreceipts',
    'contras', 'contraentries', 'creditnotes', 'debitnotes'
  ];
  for (const c of apdUpdates) {
    await db.collection(c).updateMany(
      { $or: [{ company: companyStr }, { company: companyId }] },
      { $set: { companyId: companyId, company: companyId } }
    );
  }
  console.log(`✓ Synchronized tenant keys for transaction collections.`);

  console.log('\n======================================================');
  console.log('✅ ALL REMAINING APEX PHARMA DATA SUCCESSFULLY SEEDED!');
  console.log('======================================================\n');
  process.exit(0);
}

seedRemainingData().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
