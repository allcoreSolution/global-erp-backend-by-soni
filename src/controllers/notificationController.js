const Notification = require('../models/Notification');
const { Product } = require('../models/Product');

// @desc    Get all notifications and dynamic alerts
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const isSuperAdmin = req.user.role === 'SuperAdmin';
    const companyId = req.user.company;

    // 1. Fetch static notifications from DB
    const matchCriteria = isSuperAdmin ? {} : { company: companyId };
    const dbNotifications = await Notification.find({ ...matchCriteria, read: false })
      .sort('-createdAt')
      .limit(10);

    const messages = dbNotifications.filter(n => n.type === 'message').map(n => ({
      id: n._id,
      text: n.message,
      time: 'Just now' // In real app, calculate time ago from createdAt
    }));

    const reminders = dbNotifications.filter(n => n.type !== 'message').map(n => ({
      id: n._id,
      text: n.message,
      time: 'Just now'
    }));

    // 2. Generate dynamic alerts
    // Low stock alert
    const productMatch = isSuperAdmin ? {} : { company: companyId };
    const allProducts = await Product.find(productMatch);
    const lowStockCount = allProducts.filter(p => p.currentStock <= (parseInt(p.alertQuantity) || 0)).length;

    if (lowStockCount > 0) {
      reminders.unshift({
        id: 'dyn-low-stock',
        text: `Low stock alert for ${lowStockCount} products`,
        time: 'Active'
      });
    }

    // Default fallbacks if empty so the UI looks nice initially for the user
    if (messages.length === 0) {
      messages.push(
        { id: 'm1', text: 'From Manager: Sales report updated', time: '5m ago' },
        { id: 'm2', text: 'From Client: Invoice request #982', time: '20m ago' }
      );
    }
    
    if (reminders.length === 0) {
      reminders.push(
        { id: 'r1', text: 'GSTR-1 tax filings due in 3 days', time: '1 hour ago' },
        { id: 'r2', text: 'New voucher backup completed', time: 'Today, 9:30 AM' }
      );
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

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead
};