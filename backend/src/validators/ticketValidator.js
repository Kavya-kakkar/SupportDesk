const { body, query, validationResult } = require('express-validator');
const { errorResponse } = require('../utils/apiResponse');

const validate = (validations) => {
  return async (req, res, next) => {
    for (let validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return errorResponse(
      res,
      400,
      errors.array()[0].msg,
      errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      }))
    );
  };
};

const createTicketValidator = validate([
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ max: 120 })
    .withMessage('Subject must not exceed 120 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('category')
    .optional()
    .isIn(['technical', 'billing', 'feature', 'api', 'general'])
    .withMessage('Invalid category specified'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority specified'),
]);

const updateTicketValidator = validate([
  body('title')
    .optional()
    .trim()
    .isLength({ max: 120 })
    .withMessage('Subject must not exceed 120 characters'),
  body('description')
    .optional()
    .trim(),
  body('category')
    .optional()
    .isIn(['technical', 'billing', 'feature', 'api', 'general'])
    .withMessage('Invalid category specified'),
]);

const updateStatusValidator = validate([
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['open', 'in_progress', 'resolved', 'closed'])
    .withMessage('Status must be one of: open, in_progress, resolved, closed'),
]);

const updatePriorityValidator = validate([
  body('priority')
    .notEmpty()
    .withMessage('Priority is required')
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent'),
]);

const commentValidator = validate([
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Comment message cannot be empty'),
  body('isInternal')
    .optional()
    .isBoolean()
    .withMessage('isInternal must be a boolean'),
]);

module.exports = {
  createTicketValidator,
  updateTicketValidator,
  updateStatusValidator,
  updatePriorityValidator,
  commentValidator,
};
