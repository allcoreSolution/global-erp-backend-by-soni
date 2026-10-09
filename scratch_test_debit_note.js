const mongoose = require('mongoose');
const { DebitNote } = require('./src/models/DebitNote');
const { Supplier } = require('./src/models/Supplier');
const { Product } = require('./src/models/Product');
const { Journal } = require('./src/models/Journal');
const debitNoteController = require('./src/controllers/debitNoteController');

const MONGO_URI = 'mongodb://127.0.0.1:27017/Globle_erp';

async function runTest() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const testSupplierName = 'Test Supplier ' + Date.now();
    const testProductName = 'Test Product ' + Date.now();
    const testBranch = 'HQ';

    // 1. Create a dummy Supplier with 1000 balance
    const supplier = await Supplier.create({
      supplierCode: 'SUP-TEST-' + Date.now(),
      companyName: testSupplierName,
      balance: 1000
    });
    console.log(`Created Supplier: ${supplier.companyName} with balance: ${supplier.balance}`);

    // 2. Create a dummy Product with 20 stock in HQ
    const product = await Product.create({
      productCode: 'PROD-TEST-' + Date.now(),
      productName: testProductName,
      currentStock: 20,
      warehouseStocks: [{ warehouse: testBranch, stock: 20 }]
    });
    console.log(`Created Product: ${product.productName} with Total Stock: ${product.currentStock}, HQ Stock: ${product.warehouseStocks[0].stock}`);

    // 3. Mock Req/Res for Controller
    const debitNoteNo = 'DN-TEST-' + Date.now();
    const req = {
      user: { companyId: new mongoose.Types.ObjectId() },
      body: {
        debitNoteNo,
        date: new Date().toISOString().split('T')[0],
        branch: testBranch,
        supplier: testSupplierName,
        originalInvoiceNo: 'INV-12345',
        summary: { grandTotal: 250 }, // 10 units * 25 rate
        items: [
          {
            product: testProductName,
            qty: 10,
            rate: 25,
            amount: 250
          }
        ]
      }
    };

    const res = {
      statusCode: null,
      jsonData: null,
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.jsonData = data;
        return this;
      }
    };
    
    const next = (err) => {
      console.error('Controller Error:', err);
    };

    // 4. Run Controller Create
    console.log('\n--- Running createDebitNote ---');
    await debitNoteController.createDebitNote(req, res, next);
    console.log('Response Status:', res.statusCode);
    
    if (res.statusCode !== 201) {
      console.error('Failed to create Debit Note', res.jsonData);
      process.exit(1);
    }

    // 5. Verify Database States
    console.log('\n--- Verifying Database State ---');

    // Check Supplier Balance
    const updatedSupplier = await Supplier.findById(supplier._id);
    console.log(`Supplier Balance (Expected: 750, Actual: ${updatedSupplier.balance})`);
    if (updatedSupplier.balance !== 750) console.error('❌ SUPPLIER BALANCE MISMATCH!');
    else console.log('✅ Supplier Balance Updated Correctly');

    // Check Product Stock
    const updatedProduct = await Product.findById(product._id);
    const updatedWStock = updatedProduct.warehouseStocks.find(w => w.warehouse === testBranch)?.stock;
    console.log(`Product Total Stock (Expected: 10, Actual: ${updatedProduct.currentStock})`);
    console.log(`Product HQ Stock (Expected: 10, Actual: ${updatedWStock})`);
    
    if (updatedProduct.currentStock !== 10) console.error('❌ PRODUCT TOTAL STOCK MISMATCH!');
    else console.log('✅ Product Total Stock Updated Correctly');
    
    if (updatedWStock !== 10) console.error('❌ PRODUCT WAREHOUSE STOCK MISMATCH!');
    else console.log('✅ Product Warehouse Stock Updated Correctly');

    // Check Journal Entry
    const journalEntry = await Journal.findOne({ referenceNo: debitNoteNo });
    if (!journalEntry) {
      console.error('❌ JOURNAL ENTRY NOT FOUND!');
    } else {
      console.log(`✅ Journal Entry Found (journalNo: ${journalEntry.journalNo})`);
      console.log(`  Debit: ${journalEntry.totals.debit}, Credit: ${journalEntry.totals.credit} (Expected: 250)`);
      if (journalEntry.totals.debit === 250 && journalEntry.totals.credit === 250) {
        console.log('✅ Journal Entry Totals Correct');
      } else {
        console.error('❌ JOURNAL ENTRY TOTALS INCORRECT!');
      }
    }

    // 6. Test Negative Stock Exception (Optional but good)
    console.log('\n--- Testing Negative Stock Exception ---');
    req.body.items[0].qty = 50; // We only have 10 left!
    req.body.debitNoteNo = 'DN-FAIL-' + Date.now();
    
    const resFail = {
      statusCode: null,
      jsonData: null,
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.jsonData = data;
        return this;
      }
    };
    
    await debitNoteController.createDebitNote(req, resFail, next);
    console.log('Response Status for Negative Stock:', resFail.statusCode);
    if (resFail.statusCode === 400 && resFail.jsonData.message.includes('Insufficient stock')) {
      console.log('✅ Stock Exception Handled Correctly!');
    } else {
      console.error('❌ STOCK EXCEPTION FAILED TO TRIGGER!');
    }

    console.log('\n--- Deep Cross Check Completed Successfully ---');

    // Clean up
    await DebitNote.deleteOne({ debitNoteNo });
    await Supplier.deleteOne({ _id: supplier._id });
    await Product.deleteOne({ _id: product._id });
    if (journalEntry) await Journal.deleteOne({ _id: journalEntry._id });

  } catch (error) {
    console.error('Test Execution Failed:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

runTest();
