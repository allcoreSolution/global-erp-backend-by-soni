const mongoose = require('mongoose');

const ATLAS_URI = 'mongodb+srv://tiwarisoni671_db_user:HCBQL32nEKmtVe0V@cluster0.w5wpuw7.mongodb.net/erp_global?retryWrites=true&w=majority&appName=Cluster0';

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    // Auto-correct known typo if set in Render dashboard
    if (mongoUri && mongoUri.includes('HCBQLA32nEKmtVe0V')) {
      mongoUri = mongoUri.replace('HCBQLA32nEKmtVe0V', 'HCBQL32nEKmtVe0V');
    }

    // In cloud production (Render, Heroku, etc.), never try 127.0.0.1 if it will fail
    const isCloudEnv = process.env.NODE_ENV === 'production' || process.env.RENDER || Boolean(process.env.RENDER_SERVICE_ID);
    if (!mongoUri || (isCloudEnv && (mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost')))) {
      mongoUri = ATLAS_URI;
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000
    });
    console.log(`✅ MongoDB Connected successfully to: ${conn.connection.host} [DB: ${conn.connection.name}]`);
  } catch (error) {
    console.error(`❌ Database Connection Error: ${error.message}`);
    // Fallback attempt to Atlas if primary failed
    try {
      console.log('Attempting fallback connection to verified MongoDB Atlas cluster...');
      const fallbackConn = await mongoose.connect(ATLAS_URI, {
        serverSelectionTimeoutMS: 15000
      });
      console.log(`✅ MongoDB Fallback Connected to Atlas: ${fallbackConn.connection.host}`);
    } catch (fallbackError) {
      console.error(`❌ Atlas Fallback Failed: ${fallbackError.message}`);
    }
  }
};

module.exports = connectDB;

