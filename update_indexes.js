const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://tiwarisoni671_db_user:HCBQL32nEKmtVe0V@cluster0.w5wpuw7.mongodb.net/test')
  .then(async () => {
    try {
      const db = mongoose.connection.db;
      
      console.log('Dropping old global index id_1 from branches...');
      try {
        await db.collection('branches').dropIndex('id_1');
        console.log('Successfully dropped old id_1 index.');
      } catch (err) {
        console.log('Index might not exist or already dropped:', err.message);
      }
      
      console.log('Creating new compound index for company + id...');
      await db.collection('branches').createIndex({ company: 1, id: 1 }, { unique: true });
      console.log('Successfully created new compound index.');
      
      process.exit(0);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  });
