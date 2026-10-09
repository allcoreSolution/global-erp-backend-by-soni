const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/erp_global').then(async () => {
  const db = mongoose.connection.db;

  const demoCompany = await db.collection('companies').findOne({ email: 'info@democompany.com' });
  const companyId = demoCompany ? demoCompany._id : null;

  const suppliers = [
    {
      supplierCode: 'SUP-001',
      type: 'Manufacturer',
      companyName: 'ABC Manufacturing Ltd',
      contactPerson: 'Amit Kumar',
      phone: '9876543211',
      email: 'amit@abcmfg.com',
      category: 'Raw Materials',
      status: true,
      creditLimit: 100000,
      paymentTerms: 'Net 30',
      company: companyId,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      supplierCode: 'SUP-002',
      type: 'Wholesaler',
      companyName: 'XYZ Wholesale Hub',
      contactPerson: 'Suresh Patel',
      phone: '9988776654',
      email: 'sales@xyzwholesale.com',
      category: 'Packaging',
      status: true,
      creditLimit: 50000,
      paymentTerms: 'Net 15',
      company: companyId,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      supplierCode: 'SUP-003',
      type: 'Distributor',
      companyName: 'Global Tech Suppliers',
      contactPerson: 'Priya Singh',
      phone: '8877665544',
      email: 'priya@globaltech.com',
      category: 'Electronics',
      status: true,
      creditLimit: 200000,
      paymentTerms: 'Net 45',
      company: companyId,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  try {
    await db.collection('suppliers').insertMany(suppliers);
    console.log('Successfully created 3 suppliers!');
  } catch (err) {
    if (err.code === 11000) {
      console.log('Suppliers already exist or duplicate code error.');
    } else {
      console.error(err);
    }
  }

  process.exit(0);
});
