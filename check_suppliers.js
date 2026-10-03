const mongoose = require('mongoose');
const { Supplier } = require('./src/models/Supplier');

mongoose.connect('mongodb+srv://tiwarisoni671_db_user:HCBQL32nEKmtVe0V@cluster0.w5wpuw7.mongodb.net/?appName=Cluster0')
  .then(async () => {
    console.log('MongoDB Connected');
    const suppliers = await Supplier.find({});
    console.log('Total Suppliers found:', suppliers.length);
    if (suppliers.length > 0) {
      console.log('Suppliers:', suppliers.map(s => s.companyName || s.name));
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });
