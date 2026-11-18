import { logger } from '../utils/logger.js';

/**
 * 404 Route Not Found Handler
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
}

/**
 * Centralized Global Error Handler
 */
export function errorHandler(err, req, res, next) {
  // Log detailed error internally
  logger.error(err.message || 'Internal Server Error', {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id
  });

  const statusCode = err.statusCode || (err.name === 'ValidationError' ? 400 : 500);

  // Return clean, safe error payload (never leak internal stack trace in production)
  res.status(statusCode).json({
    success: false,
    error: err.isOperational ? err.message : (process.env.NODE_ENV === 'production' ? 'An unexpected server error occurred.' : err.message),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}
