const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../validators/authValidator');
const authenticate = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerValidator, authController.register);
router.post('/login', loginValidator, authController.login);

// Protected routes
router.get('/me', authenticate, authController.getMe);

module.exports = router;
