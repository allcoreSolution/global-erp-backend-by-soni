const mongoose = require('mongoose');
const { Employee } = require('./src/models/Employee');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to DB');
    const emps = [
      { employeeId: 'EMP001', employeeName: 'Ramesh Kumar', department: 'Warehouse', designation: 'Packer' },
      { employeeId: 'EMP002', employeeName: 'Suresh Singh', department: 'Warehouse', designation: 'Supervisor' },
      { employeeId: 'EMP003', employeeName: 'Anil Sharma', department: 'Logistics', designation: 'Driver' }
    ];
    for (let emp of emps) {
      await Employee.create(emp).catch(e => console.log('Error creating', emp.employeeId, e.message));
    }
    console.log('Employees created!');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
