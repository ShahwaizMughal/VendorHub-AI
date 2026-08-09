const mongoose = require("mongoose");

const quoteSchema = new mongoose.Schema({
  rfqId: { type: mongoose.Schema.Types.ObjectId, ref: "Rfq", required: true, index: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  unitPrice: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true, trim: true, uppercase: true },
  leadTimeDays: { type: Number, required: true, min: 0 },
  paymentTerms: { type: String, default: "" },
  shippingMethod: { type: String, default: "" },
  notes: { type: String, default: "" },
  revision: { type: Number, default: 1, min: 1 },
  status: {
    type: String,
    enum: ["submitted", "accepted", "declined"],
    default: "submitted",
  },
}, { timestamps: true });

quoteSchema.index({ rfqId: 1, vendorId: 1 }, { unique: true });

module.exports = mongoose.models.Quote || mongoose.model("Quote", quoteSchema);
