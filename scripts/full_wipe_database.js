const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/erp_global';

async function fullWipeDatabase() {
  console.log('Connecting to MongoDB:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB successfully!');

  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();

  console.log(`\nFound ${collections.length} collections in database.`);

  // 1. Take a full safety backup first
  const backupData = {};
  let totalDocsBefore = 0;
  for (const col of collections) {
    const docs = await db.collection(col.name).find({}).toArray();
    backupData[col.name] = docs;
    totalDocsBefore += docs.length;
  }

  const backupDir = path.join(__dirname, '../public/backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  const backupFile = path.join(backupDir, `backup_before_full_wipe_${Date.now()}.json`);
  fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2), 'utf8');
  console.log(`\n✓ Safety backup created: ${backupFile} (${totalDocsBefore} documents backed up)\n`);

  // 2. Wipe every collection
  console.log('--- WIPING ALL COLLECTIONS (Masters, Transactions, HRMS, Reports, Setup, Super Admin, Users) ---');
  let totalDeleted = 0;

  for (const col of collections.sort((a, b) => a.name.localeCompare(b.name))) {
    const colName = col.name;
    const res = await db.collection(colName).deleteMany({});
    console.log(`  ✓ Cleared ${colName.padEnd(25)} : deleted ${res.deletedCount} documents`);
    totalDeleted += res.deletedCount;
  }

  console.log(`\nTotal documents deleted: ${totalDeleted}`);

  // 3. Verification check
  console.log('\n--- VERIFICATION: CHECKING ALL COLLECTION COUNTS ---');
  let remainingCount = 0;
  for (const col of collections.sort((a, b) => a.name.localeCompare(b.name))) {
    const count = await db.collection(col.name).countDocuments();
    if (count > 0) {
      console.log(`  ⚠️ ${col.name}: ${count} remaining!`);
      remainingCount += count;
    }
  }

  if (remainingCount === 0) {
    console.log('\n✅ 100% EMPTY! Database me ek bhi record bacha nahi hai. Sabhi collections completely khali ho chuki hain.');
  } else {
    console.log(`\n⚠️ Warning: ${remainingCount} documents still remaining.`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

fullWipeDatabase().catch(err => {
  console.error('Wipe error:', err);
  process.exit(1);
});
