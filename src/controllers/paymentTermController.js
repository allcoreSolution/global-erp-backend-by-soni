const PaymentTerm = require('../models/PaymentTerm');

exports.getAll = async (req, res, next) => {
  try {
    const query = {};
    if (req.user?.companyId) query.company = req.user.companyId;
    const items = await PaymentTerm.find(query);
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { value } = req.body;
    if (!value) return res.status(400).json({ success: false, message: 'Value is required' });
    const newItem = await PaymentTerm.create({ value, company: req.user?.companyId || req.body.company });
    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    next(error);
  }
};
