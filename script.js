
const mongoose = require('mongoose');
const { Supplier } = require('./src/models/Supplier');
const { Branch } = require('./src/models/Branch');

mongoose.connect('mongodb+srv://tiwarisoni671_db_user:HCBQL32nEKmtVe0V@cluster0.w5wpuw7.mongodb.net/?appName=Cluster0')
  .then(async () => {
    try {
      const s = await Supplier.findOne();
      const b = await Branch.findOne();
      
      if (!s || !b) {
        console.log('Need at least one supplier and branch to create purchase.');
        process.exit(1);
      }
      
      const db = mongoose.connection.db;
      await db.collection('purchases').deleteMany({});
      
      await db.collection('purchases').insertOne({
        purchaseDate: '2023-10-01',
        purchaseNo: 'PUR-FIXED-1000',
        company: s.company || null,
        branch: b._id,
        supplier: s._id,
        grandTotal: 100,
        orderItems: [{
           name: 'Demo Product',
           code: 'DP-001',
           quantity: 1,
           netUnitCost: 100
        }],
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('Created valid purchase PUR-FIXED-1000 for Supplier: ' + s.companyName + ' and Branch: ' + b.name);
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });

