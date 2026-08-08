const User = require('../models/User');
const { uploadAvatar: uploadToCloudinary, deleteImage } = require('../services/cloudinaryService');

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.isDeleted) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' }
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: user.toUserPayload()
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, companyName } = req.body;

    const user = await User.findById(req.user.id);
    if (!user || user.isDeleted) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' }
      });
    }

    if (name !== undefined) user.name = name;
    if (companyName !== undefined && user.role === 'vendor') user.companyName = companyName;

    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        user: user.toUserPayload()
      }
    });
  } catch (error) {
    next(error);
  }
};

const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Avatar image file is required' }
      });
    }

    const user = await User.findById(req.user.id);
    if (!user || user.isDeleted) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' }
      });
    }

    if (user.avatarPublicId) {
      await deleteImage(user.avatarPublicId);
    }

    const uploadResult = await uploadToCloudinary(req.file.buffer, user._id.toString());
    user.avatarUrl = uploadResult.url;
    user.avatarPublicId = uploadResult.publicId;

    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        avatarUrl: user.avatarUrl,
        avatarPublicId: user.avatarPublicId,
        user: user.toUserPayload()
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.isDeleted) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found or already deleted' }
      });
    }

    await user.softDelete();
    res.clearCookie('refreshToken');

    return res.status(200).json({
      success: true,
      data: {
        message: 'Account deactivated successfully'
      }
    });
  } catch (error) {
    next(error);
  }
};

const restoreMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' }
      });
    }

    if (!user.isDeleted) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Account is already active' }
      });
    }

    await user.restore();

    return res.status(200).json({
      success: true,
      data: {
        user: user.toUserPayload(),
        message: 'Account restored successfully'
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMe,
  updateProfile,
  uploadAvatar,
  deleteMe,
  restoreMe
};
