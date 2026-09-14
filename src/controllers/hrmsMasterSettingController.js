const HrmsMasterSetting = require('../models/HrmsMasterSetting');

// Get master settings (creates default if not exists)
const getHrmsSettings = async (req, res, next) => {
  try {
    let settings = await HrmsMasterSetting.findOne({ company: req.user?.companyId });
    if (!settings) {
      settings = await HrmsMasterSetting.create({
        company: req.user?.companyId,
        priorities: ['High', 'Medium', 'Low'],
        statuses: ['In Progress', 'Completed', 'Behind Schedule']
      });
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

// Create or override master settings
const createHrmsSettings = async (req, res, next) => {
  try {
    const { priorities, statuses } = req.body;
    let settings = await HrmsMasterSetting.findOne({ company: req.user?.companyId });
    
    if (settings) {
      // Overwrite existing
      settings.priorities = priorities || [];
      settings.statuses = statuses || [];
      await settings.save();
    } else {
      // Create new
      settings = await HrmsMasterSetting.create({
        company: req.user?.companyId,
        priorities: priorities || [],
        statuses: statuses || []
      });
    }
    res.status(201).json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

// Update master settings
const updateHrmsSettings = async (req, res, next) => {
  try {
    const { priorities, statuses } = req.body;
    let settings = await HrmsMasterSetting.findOne({ company: req.user?.companyId });
    
    if (!settings) {
      settings = await HrmsMasterSetting.create({
        company: req.user?.companyId,
        priorities: priorities || ['High', 'Medium', 'Low'],
        statuses: statuses || ['In Progress', 'Completed', 'Behind Schedule']
      });
    } else {
      if (priorities) settings.priorities = priorities;
      if (statuses) settings.statuses = statuses;
      await settings.save();
    }
    
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

// Delete master settings
const deleteHrmsSettings = async (req, res, next) => {
  try {
    const settings = await HrmsMasterSetting.findOneAndDelete({ company: req.user?.companyId });
    if (!settings) {
      res.status(404);
      return next(new Error('HRMS Settings not found'));
    }
    res.json({ success: true, message: 'HRMS Settings deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHrmsSettings,
  createHrmsSettings,
  updateHrmsSettings,
  deleteHrmsSettings
};
