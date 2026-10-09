const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/erp_global').then(async () => {
  const users = await mongoose.connection.db.collection('users').find({ email: 'admin@gmail.com' }).toArray();
  const companies = await mongoose.connection.db.collection('companies').find({}).toArray();
  
  console.log('--- ADMIN USERS ---');
  console.log(users.map(u => ({ username: u.username, email: u.email })));
  
  console.log('--- COMPANIES ---');
  console.log(companies.map(c => ({ name: c.name, email: c.email })));

  process.exit(0);
});
