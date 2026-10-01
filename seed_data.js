const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const ProductFile = require('./src/models/Product');
const Product = ProductFile.Product || ProductFile;
const Category = ProductFile.Category || ProductFile; // Assuming Category is in same file or another

const CustomerFile = require('./src/models/Customer');
const Customer = CustomerFile.Customer || CustomerFile;

const SupplierFile = require('./src/models/Supplier');
const Supplier = SupplierFile.Supplier || SupplierFile;

const SaleFile = require('./src/models/Sale');
const Sale = SaleFile.Sale || SaleFile;

const PurchaseFile = require('./src/models/Purchase');
const Purchase = PurchaseFile.Purchase || PurchaseFile;

const ExpenseCategoryFile = require('./src/models/ExpenseCategory');
const ExpenseCategory = ExpenseCategoryFile.ExpenseCategory || ExpenseCategoryFile;

const ExpenseClaimFile = require('./src/models/ExpenseClaim');
const ExpenseClaim = ExpenseClaimFile.ExpenseClaim || ExpenseClaimFile;

const CompanyFile = require('./src/models/Company');
const Company = CompanyFile.Company || CompanyFile;

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB!");

        let company = await Company.findOne({});
        if (!company) {
            company = await Company.create({ name: 'Default Seed Company', address: 'Seed City', phone: '1111111111', email: 'seed@seed.com' });
        }
        const compId = company._id;

        const cust = await Customer.create({ name: 'John Doe', phone: '1234567890', customerCode: 'CUST-002', company: compId }).catch(e => { console.log('Customer skip:', e.message); return Customer.findOne(); });
        
        const sup = await Supplier.create({ name: 'Acme Corp', companyName: 'Acme Corp', phone: '0987654321', supplierCode: 'SUP-002', company: compId }).catch(e => { console.log('Supplier skip:', e.message); return Supplier.findOne(); });

        let cat = await mongoose.model('Category').findOne({});
        if (!cat) {
            cat = await mongoose.model('Category').create({ name: 'Electronics', company: compId }).catch(() => null);
        }

        const prod = await Product.create({ 
            productName: 'Laptop Pro X', 
            name: 'Laptop Pro X',
            productCode: 'PROD-001',
            sku: 'LT-PRO-X',
            category: cat ? cat._id : null,
            costPrice: 50000,
            salePrice: 75000,
            currentStock: 10,
            company: compId 
        }).catch(e => { console.log('Product skip:', e.message); return Product.findOne(); });

        let prodId = prod ? prod._id : null;

        if (cust && prodId) {
            await Sale.create({
                customer: cust._id,
                invoiceNo: 'INV-' + Date.now(),
                totalAmount: 75000,
                paidAmount: 75000,
                paymentStatus: 'Paid',
                status: 'Completed',
                items: [{ product: prodId, quantity: 1, unitPrice: 75000, total: 75000 }],
                company: compId,
                date: new Date()
            }).catch(e => console.log('Sale skip:', e.message));
        }

        if (sup && prodId) {
            await Purchase.create({
                supplier: sup._id,
                billNo: 'BILL-' + Date.now(),
                purchaseOrderNo: 'PO-' + Date.now(),
                totalAmount: 500000,
                paidAmount: 250000,
                paymentStatus: 'Partial',
                status: 'Received',
                items: [{ product: prodId, quantity: 10, unitPrice: 50000, total: 500000 }],
                company: compId,
                date: new Date()
            }).catch(e => console.log('Purchase skip:', e.message));
        }

        console.log("Seeding complete!");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

seedData();
