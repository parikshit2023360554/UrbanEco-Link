/**
 * Global Centralized Error Handling Middleware
 * Catches all uncaught exceptions, operational errors, and PostgreSQL specific errors.
 * Returns consistent JSON response: { success: false, error: "Error Message" }
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || res.statusCode || 500;
  if (statusCode === 200) statusCode = 500; // Reset to 500 if unhandled error reached 200

  let message = err.message || 'Internal Server Error';

  // 1. PostgreSQL Specific Database Error Codes
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique Violation (e.g., duplicate email)
        statusCode = 400;
        message = `Duplicate field value entered: ${err.detail || 'Record already exists.'}`;
        break;
      case '23503': // Foreign Key Constraint Violation
        statusCode = 400;
        message = `Referenced entity not found: ${err.detail || 'Invalid reference key.'}`;
        break;
      case '22P02': // Invalid Text Representation (e.g., UUID/integer format mismatch)
        statusCode = 400;
        message = 'Invalid data type or input format supplied to query.';
        break;
      case 'XX000': // PostGIS Internal Exception
      case '38000':
        statusCode = 400;
        message = 'PostGIS spatial calculation error. Verify geometry coordinates.';
        break;
      case '42703': // Undefined Column
        statusCode = 500;
        message = 'Database schema mismatch. Required column missing.';
        break;
      default:
        if (err.code.startsWith('23')) {
          statusCode = 400;
          message = 'Database constraint violation.';
        }
        break;
    }
  }

  // 2. JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authorization token.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authorization token has expired. Please login again.';
  }

  // Log full stack trace in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    console.error('🔥 Error Handler Caught:', {
      name: err.name,
      code: err.code,
      message: err.message,
      stack: err.stack,
    });
  } else {
    console.error(`❌ [${new Date().toISOString()}] Error ${statusCode}: ${message}`);
  }

  return res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 Not Found Middleware Handler
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};
