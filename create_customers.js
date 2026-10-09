const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/erp_global').then(async () => {
  const db = mongoose.connection.db;

  // Get the Demo Company
  const demoCompany = await db.collection('companies').findOne({ email: 'info@democompany.com' });
  const companyId = demoCompany ? demoCompany._id : null;

  const customers = [
    {
      customerCode: 'CUST-001',
      name: 'Ramesh Traders',
      ownerName: 'Ramesh Singh',
      businessName: 'Ramesh Traders Pvt Ltd',
      type: 'Retailer',
      category: 'Regular',
      phone: '9876543210',
      email: 'ramesh@example.com',
      status: true,
      creditLimit: 50000,
      openingBalance: 1500,
      balanceType: 'Dr',
      company: companyId,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      customerCode: 'CUST-002',
      name: 'Sharma Distributors',
      ownerName: 'Rakesh Sharma',
      businessName: 'Sharma & Sons',
      type: 'Distributor',
      category: 'VIP',
      phone: '9988776655',
      email: 'sharma@example.com',
      status: true,
      creditLimit: 200000,
      openingBalance: 0,
      balanceType: 'Cr',
      company: companyId,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  await db.collection('customers').insertMany(customers);
  console.log('Successfully created 2 customers in the database!');
  process.exit(0);
});
