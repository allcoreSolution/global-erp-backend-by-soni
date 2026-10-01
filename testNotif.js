const mongoose = require('mongoose');
require('dotenv').config();
const Notification = require('./src/models/Notification');
const Product = require('./src/models/Product');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  try {
    const isSuperAdmin = true;
    const companyId = null;
    
    // 1. Fetch static notifications from DB
    const matchCriteria = isSuperAdmin ? {} : { company: companyId };
    const dbNotifications = await Notification.find({ ...matchCriteria, read: false })
      .sort('-createdAt')
      .limit(10);
      
    // 2. Generate dynamic alerts
    const productMatch = isSuperAdmin ? {} : { company: companyId };
    const lowStockProducts = await Product.find({ 
      ...productMatch, 
      $expr: { $lte: ["$stock", "$reorderLevel"] }
    });
    console.log('Success!', lowStockProducts.length);
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit();
});
