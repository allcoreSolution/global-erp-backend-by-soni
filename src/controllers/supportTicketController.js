const SupportTicket = require('../models/SupportTicket');
const Company = require('../models/Company');
const Notification = require('../models/Notification');

// @desc    Create a new support ticket
// @route   POST /api/support/tickets
// @access  Private
const createTicket = async (req, res, next) => {
  try {
    const { subject, description, category = 'General Support', priority = 'Medium' } = req.body;

    if (!subject || !description) {
      return res.status(400).json({ success: false, message: 'Subject and description are required' });
    }

    const userId = req.user?._id;
    const userName = req.user?.name || req.user?.username || 'User';
    const userEmail = req.user?.email || '';
    const userPhone = req.user?.mobile || req.user?.phone || '';
    const companyId = req.user?.company || null;

    let companyName = 'Global User';
    if (companyId) {
      const companyDoc = await Company.findById(companyId);
      if (companyDoc) companyName = companyDoc.companyName;
    }

    const count = await SupportTicket.countDocuments();
    const ticketNumber = `TCK-${1000 + count + 1}`;

    const newTicket = await SupportTicket.create({
      ticketNumber,
      subject,
      description,
      category,
      priority,
      status: 'Open',
      user: userId,
      userName,
      userEmail,
      userPhone,
      company: companyId,
      companyName,
      messages: [
        {
          sender: userId,
          senderType: req.user?.role?.name === 'SuperAdmin' ? 'SuperAdmin' : 'Customer',
          senderName: userName,
          message: description,
          createdAt: new Date()
        }
      ]
    });

    // Notify Super Admin of new support ticket
    try {
      await Notification.create({
        title: `Support Ticket: ${ticketNumber}`,
        message: `${userName} (${companyName}) raised a support request: "${subject}"`,
        type: 'alert',
        priority: priority === 'Urgent' ? 'urgent' : priority === 'High' ? 'high' : 'medium',
        targetType: 'all',
        sender: userId,
        senderName: userName,
        senderRole: req.user?.role?.name || 'Customer'
      });
    } catch (e) {
      console.error('Notification dispatch failed for ticket:', e.message);
    }

    res.status(201).json({
      success: true,
      message: 'Support ticket registered successfully',
      data: newTicket
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all support tickets (Admin sees all, tenant sees own)
// @route   GET /api/support/tickets
// @access  Private
const getTickets = async (req, res, next) => {
  try {
    const isSuperAdmin = req.user?.role?.name === 'SuperAdmin' || req.user?.role === 'SuperAdmin';
    const companyId = req.user?.company;
    const userId = req.user?._id;

    const { status, priority, category, search } = req.query;

    let filter = {};

    if (!isSuperAdmin) {
      if (companyId) {
        filter.$or = [{ company: companyId }, { user: userId }];
      } else {
        filter.user = userId;
      }
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (priority && priority !== 'All') {
      filter.priority = priority;
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { ticketNumber: { $regex: q, $options: 'i' } },
          { subject: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { userName: { $regex: q, $options: 'i' } },
          { companyName: { $regex: q, $options: 'i' } }
        ]
      });
    }

    const tickets = await SupportTicket.find(filter)
      .populate('user', 'name username email mobile')
      .populate('company', 'companyName email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: tickets
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single ticket details with thread
// @route   GET /api/support/tickets/:id
// @access  Private
const getTicketById = async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('user', 'name username email mobile')
      .populate('company', 'companyName email phone');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found' });
    }

    const isSuperAdmin = req.user?.role?.name === 'SuperAdmin' || req.user?.role === 'SuperAdmin';
    if (!isSuperAdmin) {
      const matchesCompany = ticket.company && String(ticket.company._id || ticket.company) === String(req.user?.company);
      const matchesUser = ticket.user && String(ticket.user._id || ticket.user) === String(req.user?._id);
      if (!matchesCompany && !matchesUser) {
        return res.status(403).json({ success: false, message: 'Unauthorized to view this ticket' });
      }
    }

    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reply to a ticket thread
// @route   POST /api/support/tickets/:id/reply
// @access  Private
const replyTicket = async (req, res, next) => {
  try {
    const { message, status } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    }

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const isSuperAdmin = req.user?.role?.name === 'SuperAdmin' || req.user?.role === 'SuperAdmin';
    const senderType = isSuperAdmin ? 'Support' : 'Customer';
    const senderName = req.user?.name || req.user?.username || (isSuperAdmin ? 'Support Executive' : 'Customer');

    ticket.messages.push({
      sender: req.user?._id,
      senderType,
      senderName,
      message: message.trim(),
      createdAt: new Date()
    });

    if (isSuperAdmin) {
      if (status) {
        ticket.status = status;
      } else if (ticket.status === 'Open') {
        ticket.status = 'In Progress';
      }
    } else {
      ticket.status = 'In Progress';
    }

    await ticket.save();

    res.json({
      success: true,
      message: 'Reply sent successfully',
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update ticket status, priority, or notes
// @route   PUT /api/support/tickets/:id
// @access  Private (SuperAdmin or Assigned Agent)
const updateTicketStatus = async (req, res, next) => {
  try {
    const { status, priority, resolutionNotes } = req.body;

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (status) ticket.status = status;
    if (priority) ticket.priority = priority;
    if (resolutionNotes) ticket.resolutionNotes = resolutionNotes;

    await ticket.save();

    res.json({
      success: true,
      message: 'Ticket updated successfully',
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete ticket
// @route   DELETE /api/support/tickets/:id
// @access  Private (SuperAdmin)
const deleteTicket = async (req, res, next) => {
  try {
    const isSuperAdmin = req.user?.role?.name === 'SuperAdmin' || req.user?.role === 'SuperAdmin';
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (!isSuperAdmin && String(ticket.user) !== String(req.user?._id)) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this ticket' });
    }

    await SupportTicket.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: 'Support ticket deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  replyTicket,
  updateTicketStatus,
  deleteTicket
};
