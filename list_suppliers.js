const mongoose = require('mongoose');

async function listSuppliers() {
  await mongoose.connect('mongodb://127.0.0.1:27017/Globle_erp');
  
  let Supplier = require('./src/models/Supplier');
  if (Supplier.Supplier) Supplier = Supplier.Supplier;
  
  const suppliers = await Supplier.find({});
  suppliers.forEach(s => console.log(`Name: ${s.name}, Opening: ${s.openingBalance}`));
  process.exit();
}

listSuppliers();
