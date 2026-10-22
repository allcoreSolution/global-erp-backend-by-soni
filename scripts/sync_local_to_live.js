const mongoose = require('mongoose');

const LOCAL_URI = 'mongodb://127.0.0.1:27017/erp_global';
const ATLAS_URI = 'mongodb+srv://tiwarisoni671_db_user:HCBQL32nEKmtVe0V@cluster0.w5wpuw7.mongodb.net/?appName=Cluster0';

async function syncCollection(localDb, targetDb, colName, targetDbName) {
  const localCol = localDb.collection(colName);
  const targetCol = targetDb.collection(colName);

  const docs = await localCol.find({}).toArray();
  if (docs.length === 0) return { colName, localCount: 0, targetCount: 0, upserted: 0, matched: 0, errors: 0 };

  let upserted = 0;
  let matched = 0;
  let errors = 0;

  for (const doc of docs) {
    try {
      const res = await targetCol.replaceOne({ _id: doc._id }, doc, { upsert: true });
      if (res.upsertedCount > 0) upserted++;
      else if (res.matchedCount > 0) matched++;
    } catch (err) {
      // If E11000 duplicate key error on another field, find and remove the conflicting document that has a different _id
      if (err.code === 11000) {
        try {
          const keyPattern = err.keyPattern || {};
          const keyValue = err.keyValue || {};
          console.warn(`[${targetDbName}.${colName}] Conflict on ${JSON.stringify(keyValue)}. Resolving...`);
          // Remove conflicting document with different _id
          if (Object.keys(keyValue).length > 0) {
            await targetCol.deleteOne({ ...keyValue, _id: { $ne: doc._id } });
            // Retry replaceOne
            const retryRes = await targetCol.replaceOne({ _id: doc._id }, doc, { upsert: true });
            if (retryRes.upsertedCount > 0) upserted++;
            else if (retryRes.matchedCount > 0) matched++;
            continue;
          }
        } catch (resolveErr) {
          console.error(`[${targetDbName}.${colName}] Conflict resolution error:`, resolveErr.message);
        }
      }
      console.error(`[${targetDbName}.${colName}] Error syncing doc ${doc._id}:`, err.message);
      errors++;
    }
  }

  const targetCount = await targetCol.countDocuments();
  return { colName, localCount: docs.length, targetCount, upserted, matched, errors };
}

async function run() {
  console.log('====================================================');
  console.log('🚀 STARTING FULL DATABASE SYNC: LOCAL -> LIVE ATLAS');
  console.log('====================================================');

  console.log('Connecting to Local MongoDB:', LOCAL_URI);
  const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
  console.log('✅ Connected to Local MongoDB\n');

  console.log('Connecting to Live Atlas MongoDB Cluster...');
  const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
  console.log('✅ Connected to Live Atlas Cluster\n');

  const localCols = await localConn.db.listCollections().toArray();
  const collectionsWithData = [];

  for (const c of localCols) {
    if (c.name.startsWith('system.')) continue;
    const count = await localConn.db.collection(c.name).countDocuments();
    if (count > 0) {
      collectionsWithData.push({ name: c.name, count });
    }
  }

  collectionsWithData.sort((a, b) => b.count - a.count);
  console.log(`Found ${collectionsWithData.length} collections with data in local database.\n`);

  const TARGET_DBS = ['erp_global', 'test'];

  for (const targetDbName of TARGET_DBS) {
    console.log(`\n----------------------------------------------------`);
    console.log(`🔄 SYNCING TO TARGET DATABASE: [ ${targetDbName} ]`);
    console.log(`----------------------------------------------------`);
    const targetDb = atlasConn.useDb(targetDbName);
    const summary = [];

    for (const { name: colName } of collectionsWithData) {
      const stats = await syncCollection(localConn.db, targetDb, colName, targetDbName);
      summary.push(stats);
      process.stdout.write(`✔ ${colName.padEnd(24)}: ${stats.localCount} docs synced (Upserted: ${stats.upserted}, Matched: ${stats.matched}, Errors: ${stats.errors})\n`);
    }

    console.log(`\nFinished sync to [ ${targetDbName} ]. Total collections synced: ${summary.length}`);
  }

  console.log('\n====================================================');
  console.log('🎉 ALL DATA SYNCED SUCCESSFULLY TO LIVE DATABASE!');
  console.log('====================================================');

  await localConn.close();
  await atlasConn.close();
  process.exit(0);
}

run().catch((err) => {
  console.error('Fatal sync error:', err);
  process.exit(1);
});
