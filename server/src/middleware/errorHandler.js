const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  // Mongoose validation error -> map to the standard fields envelope.
  if (err?.name === 'ValidationError' && err.errors) {
    const fields = {};
    Object.values(err.errors).forEach((item) => {
      fields[item.path] = item.message;
    });
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Validation failed', fields }
    });
  }

  // Mongoose bad ObjectId
  if (err?.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: `Invalid ${err.path}` }
    });
  }

  // Mongo duplicate key
  if (err?.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT',
        message: `A record with this ${field} already exists`,
        fields: { [field]: 'Already in use' }
      }
    });
  }

  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);

  const response = {
    success: false,
    error: {
      code: err.code || (statusCode === 422 ? 'VALIDATION_ERROR' : 'INTERNAL_SERVER_ERROR'),
      message: statusCode >= 500 && process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : (err.message || 'An unexpected error occurred'),
      ...(err.fields && { fields: err.fields })
    }
  };

  if (statusCode >= 500) {
    console.error(err);
  }

  if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
