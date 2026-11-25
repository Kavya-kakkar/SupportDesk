const express = require('express');
const router = express.Router({ mergeParams: true });
const commentController = require('../controllers/commentController');
const authenticate = require('../middleware/authMiddleware');
const { commentValidator } = require('../validators/ticketValidator');

router.use(authenticate);

router.get('/', commentController.getComments);
router.post('/', commentValidator, commentController.createComment);

module.exports = router;
