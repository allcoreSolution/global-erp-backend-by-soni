const mongoose = require('mongoose');
const Voucher = require('./src/models/Voucher');
require('dotenv').config();

async function checkVouchers() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/erp_global');
  console.log("Connected to DB");

  const vouchers = await Voucher.find({}).populate('entries.account');
  console.log(`Total Vouchers in DB: ${vouchers.length}`);
  
  if (vouchers.length > 0) {
    console.log("Sample Voucher:");
    console.log(JSON.stringify(vouchers[0], null, 2));
  }

  process.exit(0);
}

checkVouchers();
