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
