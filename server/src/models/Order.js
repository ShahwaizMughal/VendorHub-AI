const mongoose = require("mongoose");

const statusEntrySchema = new mongoose.Schema({
  status: String,
  changedBy: mongoose.Schema.Types.ObjectId,
  changedAt: { type: Date, default: Date.now },
  note: String,
}, { _id: false });

const orderSchema = new mongoose.Schema({
  rfqId: { type: mongoose.Schema.Types.ObjectId, ref: "Rfq", required: true, index: true },
  quoteId: { type: mongoose.Schema.Types.ObjectId, ref: "Quote", required: true, unique: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0.000001 },
  totalPrice: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true, uppercase: true },
  status: {
    type: String,
    enum: ["pending_confirmation", "confirmed", "in_production", "shipped", "delivered", "cancelled"],
    default: "pending_confirmation",
    index: true,
  },
  statusHistory: { type: [statusEntrySchema], default: [] },
}, { timestamps: true });

orderSchema.index({ buyerId: 1, createdAt: -1 });
orderSchema.index({ vendorId: 1, createdAt: -1 });

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
