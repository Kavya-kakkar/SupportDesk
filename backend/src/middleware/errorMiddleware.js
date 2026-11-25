const { errorResponse } = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.url}:`, err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((el) => ({
      field: el.path,
      message: el.message,
    }));
    return errorResponse(res, 400, 'Validation failed', errors);
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return errorResponse(
      res,
      400,
      `A record with that ${field} already exists.`
    );
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return errorResponse(res, 400, `Invalid ID format: ${err.value}`);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 401, 'Invalid authentication token.');
  }

  // Default to 500 server error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error occurred.';
  return errorResponse(res, statusCode, message);
};

const notFoundHandler = (req, res) => {
  return errorResponse(
    res,
    404,
    `Cannot ${req.method} ${req.originalUrl} - Route not found.`
  );
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
