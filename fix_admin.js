const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://127.0.0.1:27017/erp_global').then(async () => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('Super123', salt);
  
  await mongoose.connection.db.collection('users').updateOne(
    { username: 'superadmin' }, 
    { $set: { email: 'superadmin@gmail.com', password: hash } }
  );
  
  console.log('Fixed superadmin!');
  process.exit(0);
});
