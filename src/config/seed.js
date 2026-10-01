const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Role = require('../models/Role');
const User = require('../models/User');

dotenv.config();

const defaultRoles = [
  {
    name: 'SuperAdmin',
    description: 'Full system control and permission configuration',
    permissions: ['*'] // Bypass checking
  },
  {
    name: 'Admin',
    description: 'System Administration and management',
    permissions: [
      'manage_users', 'manage_roles', 'view_reports', 'create_sales',
      'create_purchases', 'manage_stock', 'manage_accounts', 'manage_hrms'
    ]
  },
  {
    name: 'Manager',
    description: 'Operational and report access with limited config control',
    permissions: [
      'view_reports', 'create_sales', 'create_purchases', 'manage_stock',
      'manage_accounts', 'manage_hrms'
    ]
  },
  {
    name: 'SalesStaff',
    description: 'POS invoicing and customer records',
    permissions: [
      'create_sales', 'view_sales_dashboard'
    ]
  },
  {
    name: 'HRStaff',
    description: 'Manage employee directories, salary structure and attendance logs',
    permissions: [
      'manage_hrms', 'view_reports'
    ]
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/erp_global');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing Roles
    await Role.deleteMany({});
    console.log('Cleared existing roles.');

    // Seed Roles
    const createdRoles = await Role.insertMany(defaultRoles);
    console.log('Seeded default roles successfully!');

    // Check if SuperAdmin user exists
    const superAdminRole = createdRoles.find(r => r.name === 'SuperAdmin');
    const existingSuperAdmin = await User.findOne({ email: 'admin@erp.com' });

    if (!existingSuperAdmin) {
      await User.create({
        username: 'superadmin',
        email: 'admin@erp.com',
        password: 'adminpassword123', // Will be hashed by userSchema post hook
        role: superAdminRole._id
      });
      console.log('Created default SuperAdmin user: admin@erp.com / adminpassword123');
    } else {
      // Re-assign role if needed
      existingSuperAdmin.role = superAdminRole._id;
      await existingSuperAdmin.save();
      console.log('Updated existing SuperAdmin user role linkage');
    }

    console.log('Database Seeding Completed!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
