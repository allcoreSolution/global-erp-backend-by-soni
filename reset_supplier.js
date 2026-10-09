const mongoose = require('mongoose');

async function resetSupplier() {
  await mongoose.connect('mongodb://127.0.0.1:27017/Globle_erp');
  
  let Supplier = require('./src/models/Supplier');
  if (Supplier.Supplier) Supplier = Supplier.Supplier;

  const result = await Supplier.updateOne(
    { companyName: /TechWorld/i },
    { $set: { balance: 0 } }
  );
  
  console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
  if (result.modifiedCount > 0) {
    console.log("Successfully reset balance to 0 for TechWorld Supplies.");
  }
  
  process.exit();
}

resetSupplier().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
