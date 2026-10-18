const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/erp_global';

async function cleanup() {
  console.log('Connecting to MongoDB:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log('Connected!');

  const { Supplier } = require('./src/models/Supplier');
  const { Purchase } = require('./src/models/Purchase');
  const { Product } = require('./src/models/Product');
  const { Customer } = require('./src/models/Customer');
  const { Sale } = require('./src/models/Sale');
  const { Payment } = require('./src/models/Payment');
  const { PurchaseReturn } = require('./src/models/PurchaseReturn');

  // 1. Identify suppliers to KEEP
  const keepSuppliers = await Supplier.find({
    companyName: { $regex: /^(Prime Furniture Traders|Prime Pharma Laboratories)$/i }
  });

  const keepSupplierIds = keepSuppliers.map(s => s._id);
  console.log(`\nFound ${keepSuppliers.length} supplier records to KEEP:`);
  keepSuppliers.forEach(s => console.log(`  - [${s._id}] ${s.supplierCode}: ${s.companyName} (${s.phone})`));

  // 2. Delete all other suppliers
  const deleteSupplierRes = await Supplier.deleteMany({
    _id: { $nin: keepSupplierIds }
  });
  console.log(`\n✓ Deleted ${deleteSupplierRes.deletedCount} other suppliers (kept only Prime Furniture Traders & Prime Pharma Laboratories).`);

  // 3. Clean Purchases: Keep only purchases linked to the kept suppliers
  const deletePurchasesRes = await Purchase.deleteMany({
    supplier: { $nin: keepSupplierIds }
  });
  console.log(`✓ Deleted ${deletePurchasesRes.deletedCount} other purchase invoices.`);

  // 4. Clean Ghost / Dummy Products
  const deleteGhostProductsRes = await Product.deleteMany({
    $or: [
      { productName: { $in: [null, undefined, '', 'undefined'] } },
      { productName: { $regex: /^Demo Product/i } },
      { productCode: { $in: [null, undefined, '', 'undefined'] } }
    ]
  });
  console.log(`✓ Deleted ${deleteGhostProductsRes.deletedCount} ghost/dummy products.`);

  // 5. Clean Ghost Customers
  const deleteGhostCustomersRes = await Customer.deleteMany({
    $or: [
      { name: { $in: [null, undefined, '', 'undefined'] } },
      { ownerName: { $in: [null, undefined, '', 'undefined'] } },
      { customerCode: { $regex: /^CUST-\d{4}$/i } } // removes raw dummy CUST-xxxx
    ]
  });
  console.log(`✓ Deleted ${deleteGhostCustomersRes.deletedCount} ghost/dummy customers.`);

  // 6. Clean ghost payments or purchase returns not belonging to kept suppliers
  const deleteReturnsRes = await PurchaseReturn.deleteMany({
    supplier: { $nin: keepSupplierIds }
  });
  console.log(`✓ Deleted ${deleteReturnsRes.deletedCount} extra purchase returns.`);

  // 7. Verify final state
  const remainingSuppliers = await Supplier.find({});
  console.log(`\n=== FINAL SUPPLIERS IN DATABASE (${remainingSuppliers.length}) ===`);
  remainingSuppliers.forEach(s => console.log(`  ✓ ${s.supplierCode}: ${s.companyName} | Balance: ₹${s.balance || 0}`));

  const remainingPurchases = await Purchase.find({}).populate('supplier');
  console.log(`\n=== FINAL PURCHASES IN DATABASE (${remainingPurchases.length}) ===`);
  remainingPurchases.forEach(p => console.log(`  ✓ Invoice #${p.referenceNo || p.purchaseNo} | Supplier: ${p.supplier?.companyName} | Total: ₹${p.grandTotal}`));

  const remainingProducts = await Product.find({});
  console.log(`\n=== FINAL PRODUCTS IN DATABASE (${remainingProducts.length}) ===`);
  remainingProducts.forEach(p => console.log(`  ✓ Code: ${p.productCode} | Name: ${p.productName} | Stock: ${p.currentStock}`));

  console.log('\n✅ Cleanup completed successfully!');
  process.exit(0);
}

cleanup().catch(err => {
  console.error('Cleanup error:', err);
  process.exit(1);
});
