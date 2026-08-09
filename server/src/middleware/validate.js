const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const dataToValidate = req[source] || {};
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const fields = {};
      error.details.forEach((detail) => {
        const fieldName = detail.path.join('.') || 'general';
        fields[fieldName] = detail.message.replace(/"/g, '');
      });

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          fields
        }
      });
    }

    req[source] = value;
    next();
  };
};

module.exports = validate;
