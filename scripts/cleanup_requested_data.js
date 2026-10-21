const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/erp_global';

async function runCleanup(isDryRun = true) {
  console.log(`Connecting to MongoDB (${MONGO_URI})...`);
  await mongoose.connect(MONGO_URI);
  console.log('Connected successfully!');
  const db = mongoose.connection.db;

  console.log(`\n=================================================`);
  console.log(isDryRun ? '--- DRY RUN MODE (NO DATA WILL BE MODIFIED) ---' : '--- LIVE CLEANUP EXECUTION ---');
  console.log(`=================================================\n`);

  // 1. Identify Dummy Companies to Delete
  const dummyCompanies = await db.collection('companies').find({
    $or: [
      { name: { $regex: /Apex Pharma|Apex Office/i } },
      { email: { $in: ['info@apexpharma.com', 'info@apexofficesolutions.com'] } },
      { code: { $in: ['APD', 'AOS'] } }
    ]
  }).toArray();

  const dummyCompanyIds = dummyCompanies.map(c => c._id);
  console.log(`[1] Dummy Companies to Delete (${dummyCompanies.length}):`);
  dummyCompanies.forEach(c => console.log(`    - ID: ${c._id} | Name: ${c.name} | Email: ${c.email}`));

  // Companies to Keep
  const keptCompanies = await db.collection('companies').find({
    _id: { $nin: dummyCompanyIds }
  }).toArray();
  console.log(`\n[+] Companies to KEEP (${keptCompanies.length}):`);
  keptCompanies.forEach(c => console.log(`    ✓ ID: ${c._id} | Name: ${c.name} | Email: ${c.email}`));

  // 2. Identify Users of Dummy Companies
  const dummyUsers = await db.collection('users').find({
    $or: [
      { company: { $in: dummyCompanyIds } },
      { email: { $in: ['apexpharma@gmail.com', 'apexoffice@gmail.com'] } }
    ]
  }).toArray();
  console.log(`\n[2] Dummy Company Users to Delete (${dummyUsers.length}):`);
  dummyUsers.forEach(u => console.log(`    - ID: ${u._id} | Email: ${u.email} | Company: ${u.company}`));

  // 3. Branches & Warehouses of Dummy Companies
  const dummyBranchesCount = await db.collection('branches').countDocuments({ company: { $in: dummyCompanyIds } });
  const dummyWarehousesCount = await db.collection('warehouses').countDocuments({ company: { $in: dummyCompanyIds } });
  console.log(`\n[3] Dummy Branches: ${dummyBranchesCount}, Dummy Warehouses: ${dummyWarehousesCount}`);

  // 4. Supplier Related Collections
  const supplierCount = await db.collection('suppliers').countDocuments({});
  const purchaseCount = await db.collection('purchases').countDocuments({});
  const purchaseReturnCount = await db.collection('purchasereturns').countDocuments({});
  const debitNoteCount = await db.collection('debitnotes').countDocuments({});
  const paymentCount = await db.collection('payments').countDocuments({});
  const bankPaymentCount = await db.collection('bankpayments').countDocuments({});

  console.log(`\n[4] Supplier-Related Records to Delete:`);
  console.log(`    - Suppliers: ${supplierCount}`);
  console.log(`    - Purchases (Invoices): ${purchaseCount}`);
  console.log(`    - Purchase Returns: ${purchaseReturnCount}`);
  console.log(`    - Debit Notes: ${debitNoteCount}`);
  console.log(`    - Payments: ${paymentCount}`);
  console.log(`    - Bank Payments: ${bankPaymentCount}`);

  // 5. Customer Related Collections
  const customerCount = await db.collection('customers').countDocuments({});
  const saleCount = await db.collection('sales').countDocuments({});
  const saleReturnCount = await db.collection('salereturns').countDocuments({});
  const saleExchangeCount = await db.collection('saleexchanges').countDocuments({});
  const creditNoteCount = await db.collection('creditnotes').countDocuments({});
  const receiptCount = await db.collection('receipts').countDocuments({});
  const bankReceiptCount = await db.collection('bankreceipts').countDocuments({});
  const packingSlipCount = await db.collection('packingslips').countDocuments({});
  const challanCount = await db.collection('challans').countDocuments({});

  console.log(`\n[5] Customer-Related Records to Delete:`);
  console.log(`    - Customers: ${customerCount}`);
  console.log(`    - Sales (Invoices/POS): ${saleCount}`);
  console.log(`    - Sale Returns: ${saleReturnCount}`);
  console.log(`    - Sale Exchanges: ${saleExchangeCount}`);
  console.log(`    - Credit Notes: ${creditNoteCount}`);
  console.log(`    - Receipts: ${receiptCount}`);
  console.log(`    - Bank Receipts: ${bankReceiptCount}`);
  console.log(`    - Packing Slips: ${packingSlipCount}`);
  console.log(`    - Challans: ${challanCount}`);

  // 6. Vouchers & Journals
  const voucherCount = await db.collection('vouchers').countDocuments({});
  const journalVoucherCount = await db.collection('journalvouchers').countDocuments({});
  console.log(`\n[6] Transaction Vouchers to Delete:`);
  console.log(`    - Vouchers: ${voucherCount}`);
  console.log(`    - Journal Vouchers: ${journalVoucherCount}`);

  if (isDryRun) {
    console.log(`\n=================================================`);
    console.log(`DRY RUN COMPLETED. No changes made.`);
    console.log(`Run with --execute to perform actual deletion.`);
    console.log(`=================================================\n`);
    process.exit(0);
  }

  // EXECUTE DELETIONS
  console.log(`\nExecuting deletions now...`);

  // 1. Delete Dummy Companies
  if (dummyCompanyIds.length > 0) {
    const resComp = await db.collection('companies').deleteMany({ _id: { $in: dummyCompanyIds } });
    console.log(`✓ Deleted ${resComp.deletedCount} dummy companies.`);
  }

  // 2. Delete Dummy Users
  const resUsers = await db.collection('users').deleteMany({
    $or: [
      { company: { $in: dummyCompanyIds } },
      { email: { $in: ['apexpharma@gmail.com', 'apexoffice@gmail.com'] } }
    ]
  });
  console.log(`✓ Deleted ${resUsers.deletedCount} dummy users.`);

  // 3. Delete Dummy Branches & Warehouses
  if (dummyCompanyIds.length > 0) {
    const resBranches = await db.collection('branches').deleteMany({ company: { $in: dummyCompanyIds } });
    const resWh = await db.collection('warehouses').deleteMany({ company: { $in: dummyCompanyIds } });
    console.log(`✓ Deleted ${resBranches.deletedCount} dummy branches and ${resWh.deletedCount} dummy warehouses.`);
  }

  // 4. Delete Suppliers & Purchases
  const resSupp = await db.collection('suppliers').deleteMany({});
  const resPurch = await db.collection('purchases').deleteMany({});
  const resPurchRet = await db.collection('purchasereturns').deleteMany({});
  const resDebit = await db.collection('debitnotes').deleteMany({});
  const resPay = await db.collection('payments').deleteMany({});
  const resBankPay = await db.collection('bankpayments').deleteMany({});

  console.log(`✓ Deleted ${resSupp.deletedCount} suppliers.`);
  console.log(`✓ Deleted ${resPurch.deletedCount} purchases.`);
  console.log(`✓ Deleted ${resPurchRet.deletedCount} purchase returns.`);
  console.log(`✓ Deleted ${resDebit.deletedCount} debit notes.`);
  console.log(`✓ Deleted ${resPay.deletedCount} payments.`);
  console.log(`✓ Deleted ${resBankPay.deletedCount} bank payments.`);

  // 5. Delete Customers & Sales
  const resCust = await db.collection('customers').deleteMany({});
  const resSale = await db.collection('sales').deleteMany({});
  const resSaleRet = await db.collection('salereturns').deleteMany({});
  const resSaleEx = await db.collection('saleexchanges').deleteMany({});
  const resCredit = await db.collection('creditnotes').deleteMany({});
  const resRec = await db.collection('receipts').deleteMany({});
  const resBankRec = await db.collection('bankreceipts').deleteMany({});
  const resPacking = await db.collection('packingslips').deleteMany({});
  const resChallan = await db.collection('challans').deleteMany({});

  console.log(`✓ Deleted ${resCust.deletedCount} customers.`);
  console.log(`✓ Deleted ${resSale.deletedCount} sales.`);
  console.log(`✓ Deleted ${resSaleRet.deletedCount} sale returns.`);
  console.log(`✓ Deleted ${resSaleEx.deletedCount} sale exchanges.`);
  console.log(`✓ Deleted ${resCredit.deletedCount} credit notes.`);
  console.log(`✓ Deleted ${resRec.deletedCount} receipts.`);
  console.log(`✓ Deleted ${resBankRec.deletedCount} bank receipts.`);
  console.log(`✓ Deleted ${resPacking.deletedCount} packing slips.`);
  console.log(`✓ Deleted ${resChallan.deletedCount} challans.`);

  // 6. Delete Vouchers
  const resVouch = await db.collection('vouchers').deleteMany({});
  const resJv = await db.collection('journalvouchers').deleteMany({});
  console.log(`✓ Deleted ${resVouch.deletedCount} vouchers.`);
  console.log(`✓ Deleted ${resJv.deletedCount} journal vouchers.`);

  console.log(`\n=================================================`);
  console.log(`🎉 ALL SPECIFIED DATA HAS BEEN SUCCESSFULLY DELETED!`);
  console.log(`=================================================\n`);
  process.exit(0);
}

const isExecute = process.argv.includes('--execute');
runCleanup(!isExecute).catch(err => {
  console.error('Error during cleanup:', err);
  process.exit(1);
});
