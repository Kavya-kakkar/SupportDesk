const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const {
  updateStatusValidator,
  updatePriorityValidator,
} = require('../validators/ticketValidator');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Admin Dashboard & Telemetry
router.get('/dashboard', adminController.getDashboardStats);

// Admin Ticket Management
router.get('/tickets', adminController.getAllTickets);
router.patch('/tickets/:id/status', updateStatusValidator, adminController.updateStatus);
router.patch('/tickets/:id/priority', updatePriorityValidator, adminController.updatePriority);
router.patch('/tickets/:id/assign', adminController.assignTicket);

// Admin Activity Logs
router.get('/activity', adminController.getActivityLogs);

module.exports = router;
