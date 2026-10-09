require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const CompanyReq = require('./src/models/Company');
const BranchReq = require('./src/models/Branch');
const WarehouseReq = require('./src/models/Warehouse');
const SupplierReq = require('./src/models/Supplier');
const CustomerReq = require('./src/models/Customer'); 
const EmployeeReq = require('./src/models/Employee');
const BillerReq = require('./src/models/Biller');
const ProductReq = require('./src/models/Product');
const SaleReq = require('./src/models/Sale');

const Company = CompanyReq.Company || CompanyReq;
const Branch = BranchReq.Branch || BranchReq;
const Warehouse = WarehouseReq.Warehouse || WarehouseReq;
const Supplier = SupplierReq.Supplier || SupplierReq;
const Customer = CustomerReq.Customer || CustomerReq;
const Employee = EmployeeReq.Employee || EmployeeReq;
const Biller = BillerReq.Biller || BillerReq;
const Product = ProductReq.Product || ProductReq;
const Sale = SaleReq.Sale || SaleReq;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/erp_global');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();
    console.log('Clearing existing seed data...');
    await Company.deleteMany({});
    await Branch.deleteMany({});
    await Warehouse.deleteMany({});
    await Supplier.deleteMany({});
    await Customer.deleteMany({});
    await Employee.deleteMany({});
    if (Biller && typeof Biller.deleteMany === 'function') await Biller.deleteMany({});
    await Product.deleteMany({});
    await Sale.deleteMany({});

    // 1. Create Company
    const company = await Company.create({
      id: 'COMP-01',
      name: 'Global ERP Solutions',
      code: 'GES-01',
      email: 'admin@globalerp.com',
      phone: '9876543210',
      address: '123 Business Park, City Center',
    });
    console.log('Created Company:', company.name);

    // 2. Create Branch
    const branch = await Branch.create({
      id: 'BR-01',
      name: 'Mumbai HQ',
      code: 'B-HQ-01',
      company: company._id,
      email: 'mumbai@globalerp.com',
      phone: '1111111111',
      address: 'Floor 5, Building A',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India'
    });
    console.log('Created Branch:', branch.name);

    // 3. Create Warehouse
    const warehouse = await Warehouse.create({
      id: 'WH-01',
      name: 'Main Depot Mumbai',
      code: 'WH-01',
      branch: branch._id,
      company: company._id,
      phone: '2222222222',
      email: 'wh@globalerp.com',
      address: 'Industrial Area, Phase 1',
    });
    console.log('Created Warehouse:', warehouse.name);

    // 4. Create Supplier
    const supplier = await Supplier.create({
      id: 'SUP-01',
      supplierCode: 'SUP-001',
      companyName: 'Tech Suppliers Inc',
      name: 'Tech Suppliers Inc',
      company: company._id,
      email: 'sales@techsuppliers.com',
      phone: '9876500001',
      address: '45 Supplier Road',
    });
    console.log('Created Supplier:', supplier.name);

    // 5. Create Customer
    const customer = await Customer.create({
      id: 'CUST-01',
      customerCode: 'CUST-001',
      name: 'Ramesh Sharma',
      email: 'ramesh@example.com',
      phone: '9876500002',
      company: company._id,
      billingAddress: {
        street: '12 Customer St',
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        zipCode: '411001'
      }
    });
    console.log('Created Customer:', customer.name);

    // 6. Create Employee
    const employee = await Employee.create({
      id: 'EMP-01',
      employeeId: 'EMP-001',
      employeeCode: 'EMP-001',
      employeeName: 'Amit Kumar',
      name: 'Amit Kumar',
      email: 'amit@globalerp.com',
      phone: '9876500003',
      branch: branch._id,
      company: company._id,
      designation: 'Sales Executive'
    });
    console.log('Created Employee:', employee.name);

    let biller = null;
    try {
      if (Biller && typeof Biller.create === 'function') {
        biller = await Biller.create({
          id: 'BIL-01',
          name: 'Amit Kumar (Biller)',
          email: 'amit@globalerp.com',
          phone: '9876500003',
          branch: branch._id,
          company: company._id
        });
        console.log('Created Biller:', biller.name);
      }
    } catch (e) {
      console.log('Biller creation skipped', e.message);
    }

    // 7. Create Product
    const product = await Product.create({
      id: 'PROD-01',
      productName: 'Wireless Mouse',
      productCode: 'PROD-001',
      name: 'Wireless Mouse',
      code: 'PROD-001',
      type: 'Standard',
      barcodeSymbology: 'CODE128',
      brand: null,
      category: null,
      unit: null,
      cost: 250,
      price: 500,
      alertQuantity: 10,
      taxMethod: 'Exclusive',
      company: company._id,
      productDetails: 'High quality wireless mouse',
      isAvailable: true,
      warehouseStocks: [{
         warehouse: warehouse._id,
         stock: 100
      }]
    });
    console.log('Created Product:', product.name);

    // 8. Create Sale (Invoice)
    const sale = await Sale.create({
      id: 'INV-01',
      invoiceNo: 'INV-' + Math.floor(1000 + Math.random() * 9000),
      date: new Date(),
      referenceNo: 'INV-' + Math.floor(1000 + Math.random() * 9000),
      customer: customer._id,
      biller: biller ? biller._id : employee._id, // fallback to employee
      warehouse: warehouse._id,
      branch: branch._id,
      company: company._id,
      orderItems: [{
        product: product._id,
        name: product.name,
        code: product.code,
        quantity: 5,
        netUnitPrice: 500,
        unitPrice: 500,
        taxRate: 0,
        taxAmount: 0,
        discount: 0,
        subtotal: 2500
      }],
      totalItems: 5,
      totalQuantity: 5,
      totalAmount: 2500,
      orderDiscount: 0,
      orderDiscountType: 'Flat',
      shippingCost: 0,
      grandTotal: 2500,
      saleStatus: 'Completed',
      paymentStatus: 'Pending',
      currency: 'INR'
    });
    console.log('Created Sale (Invoice):', sale.referenceNo);

    console.log('\n--- SUCCESS ---');
    console.log('All dummy data created successfully! You can now use these in the software.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
