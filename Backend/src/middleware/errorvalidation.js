// Catches 404s for unknown routes
const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

// Centralized error handler - catches errors passed via next(err)
// and errors thrown inside async route handlers wrapped with asyncHandler.
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res
      .status(400)
      .json({ message: 'Validation failed', errors: messages });
  }

  // Mongoose duplicate key error (e.g. duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ message: `${field} already in use` });
  }

  // Mongoose invalid ObjectId
  if (err.name === 'CastError') {
    return res
      .status(400)
      .json({ message: `Invalid ${err.path}: ${err.value}` });
  }

  const statusCode =
    err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;
  res
    .status(statusCode)
    .json({ message: err.message || 'Internal server error' });
};

// Wraps async route handlers so thrown errors are forwarded to errorHandler
// instead of crashing the process or requiring try/catch in every controller.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { notFound, errorHandler, asyncHandler };
