const mongoose = require('mongoose');

async function checkCollections() {
  await mongoose.connect('mongodb://127.0.0.1:27017/erp_global');
  const db = mongoose.connection.db;
  const cols = await db.listCollections().toArray();
  const company = await db.collection('companies').findOne({ code: 'APD' });
  const companyId = company._id;

  console.log('Company ID:', companyId);
  console.log('\n--- COLLECTION COUNTS FOR APEX PHARMA ---');
  for (const c of cols.sort((a,b) => a.name.localeCompare(b.name))) {
    const colName = c.name;
    const total = await db.collection(colName).countDocuments();
    const forCompany = await db.collection(colName).countDocuments({ 
      $or: [
        { company: companyId }, 
        { companyId: companyId },
        { company: companyId.toString() },
        { companyId: companyId.toString() }
      ] 
    });
    if (forCompany > 0 || total > 0) {
      console.log(`${colName.padEnd(28)}: Total = ${String(total).padStart(4)}, For APD = ${forCompany}`);
    }
  }
  process.exit(0);
}
checkCollections();
