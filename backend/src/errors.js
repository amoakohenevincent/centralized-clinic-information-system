class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error.name === "ValidationError") {
    const details = Object.values(error.errors).map((item) => ({
      field: item.path,
      message: item.message
    }));
    return res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Invalid request data.", details }
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      error: {
        code: "DUPLICATE_RECORD",
        message: "A record with the supplied unique value already exists."
      }
    });
  }

  const status = error.status || 500;
  if (status >= 500) {
    console.error(error);
  }

  return res.status(status).json({
    error: {
      code: error.code || "INTERNAL_ERROR",
      message: status >= 500 ? "An unexpected error occurred." : error.message,
      ...(error.details ? { details: error.details } : {})
    }
  });
}

module.exports = { ApiError, errorHandler };
