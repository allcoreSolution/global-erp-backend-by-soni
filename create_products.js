const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/erp_global').then(async () => {
  const db = mongoose.connection.db;

  const demoCompany = await db.collection('companies').findOne({ email: 'info@democompany.com' });
  const companyId = demoCompany ? demoCompany._id : null;

  // We will assign them to the first brand/category we find, or null if none
  const brand = await db.collection('brands').findOne({ company: companyId });
  const category = await db.collection('categories').findOne({ company: companyId });

  const brandId = brand ? brand._id : null;
  const categoryId = category ? category._id : null;

  const products = [];
  for (let i = 1; i <= 10; i++) {
    products.push({
      productName: `Demo Product ${i}`,
      productCode: `PROD-${Date.now()}-${i}`, // Using timestamp to guarantee uniqueness globally
      productType: 'Standard',
      sku: `SKU-${Date.now()}-${i}`,
      brand: brandId,
      category: categoryId,
      productUnit: 'Pieces',
      saleUnit: 'Pieces',
      purchaseUnit: 'Pieces',
      productCost: (100 * i).toString(),
      productPrice: (150 * i).toString(),
      wholesalePrice: (130 * i).toString(),
      currentStock: 50,
      isActive: true,
      company: companyId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  try {
    await db.collection('products').insertMany(products);
    console.log(`Successfully created ${products.length} products!`);
  } catch (err) {
    console.error('Error creating products:', err);
  }

  process.exit(0);
});
