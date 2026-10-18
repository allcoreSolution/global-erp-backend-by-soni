const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  createTicket,
  getTickets,
  getTicketById,
  replyTicket,
  updateTicketStatus,
  deleteTicket
} = require('../controllers/supportTicketController');

router.use(protect);

router.route('/')
  .get(getTickets)
  .post(createTicket);

router.route('/:id')
  .get(getTicketById)
  .put(updateTicketStatus)
  .delete(deleteTicket);

router.route('/:id/reply')
  .post(replyTicket);

module.exports = router;
