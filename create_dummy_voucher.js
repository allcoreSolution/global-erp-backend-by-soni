const mongoose = require('mongoose');
const Voucher = require('./src/models/Voucher');
const AccountLedger = require('./src/models/AccountLedger');
require('dotenv').config();

async function createVoucher() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/erp_global');
  console.log("Connected to DB");

  // 1. Create or Find Accounts
  let cashAcc = await AccountLedger.findOne({ accountName: 'Cash Account' });
  if (!cashAcc) {
    cashAcc = await AccountLedger.create({ accountName: 'Cash Account', groupType: 'Asset', balanceType: 'Dr' });
  }

  let salesAcc = await AccountLedger.findOne({ accountName: 'Sales Account' });
  if (!salesAcc) {
    salesAcc = await AccountLedger.create({ accountName: 'Sales Account', groupType: 'Income', balanceType: 'Cr' });
  }

  const User = require('./src/models/User');
  const adminUser = await User.findOne({ email: 'admin@gmail.com' });
  const companyId = adminUser ? adminUser.company : null;

  const voucherData = {
    voucherNo: `V-TEST-${Date.now()}`,
    date: new Date().toISOString().split('T')[0], // Today
    voucherType: 'Receipt',
    status: 'Posted',
    company: companyId, // Fixed: Added Company ID
    generalNarration: 'Dummy voucher created for testing Day Book',
    entries: [
      {
        account: cashAcc._id,
        debitAmount: 15000,
        creditAmount: 0,
        narration: 'Cash received from dummy sale'
      },
      {
        account: salesAcc._id,
        debitAmount: 0,
        creditAmount: 15000,
        narration: 'Sales Revenue'
      }
    ]
  };

  const newVoucher = await Voucher.create(voucherData);
  console.log("✅ Successfully created a dummy Voucher in DB!");
  console.log(`Voucher No: ${newVoucher.voucherNo}`);
  console.log(`Date: ${newVoucher.date}`);
  console.log(`Amount: 15000`);

  process.exit(0);
}

createVoucher();
