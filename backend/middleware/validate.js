const { validationResult } = require('express-validator');

/**
 * Validation Middleware
 * Checks express-validator results and returns standard formatted 400 error responses.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Invalid input data. Please verify all required clinical fields.',
        details: formattedErrors,
      },
    });
  }
  next();
};

module.exports = validate;

