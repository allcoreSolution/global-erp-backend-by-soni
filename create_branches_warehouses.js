const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/erp_global').then(async () => {
  const db = mongoose.connection.db;

  // Get the Demo Company
  const demoCompany = await db.collection('companies').findOne({ email: 'info@democompany.com' });
  const companyId = demoCompany ? demoCompany._id : null;

  const branches = [
    {
      id: 'BR-001',
      code: 'DEL-HQ',
      name: 'Delhi Headquarters',
      manager: 'Ravi Kumar',
      status: 'Active',
      city: 'New Delhi',
      state: 'Delhi',
      company: companyId,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'BR-002',
      code: 'MUM-BO',
      name: 'Mumbai Branch Office',
      manager: 'Sunita Sharma',
      status: 'Active',
      city: 'Mumbai',
      state: 'Maharashtra',
      company: companyId,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  await db.collection('branches').insertMany(branches);
  console.log('Successfully created 2 branches!');

  // Fetch branches to link them to warehouses
  const createdBranches = await db.collection('branches').find({ company: companyId }).toArray();
  const branch1Id = createdBranches.find(b => b.code === 'DEL-HQ')._id;
  const branch2Id = createdBranches.find(b => b.code === 'MUM-BO')._id;

  const warehouses = [
    {
      name: 'Delhi Main Warehouse',
      code: 'WH-DEL-01',
      location: 'Okhla Industrial Area',
      status: true,
      branch: branch1Id,
      company: companyId,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Mumbai Storage Hub',
      code: 'WH-MUM-01',
      location: 'Andheri East',
      status: true,
      branch: branch2Id,
      company: companyId,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  await db.collection('warehouses').insertMany(warehouses);
  console.log('Successfully created 2 warehouses linked to the branches!');

  process.exit(0);
});
