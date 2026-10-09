const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://127.0.0.1:27017/erp_global').then(async () => {
  const db = mongoose.connection.db;
  const adminRole = await db.collection('roles').findOne({ name: 'Admin' });
  const demoCompany = await db.collection('companies').findOne({ email: 'info@democompany.com' });
  
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('Admin123', salt);
  
  await db.collection('users').updateOne(
    { username: 'admin' },
    { $set: { 
        email: 'admin@gmail.com', 
        password: hash, 
        isActive: true,
        role: adminRole ? adminRole._id : null,
        company: demoCompany ? demoCompany._id : null
      } 
    }
  );
  console.log('Fixed admin user!');
  process.exit(0);
});
