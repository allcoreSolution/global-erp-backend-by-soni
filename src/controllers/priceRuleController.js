const mongoose = require('mongoose');
const { PriceRule } = require('../models/PriceRule');

const getQueryById = (idParam) => {
  if (mongoose.Types.ObjectId.isValid(idParam)) {
    return { $or: [{ _id: idParam }, { id: idParam }] };
  }
  return { id: idParam };
};

const createPriceRule = async (req, res, next) => {
  try {
    let id = req.body.id;

    // Check if id is missing or already exists in database
    const idExists = id ? await PriceRule.exists({ id }) : false;
    if (!id || idExists) {
      // Find highest existing PR- number across all rules in database
      const allRules = await PriceRule.find({}, 'id ruleCode').lean();
      let maxNum = 0;
      for (const r of allRules) {
        const val = r.id || r.ruleCode || '';
        const match = String(val).match(/\d+/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      }
      id = `PR-${String(maxNum + 1).padStart(5, '0')}`;
      while (await PriceRule.exists({ id })) {
        maxNum++;
        id = `PR-${String(maxNum).padStart(5, '0')}`;
      }
    }
    
    const priceRule = await PriceRule.create({
      ...req.body,
      id,
      company: req.user?.companyId || req.body.company
    });
    res.status(201).json({ success: true, data: priceRule });
  } catch (error) {
    next(error);
  }
};

const getPriceRules = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const priceRules = await PriceRule.find(query);
    res.json({ success: true, data: priceRules });
  } catch (error) {
    next(error);
  }
};

const getPriceRuleById = async (req, res, next) => {
  try {
    const priceRule = await PriceRule.findOne(getQueryById(req.params.id));
    if (!priceRule) {
      res.status(404);
      return next(new Error('Price Rule not found'));
    }
    res.json({ success: true, data: priceRule });
  } catch (error) {
    next(error);
  }
};

const updatePriceRule = async (req, res, next) => {
  try {
    const priceRule = await PriceRule.findOneAndUpdate(
      getQueryById(req.params.id),
      req.body,
      { new: true, runValidators: true }
    );
    if (!priceRule) {
      res.status(404);
      return next(new Error('Price Rule not found'));
    }
    res.json({ success: true, data: priceRule });
  } catch (error) {
    next(error);
  }
};

const patchPriceRule = async (req, res, next) => {
  try {
    const priceRule = await PriceRule.findOneAndUpdate(
      getQueryById(req.params.id),
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!priceRule) {
      res.status(404);
      return next(new Error('Price Rule not found'));
    }
    res.json({ success: true, data: priceRule });
  } catch (error) {
    next(error);
  }
};

const deletePriceRule = async (req, res, next) => {
  try {
    const priceRule = await PriceRule.findOneAndDelete(getQueryById(req.params.id));
    if (!priceRule) {
      res.status(404);
      return next(new Error('Price Rule not found'));
    }
    res.json({ success: true, message: 'Price Rule deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPriceRule,
  getPriceRules,
  getPriceRuleById,
  updatePriceRule,
  patchPriceRule,
  deletePriceRule
};
