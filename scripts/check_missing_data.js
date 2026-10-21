const mongoose = require('mongoose');

async function checkEmployees() {
  await mongoose.connect('mongodb://127.0.0.1:27017/erp_global');
  const db = mongoose.connection.db;
  const company = await db.collection('companies').findOne({ code: 'APD' });
  const companyId = company._id;

  const emps = await db.collection('employees').find({
    $or: [{ company: companyId.toString() }, { company: companyId }]
  }).toArray();
  console.log(`Employees for APD: ${emps.length}`);
  emps.forEach(e => console.log(`- ${e.employeeId}: ${e.employeeName} (${e.role || e.designation}), Net: ${e.netSalary}`));

  const depts = await db.collection('departments').find({
    $or: [{ company: companyId.toString() }, { company: companyId }]
  }).toArray();
  console.log(`Departments for APD: ${depts.length}`);

  const desigs = await db.collection('designations').find({
    $or: [{ company: companyId.toString() }, { company: companyId }]
  }).toArray();
  console.log(`Designations for APD: ${desigs.length}`);

  const payslips = await db.collection('payslips').find({
    $or: [{ company: companyId.toString() }, { company: companyId }]
  }).toArray();
  console.log(`Payslips for APD: ${payslips.length}`);

  const units = await db.collection('units').find({
    $or: [{ company: companyId.toString() }, { company: companyId }]
  }).toArray();
  console.log(`Units for APD: ${units.length}`);

  const brands = await db.collection('brands').find({
    $or: [{ company: companyId.toString() }, { company: companyId }]
  }).toArray();
  console.log(`Brands for APD: ${brands.length}`);

  const categories = await db.collection('categories').find({
    $or: [{ company: companyId.toString() }, { company: companyId }]
  }).toArray();
  console.log(`Categories for APD: ${categories.length}`);

  const taxslabs = await db.collection('taxslabs').find({
    $or: [{ company: companyId.toString() }, { company: companyId }]
  }).toArray();
  console.log(`TaxSlabs for APD: ${taxslabs.length}`);

  process.exit(0);
}
checkEmployees();
