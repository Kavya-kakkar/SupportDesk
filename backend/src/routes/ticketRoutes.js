const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const commentController = require('../controllers/commentController');
const authenticate = require('../middleware/authMiddleware');
const {
  createTicketValidator,
  updateTicketValidator,
  commentValidator,
} = require('../validators/ticketValidator');

// All ticket routes require authentication
router.use(authenticate);

// Ticket CRUD
router.post('/', createTicketValidator, ticketController.createTicket);
router.get('/', ticketController.getTickets);
router.get('/:id', ticketController.getTicketById);
router.put('/:id', updateTicketValidator, ticketController.updateTicket);
router.delete('/:id', ticketController.deleteTicket);

// Ticket Activity
router.get('/:id/activity', ticketController.getTicketActivity);

// Comments for Ticket
router.get('/:id/comments', commentController.getComments);
router.post('/:id/comments', commentValidator, commentController.createComment);

module.exports = router;
