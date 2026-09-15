const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    try {
      console.log('Dropping stale index for PriceRules...');
      await mongoose.connection.collection('pricerules').dropIndex('ruleCode_1').catch(e => console.log('Index ruleCode_1 not found or already dropped'));
      
      console.log('Dropping stale index for PriceLists...');
      await mongoose.connection.collection('pricelists').dropIndex('priceListCode_1').catch(e => console.log('Index priceListCode_1 not found or already dropped'));
      
      console.log('Dropping stale index for HsnMappings...');
      await mongoose.connection.collection('hsnmappings').dropIndex('mappingId_1').catch(e => console.log('Index mappingId_1 not found or already dropped'));

      console.log('Indexes dropped successfully!');
    } catch(err) {
      console.error(err);
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
