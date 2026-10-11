const mongoose = require('mongoose');

async function checkSupplier() {
  await mongoose.connect('mongodb://127.0.0.1:27017/Globle_erp');
  
  let Supplier = require('./src/models/Supplier');
  if (Supplier.Supplier) Supplier = Supplier.Supplier;
  
  let Purchase = require('./src/models/Purchase');
  if (Purchase.Purchase) Purchase = Purchase.Purchase;

  const supplier = await Supplier.findOne({ companyName: /TechWorld/i });
  if (!supplier) {
    console.log("Supplier 'TechWorld' not found in database.");
  } else {
    console.log(`Supplier Found: ${supplier.companyName}`);
    console.log(`Opening Balance (balance field): ${supplier.balance || 0}`);
    
    // Check pending purchases
    const purchases = await Purchase.find({ 
      supplier: supplier._id, 
      paymentStatus: { $ne: 'Paid' } 
    });
    
    let totalDue = 0;
    console.log(`\nPending Purchases for ${supplier.companyName}:`);
    if (purchases.length === 0) {
      console.log("No pending purchases found.");
    } else {
      purchases.forEach(p => {
        const due = (p.grandTotal || 0) - (p.amountPaid || 0);
        console.log(`Invoice: ${p.referenceNo || p.purchaseNo}, Grand Total: ${p.grandTotal}, Paid: ${p.amountPaid || 0}, Due: ${due}`);
        totalDue += due;
      });
    }
    
    console.log(`\nTotal Purchase Due: ${totalDue}`);
    console.log(`Total amount to give (Balance + Purchase Due): ${(supplier.balance || 0) + totalDue}`);
  }
  
  process.exit();
}

checkSupplier().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
