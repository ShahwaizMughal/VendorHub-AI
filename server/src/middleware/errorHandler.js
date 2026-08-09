function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error?.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: Object.values(error.errors).map(item => item.message),
    });
  }

  if (error?.name === "CastError") {
    return res.status(400).json({ success: false, message: `Invalid ${error.path}` });
  }

  if (error?.code === 11000) {
    return res.status(409).json({ success: false, message: "A resource with the same unique value already exists" });
  }

  const status = Number(error?.statusCode) || 500;
  if (status >= 500) console.error(error);

  return res.status(status).json({
    success: false,
    message: status >= 500 ? "Internal server error" : error.message,
    ...(error.details ? { errors: error.details } : {}),
  });
}
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  
  const response = {
    success: false,
    error: {
      code: err.code || (statusCode === 422 ? 'VALIDATION_ERROR' : 'INTERNAL_SERVER_ERROR'),
      message: err.message || 'An unexpected error occurred',
      ...(err.fields && { fields: err.fields })
    }
  };

  if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
