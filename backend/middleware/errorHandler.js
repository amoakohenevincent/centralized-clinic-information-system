/**
 * Centralized Error Handling Middleware
 * Provides uniform error structures across all clinical endpoints.
 */
const errorHandler = (err, req, res, next) => {
  console.error('[CCIS-Clinical Error]', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
  });

  // Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_RESOURCE_ID',
        message: `Resource not found with invalid identifier format: ${err.value}`,
      },
    });
  }

  // Mongoose Schema Validation Error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message,
    }));
    return res.status(400).json({
      success: false,
      error: {
        code: 'SCHEMA_VALIDATION_ERROR',
        message: 'Database schema validation constraint failed.',
        details,
      },
    });
  }

  // Duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_RECORD',
        message: `A record with this ${field} already exists.`,
      },
    });
  }

  // Custom Application Error
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected internal server error occurred.',
    },
  });
};

module.exports = errorHandler;

