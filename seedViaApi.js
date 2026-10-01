const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api';

async function seedData() {
  console.log('--- Starting API Seeding Process ---');
  let token = '';
  let adminUserId = '';

  // Helper for requests
  const apiCall = async (method, endpoint, payload = null) => {
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        }
      };
      if (payload) options.body = JSON.stringify(payload);
      
      const response = await fetch(`${BASE_URL}${endpoint}`, options);
      const data = await response.json();
      if (!response.ok) {
        console.error(`[ERROR] Failed to ${method} ${endpoint}:`, data.message || data.error);
        return null;
      }
      return data.data !== undefined ? data.data : data;
    } catch (err) {
      console.error(`[ERROR] Exception on ${method} ${endpoint}:`, err.message);
      return null;
    }
  };

  // 1. Authenticate
  console.log('\\n[1] Authenticating...');
  const loginRes = await apiCall('POST', '/auth/login', {
    email: 'admin@example.com',
    password: 'password123'
  });

  if (!loginRes || !loginRes.token) {
    console.error('Authentication failed. Make sure server is running and admin user exists (run node seedAdmin.js first).');
    process.exit(1);
  }
  
  token = loginRes.token;
  adminUserId = loginRes._id;
  console.log('Authentication successful. Token received.');

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  let departmentIds = [];
  let designationIds = [];
  let categoryIds = [];
  let brandIds = [];
  let productIds = [];
  let customerIds = [];
  let supplierIds = [];

  // --- GET EXISTING OR CREATE ---
  // We use existing ones if creation fails due to duplicate

  // 2. Add Departments
  console.log('\\n[2] Seeding Departments...');
  const departments = [
    { departmentName: 'Sales & Marketing', deptCode: 'SM01', deptHead: adminUserId },
    { departmentName: 'IT Department', deptCode: 'IT01', deptHead: adminUserId }
  ];
  for (const dept of departments) {
    let res = await apiCall('POST', '/departments', dept);
    if (!res) {
       // try fetching
       const all = await apiCall('GET', '/departments');
       if(all && all.length) res = all.find(d => d.deptCode === dept.deptCode);
    }
    if (res && res._id) departmentIds.push(res._id);
  }
  
  // 3. Add Designations
  console.log('\\n[3] Seeding Designations...');
  const designations = [
    { designationName: 'Sales Executive', roleCode: 'SE01', reportingManager: adminUserId },
    { designationName: 'Software Engineer', roleCode: 'SE02', reportingManager: adminUserId }
  ];
  for (const des of designations) {
    let res = await apiCall('POST', '/designations', des);
    if (!res) {
       const all = await apiCall('GET', '/designations');
       if(all && all.length) res = all.find(d => d.roleCode === des.roleCode);
    }
    if (res && res._id) designationIds.push(res._id);
  }

  // 4. Add Employees
  console.log('\\n[4] Seeding Employees...');
  if (departmentIds.length > 0 && designationIds.length > 0) {
    const employees = [
      {
        fullName: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
        email: `john.doe.${Date.now()}@example.com`,
        phone: '1234567890',
        emergencyPhone: '0987654321',
        emergencyRelation: 'Brother',
        employeeId: 'EMP' + Date.now().toString().slice(-4),
        department: departmentIds[0],
        designation: designationIds[0],
        joiningDate: '2023-01-01',
        basicSalary: 30000
      },
      {
        fullName: 'Jane Smith',
        firstName: 'Jane',
        lastName: 'Smith',
        email: `jane.smith.${Date.now()}@example.com`,
        phone: '0987654321',
        emergencyPhone: '1234567890',
        emergencyRelation: 'Sister',
        employeeId: 'EMP' + (Date.now() + 1).toString().slice(-4),
        department: departmentIds[1],
        designation: designationIds[1],
        joiningDate: '2023-02-01',
        basicSalary: 50000
      }
    ];
    for (const emp of employees) {
      await apiCall('POST', '/employees', emp);
    }
  }

  // 5. Add Product Categories
  console.log('\\n[5] Seeding Product Categories...');
  const categories = [
    { name: 'Electronics', description: 'Gadgets and devices' },
    { name: 'Furniture', description: 'Office furniture' }
  ];
  for (const cat of categories) {
    let res = await apiCall('POST', '/products/categories', cat);
    if(!res) {
      const all = await apiCall('GET', '/products/categories');
      if(all && all.length) res = all.find(c => c.name === cat.name);
    }
    if (res && res._id) categoryIds.push(res._id);
  }

  // 6. Add Brands
  console.log('\\n[6] Seeding Brands...');
  const brands = [
    { name: 'TechBrand', description: 'High quality electronics' },
    { name: 'WoodFurn', description: 'Premium furniture' }
  ];
  for (const b of brands) {
    let res = await apiCall('POST', '/products/brands', b);
    if(!res) {
      const all = await apiCall('GET', '/products/brands');
      if(all && all.length) res = all.find(br => br.name === b.name);
    }
    if (res && res._id) brandIds.push(res._id);
  }

  // 7. Add Products
  console.log('\\n[7] Seeding Products...');
  if (categoryIds.length > 0 && brandIds.length > 0) {
    const products = [
      {
        name: 'Smartphone X',
        sku: 'SKU-PH-' + Date.now(),
        barcode: '123' + Date.now(),
        category: categoryIds[0],
        brand: brandIds[0],
        purchasePrice: 20000,
        salePrice: 25000,
        minStockLevel: 5,
        taxRate: 18,
        currentStock: 0
      },
      {
        name: 'Ergonomic Chair',
        sku: 'SKU-CH-' + Date.now(),
        barcode: '987' + Date.now(),
        category: categoryIds[1],
        brand: brandIds[1],
        purchasePrice: 3000,
        salePrice: 4500,
        minStockLevel: 10,
        taxRate: 12,
        currentStock: 0
      }
    ];
    for (const prod of products) {
      let res = await apiCall('POST', '/products', prod);
      if(!res) {
        const all = await apiCall('GET', '/products');
        if(all && all.length) res = all.find(p => p.sku === prod.sku);
      }
      if (res && res._id) productIds.push(res._id);
    }
  }

  // 8. Add Customers
  console.log('\\n[8] Seeding Customers...');
  const customers = [
    {
      customerName: 'Ramesh Patel',
      mobile: '9876543210',
      email: `ramesh.${Date.now()}@test.com`,
      address: 'Ahmedabad'
    },
    {
      customerName: 'Suresh Kumar',
      mobile: '9988776655',
      email: `suresh.${Date.now()}@test.com`,
      address: 'Mumbai'
    }
  ];
  for (const cus of customers) {
    let res = await apiCall('POST', '/customers', cus);
    if(!res) {
      const all = await apiCall('GET', '/customers');
      if(all && all.length) res = all[0];
    }
    if (res && res._id) customerIds.push(res._id);
  }

  // 9. Add Suppliers
  console.log('\\n[9] Seeding Suppliers...');
  const suppliers = [
    {
      name: 'Global Electronics Ltd',
      contactPerson: 'Mr. Sharma',
      mobile: '8877665544',
      email: `global.${Date.now()}@test.com`,
      address: 'Delhi'
    },
    {
      name: 'Premium Woodworks',
      contactPerson: 'Mr. Verma',
      mobile: '7766554433',
      email: `premium.${Date.now()}@test.com`,
      address: 'Pune'
    }
  ];
  for (const sup of suppliers) {
    let res = await apiCall('POST', '/suppliers', sup);
    if(!res) {
      const all = await apiCall('GET', '/suppliers');
      if(all && all.length) res = all[0];
    }
    if (res && res._id) supplierIds.push(res._id);
  }

  // 10. Add Purchases (To increase stock)
  console.log('\\n[10] Seeding Purchases (Stock In)...');
  if (supplierIds.length > 0 && productIds.length > 0) {
    const purchases = [
      {
        supplierId: supplierIds[0],
        paymentMode: 'Bank Transfer',
        referenceNo: 'INV-SUP-' + Date.now(),
        items: [
          { productId: productIds[0], quantity: 50, price: 20000 }
        ]
      },
      {
        supplierId: supplierIds[1],
        paymentMode: 'UPI',
        referenceNo: 'INV-SUP-' + (Date.now()+1),
        items: [
          { productId: productIds[1], quantity: 100, price: 3000 }
        ]
      }
    ];
    for (const pur of purchases) {
      await apiCall('POST', '/purchases', pur);
    }
  }

  await sleep(1000);

  // 11. Add Sales (To decrease stock)
  console.log('\\n[11] Seeding Sales (Stock Out)...');
  if (productIds.length > 0) {
    const sales = [
      {
        customerName: 'Ramesh Patel',
        customerMobile: '9876543210',
        paymentMode: 'UPI',
        items: [
          { productId: productIds[0], quantity: 2 }
        ]
      },
      {
        customerName: 'Walk-in Customer',
        customerMobile: '',
        paymentMode: 'Cash',
        items: [
          { productId: productIds[1], quantity: 5 }
        ]
      }
    ];
    for (const sale of sales) {
      await apiCall('POST', '/sales', sale);
    }
  }

  // 12. Add Shift Timings
  console.log('\\n[12] Seeding Shift Timings...');
  const shiftTimings = [
    { shiftName: 'Morning Shift', clockInTime: '09:00', clockOutTime: '18:00', gracePeriodMins: 15, weeklyOffDay: 'Sunday' },
    { shiftName: 'Night Shift', clockInTime: '21:00', clockOutTime: '06:00', gracePeriodMins: 15, weeklyOffDay: 'Saturday' }
  ];
  for (const shift of shiftTimings) {
    await apiCall('POST', '/shift-timings', shift);
  }

  // 13. Add Holidays
  console.log('\\n[13] Seeding Holidays...');
  const holidays = [
    { eventName: 'New Year', holidayDate: '01-01-2027', classificationType: 'National Holiday', description: 'New Year Celebration' },
    { eventName: 'Diwali', holidayDate: '01-11-2026', classificationType: 'Festival', description: 'Diwali Festival' }
  ];
  for (const holiday of holidays) {
    await apiCall('POST', '/holidays', holiday);
  }

  // 14. Add Expense Claims (Uses adminUserId since it refs 'User')
  console.log('\\n[14] Seeding Expense Claims...');
  const expenses = [
    { employee: adminUserId, claimDate: new Date(), category: 'Travel', amount: 1500, description: 'Client meeting cab fare' },
    { employee: adminUserId, claimDate: new Date(), category: 'Food', amount: 500, description: 'Team lunch' }
  ];
  for (const exp of expenses) {
    await apiCall('POST', '/expenses', exp);
  }

  // To seed PerformanceRating and EmployeeTargets, we need actual Employee ObjectIDs.
  // We'll fetch existing employees first to be safe.
  const allEmployees = await apiCall('GET', '/employees');
  const empIds = (allEmployees && allEmployees.length > 0) ? allEmployees.map(e => e._id) : [];

  // 15. Add Employee Targets
  console.log('\\n[15] Seeding Employee Targets...');
  if (empIds.length > 0) {
    const targets = [
      { employee: empIds[0], kpiGoalTitle: 'Achieve 100 Sales', targetMetricDescription: 'Sell 100 units of Product A', targetDeadline: new Date(Date.now() + 86400000 * 30), priorityScale: 'High' }
    ];
    for (const target of targets) {
      await apiCall('POST', '/targets', target);
    }
  }

  // 16. Add Performance Ratings
  console.log('\\n[16] Seeding Performance Ratings...');
  if (empIds.length > 0) {
    const ratings = [
      { employee: empIds[0], jobRole: 'Sales Executive', ratingScore: 4, evaluationCycle: 'Q3-2026', remarks: 'Good progress' }
    ];
    for (const rating of ratings) {
      await apiCall('POST', '/performance', rating);
    }
  }

  // 17. Add Coupons
  console.log('\\n[17] Seeding Coupons...');
  const coupons = [
    { code: 'DISCOUNT10', discountType: 'Percentage', discountValue: 10, expiryDate: new Date(Date.now() + 86400000 * 30), isActive: true, usageLimit: 100 },
    { code: 'FLAT50', discountType: 'FixedAmount', discountValue: 50, expiryDate: new Date(Date.now() + 86400000 * 15), isActive: true, usageLimit: 50 }
  ];
  for (const coupon of coupons) {
    await apiCall('POST', '/sales/coupon', coupon);
  }

  // 18. Add Attendances
  console.log('\\n[18] Seeding Attendances...');
  if (empIds.length > 0) {
    const attendances = [
      { employeeId: empIds[0], date: '2026-09-04', checkIn: '09:05 AM', checkOut: '06:00 PM', status: 'Present' },
      { employeeId: empIds[0], date: '2026-09-05', checkIn: '-', checkOut: '-', status: 'Absent' },
      { employeeId: empIds[0], date: '2026-09-06', checkIn: '09:30 AM', checkOut: '06:15 PM', status: 'Late' }
    ];
    for (const att of attendances) {
      await apiCall('POST', '/attendances', att);
    }
  }

  console.log('\\n--- API Seeding Process Completed ---');
}

seedData();
