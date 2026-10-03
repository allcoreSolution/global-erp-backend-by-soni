const mongoose = require('mongoose');
const { PurchaseReturn } = require('./src/models/PurchaseReturn');

mongoose.connect('mongodb+srv://tiwarisoni671_db_user:HCBQL32nEKmtVe0V@cluster0.w5wpuw7.mongodb.net/?appName=Cluster0')
  .then(async () => {
    // Unset bad supplier/warehouse values
    await PurchaseReturn.updateMany(
      { supplier: '' },
      { $unset: { supplier: 1 } }
    );
    await PurchaseReturn.updateMany(
      { warehouse: { $in: ['', 'UP'] } },
      { $unset: { warehouse: 1 } }
    );
    console.log('Fixed bad references');
    process.exit(0);
  })
  .catch(console.error);
