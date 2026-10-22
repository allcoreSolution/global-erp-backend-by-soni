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
      await mongoose.connection.collection('pricelists').dropIndex('id_1').catch(e => console.log('Index id_1 not found or already dropped'));
      
      console.log('Dropping stale index for HsnMappings...');
      await mongoose.connection.collection('hsnmappings').dropIndex('mappingId_1').catch(e => console.log('Index mappingId_1 not found or already dropped'));

      console.log('Dropping stale index for TaxSlabs...');
      await mongoose.connection.collection('taxslabs').dropIndex('taxCode_1').catch(e => console.log('Index taxCode_1 not found or already dropped'));

      console.log('Dropping stale index for Couriers...');
      await mongoose.connection.collection('couriers').dropIndex('courierCode_1').catch(e => console.log('Index courierCode_1 not found or already dropped'));

      console.log('Dropping stale index for StockTransfers...');
      await mongoose.connection.collection('stocktransfers').dropIndex('transferNo_1').catch(e => console.log('Index transferNo_1 not found or already dropped'));
      await mongoose.connection.collection('stocktransfers').dropIndex('voucherNo_1').catch(e => console.log('Index voucherNo_1 not found or already dropped'));

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
