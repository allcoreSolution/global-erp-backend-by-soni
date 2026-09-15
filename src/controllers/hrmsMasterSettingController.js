const { HrmsMasterSetting } = require('../models/HrmsMasterSetting');

// @desc    Get HRMS Master Settings for the company
// @route   GET /api/hrms-master-settings
// @access  Private
const getHrmsMasterSettings = async (req, res, next) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      res.status(400);
      return next(new Error('Company ID is required'));
    }

    let settings = await HrmsMasterSetting.findOne({ company: companyId });
    
    // If no settings exist for the company, create default ones
    if (!settings) {
      settings = await HrmsMasterSetting.create({ company: companyId });
    }
    
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

// @desc    Update HRMS Master Settings
// @route   PUT /api/hrms-master-settings
// @access  Private
const updateHrmsMasterSettings = async (req, res, next) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      res.status(400);
      return next(new Error('Company ID is required'));
    }

    const { priorities, statuses } = req.body;

    let settings = await HrmsMasterSetting.findOne({ company: companyId });

    if (!settings) {
      // Create if it doesn't exist
      settings = await HrmsMasterSetting.create({
        company: companyId,
        priorities: priorities || ['High', 'Medium', 'Low'],
        statuses: statuses || ['In Progress', 'Completed', 'Behind Schedule']
      });
    } else {
      // Update existing
      if (priorities) settings.priorities = priorities;
      if (statuses) settings.statuses = statuses;
      await settings.save();
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHrmsMasterSettings,
  updateHrmsMasterSettings
};
