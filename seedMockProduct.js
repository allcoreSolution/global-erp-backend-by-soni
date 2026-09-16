require('dotenv').config();
const mongoose = require('mongoose');
const { Product } = require('./src/models/Product');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log("Connected to DB...");
  
  const mockProduct = {
    productName: 'Gaming Laptop Pro X',
    productCode: 'LAP10001',
    sku: 'LAP10001',
    productPrice: '1250',
    productCost: '1000',
    currentStock: '50',
    productTax: '18',
    isActive: true,
    company: null // or match the company id if known, but getProducts filters by req.user?.companyId. 
    // Since getProducts might filter strictly, let's insert it without company or handle company less strictly in testing.
    // I will insert it without company, and also update productController to fallback if no company
  };

  try {
    const existing = await Product.findOne({ productCode: mockProduct.productCode });
    if (!existing) {
      await Product.create(mockProduct);
      console.log("Mock product inserted successfully!");
    } else {
      console.log("Product already exists.");
    }
  } catch (e) {
    console.error("Error inserting product:", e);
  } finally {
    mongoose.connection.close();
  }
});
