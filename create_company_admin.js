const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://127.0.0.1:27017/erp_global').then(async () => {
  const db = mongoose.connection.db;
  
  // Find Admin Role
  const adminRole = await db.collection('roles').findOne({ name: 'Admin' });
  
  // Find Demo Company
  const demoCompany = await db.collection('companies').findOne({ email: 'info@democompany.com' });
  
  if (adminRole && demoCompany) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('Admin123', salt);
    
    await db.collection('users').updateOne(
      { email: 'admin@gmail.com' },
      { 
        $set: { 
          username: 'admin', 
          password: hash, 
          role: adminRole._id, 
          company: demoCompany._id,
          isActive: true
        } 
      },
      { upsert: true }
    );
    console.log('Company Admin created successfully!');
  } else {
    console.log('Admin Role or Demo Company not found.');
  }
  
  process.exit(0);
});
