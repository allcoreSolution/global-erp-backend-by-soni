const mongoose = require('mongoose');
const { PurchaseReturn } = require('./src/models/PurchaseReturn');

mongoose.connect('mongodb+srv://tiwarisoni671_db_user:HCBQL32nEKmtVe0V@cluster0.w5wpuw7.mongodb.net/?appName=Cluster0')
  .then(async () => {
    // Find empty company strings and update them
    await PurchaseReturn.updateMany(
      { $or: [{ company: '' }, { company: { $exists: false } }] },
      { $set: { company: 'GLOBAL ERP SERVICES LTD.' } }
    );
    console.log('Fixed companies');
    process.exit(0);
  })
  .catch(console.error);
