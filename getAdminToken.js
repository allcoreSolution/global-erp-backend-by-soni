const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const jwt = require('jsonwebtoken');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    let user = await User.findOne({});
    if (!user) {
      console.log('No users found in database to impersonate.');
      process.exit(1);
    }
    const token = jwt.sign(
      { id: user._id, role: 'SuperAdmin', companyId: user.companyId || null },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '30d' }
    );
    console.log('\n\n--- YOUR SUPERADMIN TOKEN ---\n' + token + '\n-----------------------------\n');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
