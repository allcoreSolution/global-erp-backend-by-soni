const { PriceRule } = require('../models/PriceRule');

const createPriceRule = async (req, res, next) => {
  try {
    let ruleCode = req.body.ruleCode;
    if (!ruleCode) {
      ruleCode = `PR-${Date.now().toString().slice(-4)}`;
    }
    
    const priceRule = await PriceRule.create({
      ...req.body,
      ruleCode,
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
    const priceRule = await PriceRule.findById(req.params.id);
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
    const priceRule = await PriceRule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
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
    const priceRule = await PriceRule.findByIdAndUpdate(
      req.params.id, 
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
    const priceRule = await PriceRule.findByIdAndDelete(req.params.id);
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
