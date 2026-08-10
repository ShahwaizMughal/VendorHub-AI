const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

favoriteSchema.index({ buyerId: 1, vendorId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);