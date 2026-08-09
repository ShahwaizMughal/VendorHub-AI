const mongoose = require('mongoose');
const { ROLES, PLANS } = require('../../../shared/constants');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: [true, 'Role is required']
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },
    deletedAt: {
      type: Date,
      default: null
    },
    companyName: {
      type: String,
      trim: true,
      validate: {
        validator: function (val) {
          if (this.role === ROLES.VENDOR) {
            return typeof val === 'string' && val.trim().length > 0;
          }
          return true;
        },
        message: 'Company name is required for vendor role'
      }
    },
    avatarUrl: {
      type: String,
      default: ''
    },
    avatarPublicId: {
      type: String,
      default: ''
    },
    refreshTokenFamily: {
      type: String,
      default: null
    },
    plan: {
      type: String,
      enum: Object.values(PLANS),
      default: PLANS.FREE
    },
    verificationTokenHash: {
      type: String,
      select: false
    },
    verificationTokenExpiresAt: {
      type: Date,
      select: false
    },
    resetPasswordTokenHash: {
      type: String,
      select: false
    },
    resetPasswordExpiresAt: {
      type: Date,
      select: false
    },
    provider: {
      type: String,
      default: null
    },
    providerId: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Method to format user payload securely (excluding passwordHash, tokens)
userSchema.methods.toUserPayload = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    isVerified: this.isVerified,
    isDeleted: this.isDeleted || false,
    deletedAt: this.deletedAt || null,
    companyName: this.companyName || '',
    avatarUrl: this.avatarUrl || '',
    avatarPublicId: this.avatarPublicId || '',
    plan: this.plan,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

userSchema.methods.softDelete = async function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.refreshTokenFamily = null;
  return await this.save();
};

userSchema.methods.restore = async function () {
  this.isDeleted = false;
  this.deletedAt = null;
  return await this.save();
};

module.exports = mongoose.model('User', userSchema);
