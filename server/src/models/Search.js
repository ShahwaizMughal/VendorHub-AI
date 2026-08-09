const mongoose = require('mongoose');

const searchSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  query: {
    type: String,
    required: true
  },
  filters: {
    type: Object,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Search', searchSchema);