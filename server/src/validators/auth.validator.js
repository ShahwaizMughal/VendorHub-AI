const Joi = require('joi');
const { ROLES } = require('../../../shared/constants');

const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
const passwordMessage = 'Password must be at least 8 characters long, contain at least 1 uppercase letter, 1 number, and 1 symbol';

const registerSchema = Joi.object({
  name: Joi.string().min(2).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'any.required': 'Name is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Must be a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().pattern(passwordRegex).required().messages({
    'string.pattern.base': passwordMessage,
    'any.required': 'Password is required'
  }),
  role: Joi.string().valid(ROLES.BUYER, ROLES.VENDOR).required().messages({
    'any.only': 'Role must be either buyer or vendor',
    'any.required': 'Role is required'
  }),
  companyName: Joi.string().trim().when('role', {
    is: ROLES.VENDOR,
    then: Joi.string().trim().min(1).required().messages({
      'string.empty': 'Company name is required for vendor role',
      'any.required': 'Company name is required for vendor role'
    }),
    otherwise: Joi.string().optional().allow('', null)
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Must be a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(1).required().messages({
    'string.empty': 'Password is required',
    'any.required': 'Password is required'
  })
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Must be a valid email address',
    'any.required': 'Email is required'
  })
});

const resetPasswordSchema = Joi.object({
  password: Joi.string().pattern(passwordRegex).required().messages({
    'string.pattern.base': passwordMessage,
    'any.required': 'Password is required'
  })
});

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).optional().messages({
    'string.min': 'Name must be at least 2 characters'
  }),
  companyName: Joi.string().min(1).optional().messages({
    'string.min': 'Company name cannot be empty'
  })
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema
};
