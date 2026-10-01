const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./src/models/User');
const Role = require('./src/models/Role'); // Added

const testLogin = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  const email = 'client@example.com';
  const password = 'password123';

  const user = await User.findOne({ email }).populate('role');
  console.log('User found:', user ? user.email : 'No');
  
  if (user) {
    console.log('Role populated:', user.role ? user.role.name : 'No');
    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch);
  }

  process.exit();
};

testLogin();
