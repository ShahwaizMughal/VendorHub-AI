const cloudinary = require('../config/cloudinary');

const uploadAvatar = async (fileBuffer, userId) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'vendorhub/avatars',
        public_id: `user_${userId}_${Date.now()}`,
        transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }]
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id
        });
      }
    );
    uploadStream.end(fileBuffer);
  });
};

const deleteImage = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(`Failed to delete Cloudinary image ${publicId}:`, error);
  }
};

module.exports = {
  uploadAvatar,
  deleteImage
};
