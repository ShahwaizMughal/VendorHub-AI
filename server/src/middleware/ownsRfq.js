const mongoose = require("mongoose");
const Rfq = require("../models/Rfq");

async function ownsRfq(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid RFQ id" });
    }

    const rfq = await Rfq.findById(req.params.id);
    if (!rfq) return res.status(404).json({ success: false, message: "RFQ not found" });

    const userId = req.user.userId || req.user.id || req.user._id;
    const vendorId = req.user.vendorId || userId;
    const isBuyer = String(rfq.buyerId) === String(userId);
    const isTargetedVendor = req.user.role === "vendor" && rfq.vendorRecipients.some(
      recipient => String(recipient.vendorId) === String(vendorId)
    );

    if (!isBuyer && !isTargetedVendor) {
      return res.status(403).json({ success: false, message: "You do not have access to this RFQ" });
    }

    req.rfq = rfq;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = ownsRfq;
