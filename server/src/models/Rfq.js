const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  url: { type: String, required: true },
  publicId: String,
  size: { type: Number, required: true, min: 0 },
  mimeType: String,
}, { _id: false });

const matchSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, required: true },
  score: { type: Number, min: 0, max: 100, required: true },
  rationale: { type: String, default: "" },
}, { _id: false });

const recipientSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, required: true },
  sentAt: { type: Date, default: Date.now },
  respondedAt: Date,
  responseState: {
    type: String,
    enum: ["pending", "quoted", "declined", "no_response"],
    default: "pending",
  },
}, { _id: false });

const rfqSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  productId: { type: mongoose.Schema.Types.ObjectId, default: null },
  productName: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0.000001 },
  materialSpec: { type: String, default: "", trim: true },
  budget: {
    min: { type: Number, min: 0 },
    max: { type: Number, min: 0 },
    currency: { type: String, default: "USD", trim: true },
  },
  deliveryDate: { type: Date, required: true },
  paymentTerms: { type: String, default: "" },
  shippingMethod: { type: String, default: "" },
  attachments: [attachmentSchema],
  vendorRecipients: [recipientSchema],
  matchScores: [matchSchema],
  status: {
    type: String,
    enum: ["open", "closed", "cancelled"],
    default: "open",
    index: true,
  },
}, { timestamps: true });

rfqSchema.index({ buyerId: 1, createdAt: -1 });
rfqSchema.index({ "vendorRecipients.vendorId": 1, status: 1 });

module.exports = mongoose.models.Rfq || mongoose.model("Rfq", rfqSchema);
