const config = require('../config/config');

// Custom Error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (config.environment === 'development') {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message
    });
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      status: 'fail',
      message: message.join(', ')
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      status: 'fail',
      message: `Duplicate value entered for ${field} field`
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      status: 'fail',
      message: `Invalid ${err.path}: ${err.value}`
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      status: 'fail',
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      status: 'fail',
      message: 'Token expired'
    });
  }

  // Log error for debugging in production
  console.error('ERROR 💥', err);

  // Send generic error message
  return res.status(500).json({
    success: false,
    status: 'error',
    message: 'Something went wrong'
  });
};

// Async handler wrapper
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Not found handler
const notFound = (req, res, next) => {
  const error = new AppError(`Not found - ${req.originalUrl}`, 404);
  next(error);
};

// Rate limit error handler
const rateLimitHandler = (req, res) => {
  res.status(429).json({
    success: false,
    status: 'fail',
    message: 'Too many requests, please try again later'
  });
};

// WhatsApp error handler
const whatsAppErrorHandler = (error) => {
  console.error('WhatsApp Error:', error);
  
  if (error.message.includes('disconnected')) {
    return {
      success: false,
      message: 'WhatsApp connection lost. Please scan QR code again.'
    };
  }

  if (error.message.includes('not-authorized')) {
    return {
      success: false,
      message: 'WhatsApp session expired. Please scan QR code again.'
    };
  }

  return {
    success: false,
    message: 'WhatsApp error occurred. Please try again later.'
  };
};

module.exports = {
  AppError,
  errorHandler,
  asyncHandler,
  notFound,
  rateLimitHandler,
  whatsAppErrorHandler
};
