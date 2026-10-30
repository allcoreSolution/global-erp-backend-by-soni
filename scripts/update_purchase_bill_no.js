const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/erp_global';

async function run() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB:', mongoUri);

    const purchasesColl = mongoose.connection.collection('purchases');
    const purchases = await purchasesColl.find({}).sort({ createdAt: 1, purchaseDate: 1 }).toArray();

    console.log(`Found ${purchases.length} purchases to update.`);

    for (let i = 0; i < purchases.length; i++) {
      const p = purchases[i];
      const seq = String(i + 1).padStart(3, '0');
      const billNo = `BILL-${seq}`;

      await purchasesColl.updateOne(
        { _id: p._id },
        {
          $set: { billNo: billNo, referenceNo: '' }
        }
      );

      console.log(`Updated Purchase [${p.purchaseNo || p._id}]: Old Ref "${p.referenceNo}" -> New BillNo "${billNo}"`);
    }

    const updated = await purchasesColl.find({}).project({ purchaseNo: 1, invoiceNo: 1, billNo: 1, referenceNo: 1 }).toArray();
    console.log('\nUpdated Purchases in DB:');
    console.log(JSON.stringify(updated, null, 2));

    process.exit(0);
  } catch (err) {
    console.error('Migration Error:', err);
    process.exit(1);
  }
}

run();
