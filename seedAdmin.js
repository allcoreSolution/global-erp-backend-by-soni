const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env
dotenv.config();

// Models load karo
// Models load karo
const User = require('./src/models/User');
const Role = require('./src/models/Role');
const Company = require('./src/models/Company');

const seedAdmin = async () => {
  try {
    // Connect to Database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Database Connected Successfully!');

    // 1. Create SuperAdmin Role
    let superAdminRole = await Role.findOne({ name: 'SuperAdmin' });
    if (!superAdminRole) {
      superAdminRole = await Role.create({
        name: 'SuperAdmin',
        description: 'Has all permissions',
        permissions: ['manage_users', 'manage_roles', 'manage_accounts', 'manage_sales', 'manage_products', 'manage_purchases']
      });
      console.log('SuperAdmin Role created!');
    } else {
      console.log('SuperAdmin Role already exists.');
    }

    // 2. Create Admin User
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    if (!adminExists) {
      const adminUser = await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: 'password123',
        role: superAdminRole._id
      });
      console.log('Admin User Created Successfully!');
      console.log('Email: admin@example.com | Password: password123');
    } else {
      console.log('Super Admin User already exists.');
    }

    // 3. Create Demo Company & Normal Admin User
    let demoCompany = await Company.findOne({ email: 'info@democompany.com' });
    if (!demoCompany) {
      demoCompany = await Company.create({
        name: 'Demo Company Pvt Ltd',
        email: 'info@democompany.com',
        phone: '9876543210'
      });
      console.log('Demo Company Created!');
    }

    let adminRole = await Role.findOne({ name: 'Admin' });
    if (!adminRole) {
      adminRole = await Role.create({
        name: 'Admin',
        description: 'Company Admin',
        permissions: ['manage_all_company_data']
      });
    }

    const normalAdminExists = await User.findOne({ email: 'client@example.com' });
    if (!normalAdminExists) {
      const normalAdminUser = await User.create({
        username: 'client_admin',
        email: 'client@example.com',
        password: 'password123',
        role: adminRole._id,
        company: demoCompany._id
      });
      console.log('Normal Admin User Created Successfully!');
      console.log('Email: client@example.com | Password: password123');
    } else {
      console.log('Normal Admin User already exists.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
