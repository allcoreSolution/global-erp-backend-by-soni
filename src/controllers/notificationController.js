const Notification = require('../models/Notification');
const { Product } = require('../models/Product');
const { Customer } = require('../models/Customer');
const LeaveRequest = require('../models/LeaveRequest');
const ExpenseClaim = require('../models/ExpenseClaim');
const Company = require('../models/Company');
const User = require('../models/User');

const getTimeAgo = (date) => {
  if (!date) return 'Just now';
  const diff = Math.floor((new Date() - new Date(date)) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// @desc    Get top unread notifications and real-time alerts for header bell
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const isSuperAdmin = req.user?.role?.name === 'SuperAdmin' || req.user?.role === 'SuperAdmin';
    const companyId = req.user?.company;
    const userId = req.user?._id;

    // Filter criteria:
    // 1. Not already marked read by this user
    // 2. Targeted to 'all', or this company, or this user specifically
    let criteria = {
      readBy: { $ne: userId }
    };

    if (!isSuperAdmin) {
      criteria.$or = [
        { targetType: 'all' },
        { targetType: 'company', targetCompany: companyId },
        { targetType: 'company', company: companyId },
        { targetType: 'user', targetUser: userId },
        { company: companyId, targetType: { $exists: false } },
        { company: null, targetType: { $exists: false } }
      ];
    }

    const dbNotifications = await Notification.find(criteria)
      .sort('-createdAt')
      .limit(15);

    const messages = dbNotifications
      .filter(n => n.type === 'message')
      .map(n => ({
        id: String(n._id),
        text: n.message || n.title,
        title: n.title,
        time: getTimeAgo(n.createdAt),
        type: 'message',
        priority: n.priority || 'medium',
        senderName: n.senderName || 'Admin'
      }));

    const reminders = dbNotifications
      .filter(n => n.type !== 'message')
      .map(n => ({
        id: String(n._id),
        text: n.message || n.title,
        title: n.title,
        time: getTimeAgo(n.createdAt),
        type: n.type || 'reminder',
        priority: n.priority || 'medium',
        senderName: n.senderName || 'Admin'
      }));

    // Dynamic Real-time ERP System Reminders
    try {
      // (a) Low Stock Alerts
      const productMatch = isSuperAdmin || !companyId ? {} : { company: companyId };
      const products = await Product.find(productMatch).select('name currentStock minStockLevel alertQuantity');
      const lowStockProducts = products.filter(p => {
        const threshold = Number(p.minStockLevel || p.alertQuantity || 0);
        return threshold > 0 && Number(p.currentStock || 0) <= threshold;
      });

      if (lowStockProducts.length > 0) {
        reminders.unshift({
          id: 'dyn-low-stock',
          text: `Low stock alert: ${lowStockProducts.length} product(s) below minimum level`,
          title: 'Inventory Alert',
          time: 'Active Alert',
          type: 'alert'
        });
      }

      // (b) Customer Outstanding Dues
      const customerMatch = isSuperAdmin || !companyId ? {} : { company: companyId };
      const dueCustomers = await Customer.find({
        ...customerMatch,
        $or: [
          { openingBalance: { $gt: 0 } },
          { currentBalance: { $gt: 0 } }
        ]
      }).select('name customerName openingBalance');

      if (dueCustomers.length > 0) {
        reminders.push({
          id: 'dyn-cust-dues',
          text: `Payment Pending: ${dueCustomers.length} customer(s) have outstanding balances`,
          title: 'Receivables Alert',
          time: 'Payment Due',
          type: 'reminder'
        });
      }

      // (c) Pending Leave Requests
      const leaveMatch = isSuperAdmin || !companyId ? { status: 'Pending' } : { company: companyId, status: 'Pending' };
      const pendingLeaves = await LeaveRequest.countDocuments(leaveMatch);
      if (pendingLeaves > 0) {
        reminders.push({
          id: 'dyn-leaves',
          text: `HR Alert: ${pendingLeaves} employee leave request(s) awaiting approval`,
          title: 'Leave Request',
          time: 'HRMS',
          type: 'reminder'
        });
      }

      // (d) Pending Expense Claims
      const expenseMatch = isSuperAdmin || !companyId ? { status: 'Pending' } : { company: companyId, status: 'Pending' };
      const pendingExpenses = await ExpenseClaim.countDocuments(expenseMatch);
      if (pendingExpenses > 0) {
        reminders.push({
          id: 'dyn-expenses',
          text: `Expense Alert: ${pendingExpenses} claim(s) pending verification`,
          title: 'Expense Claim',
          time: 'Accounts',
          type: 'reminder'
        });
      }
    } catch (metricErr) {
      console.error('Error fetching dynamic ERP alerts:', metricErr.message);
    }

    res.json({
      success: true,
      data: {
        messages,
        reminders
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get all notifications list for Notifications Page
// @route   GET /api/notifications/list
// @access  Private
const getNotificationList = async (req, res, next) => {
  try {
    const isSuperAdmin = req.user?.role?.name === 'SuperAdmin' || req.user?.role === 'SuperAdmin';
    const companyId = req.user?.company;
    const userId = req.user?._id;

    let query = {};
    if (!isSuperAdmin) {
      query.$or = [
        { sender: userId },
        { targetType: 'all' },
        { targetType: 'company', targetCompany: companyId },
        { targetType: 'company', company: companyId },
        { targetType: 'user', targetUser: userId },
        { company: companyId }
      ];
    }

    const notifications = await Notification.find(query)
      .populate('targetCompany', 'companyName email phone')
      .populate('targetUser', 'name username email')
      .populate('sender', 'name username email')
      .sort('-createdAt')
      .limit(100);

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get target options (Companies, Users) for notification creation
// @route   GET /api/notifications/targets
// @access  Private
const getTargets = async (req, res, next) => {
  try {
    const isSuperAdmin = req.user?.role?.name === 'SuperAdmin' || req.user?.role === 'SuperAdmin';
    const companyId = req.user?.company;

    if (isSuperAdmin) {
      const companies = await Company.find({ status: { $ne: 'Inactive' } })
        .select('companyName email phone')
        .sort('companyName');

      const users = await User.find({ isActive: { $ne: false } })
        .select('name username email role company')
        .populate('company', 'companyName')
        .sort('name');

      return res.json({
        success: true,
        data: {
          companies,
          users
        }
      });
    } else {
      const users = await User.find({ company: companyId, isActive: { $ne: false } })
        .select('name username email role')
        .sort('name');

      return res.json({
        success: true,
        data: {
          companies: [],
          users
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new notification / broadcast
// @route   POST /api/notifications
// @access  Private
const createNotification = async (req, res, next) => {
  try {
    const isSuperAdmin = req.user?.role?.name === 'SuperAdmin' || req.user?.role === 'SuperAdmin';
    const companyId = req.user?.company;
    const { 
      title, 
      message, 
      type = 'alert', 
      priority = 'medium', 
      targetType = 'all', 
      targetCompany, 
      targetUser 
    } = req.body;

    if (!message && !title) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    let finalTargetType = targetType;
    let finalTargetCompany = null;
    let finalTargetUser = null;
    let notifCompany = companyId || null;

    if (isSuperAdmin) {
      if (targetType === 'company') {
        if (!targetCompany) {
          return res.status(400).json({ success: false, message: 'Please select a company to target' });
        }
        finalTargetCompany = targetCompany;
        notifCompany = targetCompany;
      } else if (targetType === 'user') {
        if (!targetUser) {
          return res.status(400).json({ success: false, message: 'Please select a user to target' });
        }
        finalTargetUser = targetUser;
      } else {
        finalTargetType = 'all';
      }
    } else {
      // Regular Company Admin / User
      if (targetType === 'user') {
        if (!targetUser) {
          return res.status(400).json({ success: false, message: 'Please select an employee' });
        }
        finalTargetType = 'user';
        finalTargetUser = targetUser;
        finalTargetCompany = companyId;
        notifCompany = companyId;
      } else {
        // 'all' means all employees in this company
        finalTargetType = 'company';
        finalTargetCompany = companyId;
        notifCompany = companyId;
      }
    }

    const newNotif = await Notification.create({
      title: title || 'System Announcement',
      message: message || title,
      type,
      priority,
      targetType: finalTargetType,
      targetCompany: finalTargetCompany,
      targetUser: finalTargetUser,
      sender: req.user?._id,
      senderName: req.user?.name || req.user?.username || (isSuperAdmin ? 'Super Admin' : 'Company Admin'),
      senderRole: req.user?.role?.name || (typeof req.user?.role === 'string' ? req.user?.role : 'Admin'),
      company: notifCompany,
      read: false,
      readBy: []
    });

    const populated = await Notification.findById(newNotif._id)
      .populate('targetCompany', 'companyName email phone')
      .populate('targetUser', 'name username email')
      .populate('sender', 'name username email');

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (id.startsWith('dyn-')) {
      return res.json({ success: true, message: 'Dynamic alert dismissed' });
    }

    const notification = await Notification.findByIdAndUpdate(
      id, 
      { 
        $addToSet: { readBy: userId },
        read: true 
      }, 
      { new: true }
    );

    res.json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear / mark all notifications as read
// @route   PUT /api/notifications/clear-all
// @access  Private
const clearAllNotifications = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const isSuperAdmin = req.user?.role?.name === 'SuperAdmin' || req.user?.role === 'SuperAdmin';
    const companyId = req.user?.company;

    let query = {};
    if (!isSuperAdmin) {
      query.$or = [
        { targetType: 'all' },
        { targetType: 'company', targetCompany: companyId },
        { targetType: 'company', company: companyId },
        { targetType: 'user', targetUser: userId },
        { company: companyId }
      ];
    }

    await Notification.updateMany(query, { 
      $addToSet: { readBy: userId },
      read: true 
    });

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isSuperAdmin = req.user?.role?.name === 'SuperAdmin' || req.user?.role === 'SuperAdmin';

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (!isSuperAdmin && String(notification.sender) !== String(req.user?._id)) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this notification' });
    }

    await Notification.findByIdAndDelete(id);
    res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  getNotificationList,
  getTargets,
  createNotification,
  markAsRead,
  clearAllNotifications,
  deleteNotification
};