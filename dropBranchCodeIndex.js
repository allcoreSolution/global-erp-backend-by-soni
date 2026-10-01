const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    try {
      await mongoose.connection.collection('branches').dropIndex('branchCode_1');
      console.log('Successfully dropped stale branchCode_1 index');
    } catch(err) {
      console.log('Error or index not found:', err.message);
    }
    process.exit(0);
  });
