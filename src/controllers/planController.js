const Plan = require('../models/Plan');

// @desc    Get all plans
// @route   GET /api/plans
// @access  Private (SuperAdmin)
const getPlans = async (req, res, next) => {
  try {
    const plans = await Plan.find({}).sort({ price: 1 });
    res.json(plans);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new plan
// @route   POST /api/plans
// @access  Private (SuperAdmin)
const createPlan = async (req, res, next) => {
  try {
    const { name, price, durationDays, features, isActive } = req.body;
    
    const plan = new Plan({
      name,
      price,
      durationDays,
      features,
      isActive
    });

    const createdPlan = await plan.save();
    res.status(201).json(createdPlan);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a plan
// @route   PUT /api/plans/:id
// @access  Private (SuperAdmin)
const updatePlan = async (req, res, next) => {
  try {
    const { name, price, durationDays, features, isActive } = req.body;
    const plan = await Plan.findById(req.params.id);

    if (plan) {
      plan.name = name || plan.name;
      plan.price = price !== undefined ? price : plan.price;
      plan.durationDays = durationDays || plan.durationDays;
      plan.features = features || plan.features;
      plan.isActive = isActive !== undefined ? isActive : plan.isActive;

      const updatedPlan = await plan.save();
      res.json(updatedPlan);
    } else {
      res.status(404);
      throw new Error('Plan not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlans,
  createPlan,
  updatePlan
};
