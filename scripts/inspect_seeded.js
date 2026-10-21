const mongoose = require('mongoose');

async function inspectSeeded() {
  await mongoose.connect('mongodb://127.0.0.1:27017/erp_global');
  const db = mongoose.connection.db;
  const company = await db.collection('companies').findOne({ code: 'APD' });
  const companyId = company._id;

  const payment = await db.collection('payments').findOne({});
  console.log('Sample payment:', payment);

  const receipt = await db.collection('receipts').findOne({});
  console.log('Sample receipt:', receipt);

  const employee = await db.collection('employees').findOne({ employeeName: /Rahul/i });
  console.log('Sample employee Rahul:', employee);

  const creditNote = await db.collection('creditnotes').findOne({});
  console.log('Sample credit note:', creditNote);

  process.exit(0);
}
inspectSeeded();
