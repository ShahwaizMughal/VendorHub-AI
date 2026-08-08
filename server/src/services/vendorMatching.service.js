const mongoose = require("mongoose");

function toObjectIds(ids) {
  return ids.filter(id => mongoose.isValidObjectId(id)).map(id => new mongoose.Types.ObjectId(id));
}

async function getVendorDocuments(vendorIds = []) {
  const ids = toObjectIds(vendorIds);
  if (!ids.length || !mongoose.connection.db) return [];

  return mongoose.connection.db.collection("vendors").find({
    _id: { $in: ids },
    verificationStatus: "verified",
  }).toArray();
}

function fallbackScore(vendor, rfq) {
  let score = 0;
  const reasons = [];
  const text = JSON.stringify(vendor).toLowerCase();
  const product = String(rfq.productName || "").toLowerCase();

  if (product && text.includes(product)) {
    score += 25;
    reasons.push("product/category relevance");
  }

  const rating = Number(vendor.rating ?? vendor.averageRating ?? vendor.reviewScore ?? 0);
  if (rating > 0) {
    score += Math.min(20, (rating / 5) * 20);
    reasons.push("review rating");
  }

  if (vendor.capacity != null) {
    score += 15;
    reasons.push("available capacity data");
  }

  if (Array.isArray(vendor.certifications) && vendor.certifications.length) {
    score += 15;
    reasons.push("certifications");
  }

  if (vendor.location && rfq.shippingMethod) {
    score += 10;
    reasons.push("location/shipping information");
  }

  if (vendor.pastPerformance || vendor.performanceScore) {
    score += 15;
    reasons.push("past performance");
  }

  return {
    vendorId: vendor._id,
    score: Math.max(0, Math.min(100, Math.round(score))),
    rationale: reasons.length
      ? `Fallback match based on ${reasons.join(", ")}.`
      : "Fallback match because no detailed vendor signals were available.",
  };
}

async function rankVendors(rfq, vendorIds, aiService) {
  const vendors = await getVendorDocuments(vendorIds);

  if (aiService?.rankVendors) {
    try {
      const result = await aiService.rankVendors({
        rfq,
        vendors,
        criteria: [
          "price",
          "quality",
          "delivery",
          "reviews",
          "location",
          "capacity",
          "certifications",
          "past-performance",
        ],
      });
      if (Array.isArray(result)) return result;
    } catch (error) {
      console.warn("AI vendor matching failed; using fallback ranking:", error.message);
    }
  }

  return vendors.map(vendor => fallbackScore(vendor, rfq)).sort((a, b) => b.score - a.score);
}

module.exports = { rankVendors, getVendorDocuments };
