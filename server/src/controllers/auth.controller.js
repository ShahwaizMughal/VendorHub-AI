const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');
const { ROLES } = require('../../../shared/constants');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      email: user.email
    },
    env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );
};

const generateRefreshToken = (user, family) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      family: family
    },
    env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, role, companyName } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'An account with this email address already exists'
        }
      });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenHash = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');

    const user = new User({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      companyName: role === ROLES.VENDOR ? companyName : undefined,
      isVerified: false,
      verificationTokenHash,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    });

    await user.save();

    await sendVerificationEmail(user.email, verificationToken);

    return res.status(201).json({
      success: true,
      data: {
        user: user.toUserPayload()
      },
      meta: {
        message: 'Account created successfully. Please check your email to verify your account.'
      }
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Verification token is required' }
      });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      verificationTokenHash: tokenHash,
      verificationTokenExpiresAt: { $gt: Date.now() }
    }).select('+verificationTokenHash +verificationTokenExpiresAt');

    if (!user) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Verification token is invalid or has expired. Please request a new link.'
        }
      });
    }

    user.isVerified = true;
    user.verificationTokenHash = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        message: 'Email address verified successfully. You may now log in.'
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
      });
    }

    if (user.isDeleted) {
      return res.status(401).json({
        success: false,
        error: { code: 'ACCOUNT_DELETED', message: 'This account has been deactivated or deleted' }
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
      });
    }

    if (user.role === ROLES.VENDOR && !user.isVerified) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNVERIFIED_EMAIL',
          message: 'Your vendor account email is not verified. Please verify your email before logging in.'
        }
      });
    }

    const family = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
    user.refreshTokenFamily = family;
    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user, family);

    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
      success: true,
      data: {
        user: user.toUserPayload(),
        accessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Refresh token cookie missing' }
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    } catch {
      res.clearCookie('refreshToken');
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid or expired refresh token' }
      });
    }

    const user = await User.findById(decoded.sub);
    if (!user || user.isDeleted) {
      res.clearCookie('refreshToken');
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: user?.isDeleted ? 'Account has been deleted' : 'User no longer exists' }
      });
    }

    // Reuse detection logic: if presented family doesn't match current user family -> theft detected!
    if (!user.refreshTokenFamily || user.refreshTokenFamily !== decoded.family) {
      user.refreshTokenFamily = null;
      await user.save();
      res.clearCookie('refreshToken');
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_THEFT_DETECTED',
          message: 'Security warning: Refresh token reuse detected. All sessions invalidated.'
        }
      });
    }

    // Rotate token family
    const newFamily = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
    user.refreshTokenFamily = newFamily;
    await user.save();

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user, newFamily);

    setRefreshTokenCookie(res, newRefreshToken);

    return res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    if (req.user) {
      const user = await User.findById(req.user.id);
      if (user) {
        user.refreshTokenFamily = null;
        await user.save();
      }
    }
    res.clearCookie('refreshToken');
    return res.status(200).json({
      success: true,
      data: {
        message: 'Logged out successfully'
      }
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Return success to avoid email enumeration
      return res.status(200).json({
        success: true,
        data: {
          message: 'If an account exists with this email, a password reset link has been sent.'
        }
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordTokenHash = resetTokenHash;
    user.resetPasswordExpiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    await sendPasswordResetEmail(user.email, resetToken);

    return res.status(200).json({
      success: true,
      data: {
        message: 'If an account exists with this email, a password reset link has been sent.'
      }
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Reset token is required' }
      });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpiresAt: { $gt: Date.now() }
    }).select('+resetPasswordTokenHash +resetPasswordExpiresAt');

    if (!user) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Password reset token is invalid or has expired.'
        }
      });
    }

    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(password, salt);
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpiresAt = undefined;
    user.refreshTokenFamily = null; // Revoke all sessions

    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        message: 'Password reset successfully. You may now log in with your new password.'
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword
};
