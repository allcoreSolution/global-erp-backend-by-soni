const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/Globle_erp')
  .then(async () => {
    const emps = await mongoose.connection.db.collection('employees').find().toArray();
    console.log(JSON.stringify(emps, null, 2));
    process.exit(0);
  })
