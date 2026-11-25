const { body, validationResult } = require('express-validator');
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

const registerValidator = validate([
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name must not exceed 100 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('A valid work email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('organization')
    .optional()
    .trim(),
]);

const loginValidator = validate([
  body('email')
    .trim()
    .isEmail()
    .withMessage('A valid work email is required')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
]);

module.exports = {
  registerValidator,
  loginValidator,
};
