const mongoose = require('mongoose');

const giftCardSchema = new mongoose.Schema({
  cardNo: { type: String, required: true, unique: true },
  customer: { type: String, default: 'Walk-in Customer' },
  amount: { type: String, default: '' },
  expense: { type: String, default: '0.00' },
  createdBy: { type: String, default: '' },
  expiredDate: { type: String, default: '' },
  company: { type: String, default: '' }
}, { timestamps: true });

const GiftCard = mongoose.model('GiftCard', giftCardSchema);

module.exports = { GiftCard };
