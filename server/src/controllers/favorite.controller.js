const Favorite = require('../models/Favorite');

// POST /api/favorites/:vendorId - Save or unsave a vendor
exports.toggleFavorite = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const buyerId = req.user.id; // will come from auth middleware later

    const existing = await Favorite.findOne({ buyerId, vendorId });

    if (existing) {
      await Favorite.deleteOne({ _id: existing._id });
      return res.json({ success: true, data: { saved: false } });
    } else {
      const favorite = await Favorite.create({ buyerId, vendorId });
      return res.json({ success: true, data: { saved: true, favorite } });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: { message: 'Server error' } });
  }
};

// GET /api/favorites - List all saved vendors
exports.listFavorites = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const favorites = await Favorite.find({ buyerId }).sort({ createdAt: -1 });
    res.json({ success: true, data: favorites });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: { message: 'Server error' } });
  }
};