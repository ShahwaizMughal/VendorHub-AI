const mongoose = require("mongoose");
const Rfq = require("../models/Rfq");
const Quote = require("../models/Quote");
const Order = require("../models/Order");
const { validateQuoteInput } = require("../validators/quote.validator");
const defaultEventBus = require("../services/eventBus");

function userIdOf(req) {
  return req.user.userId || req.user.id || req.user._id;
}

function vendorIdOf(req) {
  return req.user.vendorId || req.user.userId || req.user.id || req.user._id;
}

function httpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function submitQuote(req, res, next) {
  try {
    validateQuoteInput(req.body);

    const vendorId = vendorIdOf(req);
    const rfq = await Rfq.findById(req.body.rfqId);
    if (!rfq) return res.status(404).json({ success: false, message: "RFQ not found" });
    if (rfq.status !== "open") return res.status(409).json({ success: false, message: "RFQ is closed" });

    const recipient = rfq.vendorRecipients.find(item => String(item.vendorId) === String(vendorId));
    if (!recipient) {
      return res.status(403).json({ success: false, message: "This vendor was not invited to the RFQ" });
    }

    const existing = await Quote.findOne({ rfqId: rfq._id, vendorId });
    if (existing?.status === "accepted") {
      return res.status(409).json({ success: false, message: "Accepted quote cannot be revised" });
    }

    const payload = {
      rfqId: rfq._id,
      vendorId,
      unitPrice: Number(req.body.unitPrice),
      totalPrice: Number(req.body.totalPrice),
      currency: String(req.body.currency).trim().toUpperCase(),
      leadTimeDays: Number(req.body.leadTimeDays),
      paymentTerms: String(req.body.paymentTerms || "").trim(),
      shippingMethod: String(req.body.shippingMethod || "").trim(),
      notes: String(req.body.notes || "").trim(),
    };

    let quote;
    if (existing) {
      existing.set(payload);
      existing.revision += 1;
      existing.status = "submitted";
      quote = await existing.save();
    } else {
      try {
        quote = await Quote.create(payload);
      } catch (error) {
        if (error?.code === 11000) {
          return res.status(409).json({ success: false, message: "A quote already exists for this vendor and RFQ" });
        }
        throw error;
      }
    }

    recipient.responseState = "quoted";
    recipient.respondedAt = new Date();
    await rfq.save();

    const eventBus = req.app.locals.eventBus || defaultEventBus;
    eventBus.emit("quote:received", {
      quoteId: quote._id,
      rfqId: rfq._id,
      vendorId,
      buyerId: rfq.buyerId,
      revision: quote.revision,
    });

    return res.status(existing ? 200 : 201).json({ success: true, data: quote });
  } catch (error) {
    next(error);
  }
}

function fallbackRecommendation(quotes) {
  if (!quotes.length) return null;

  const maxPrice = Math.max(...quotes.map(q => Number(q.totalPrice) || 0), 1);
  const maxLead = Math.max(...quotes.map(q => Number(q.leadTimeDays) || 0), 1);

  const comparison = quotes.map(q => {
    const priceScore = 100 - ((Number(q.totalPrice) / maxPrice) * 50);
    const speedScore = 100 - ((Number(q.leadTimeDays) / maxLead) * 50);
    const valueScore = Math.round((priceScore * 0.65) + (speedScore * 0.35));
    return { ...q, valueScore };
  }).sort((a, b) => b.valueScore - a.valueScore);

  const best = comparison[0];
  return {
    quoteId: best._id,
    score: best.valueScore,
    rationale: "Fallback recommendation based on total price (65%) and lead time (35%).",
  };
}

async function listQuotes(req, res, next) {
  try {
    const rfq = await Rfq.findOne({ _id: req.params.id, buyerId: userIdOf(req) }).lean();
    if (!rfq) return res.status(404).json({ success: false, message: "RFQ not found" });

    const quotes = await Quote.find({ rfqId: rfq._id }).sort({ totalPrice: 1, leadTimeDays: 1 }).lean();
    const recommendation = await buildRecommendation(req.app.locals.aiService, rfq, quotes);
    const recommendationById = recommendation?.quoteId ? String(recommendation.quoteId) : null;

    const comparison = quotes.map(quote => ({
      ...quote,
      recommended: recommendationById === String(quote._id),
    }));

    return res.json({ success: true, data: { quotes: comparison, recommendation } });
  } catch (error) {
    next(error);
  }
}

async function buildRecommendation(aiService, rfq, quotes) {
  if (!quotes.length) return null;

  if (aiService?.recommendQuote) {
    try {
      const result = await aiService.recommendQuote({ rfq, quotes });
      if (result?.quoteId) return result;
    } catch (error) {
      console.warn("AI quote recommendation failed; using fallback:", error.message);
    }
  }

  return fallbackRecommendation(quotes);
}

async function acceptQuote(req, res, next) {
  const session = await mongoose.startSession();
  try {
    const buyerId = userIdOf(req);
    let createdOrder;

    await session.withTransaction(async () => {
      const quote = await Quote.findById(req.params.id).session(session);
      if (!quote) throw httpError("Quote not found", 404);
      if (quote.status !== "submitted") throw httpError("Quote cannot be accepted", 409);

      const rfq = await Rfq.findById(quote.rfqId).session(session);
      if (!rfq) throw httpError("RFQ not found", 404);
      if (String(rfq.buyerId) !== String(buyerId)) throw httpError("Forbidden", 403);
      if (rfq.status !== "open") throw httpError("RFQ is already closed", 409);

      const [updatedQuote] = await Quote.findOneAndUpdate(
        { _id: quote._id, status: "submitted" },
        { $set: { status: "accepted" } },
        { new: true, session }
      ).lean();

      if (!updatedQuote) throw httpError("Quote was already processed", 409);

      await Quote.updateMany(
        { rfqId: rfq._id, _id: { $ne: quote._id }, status: "submitted" },
        { $set: { status: "declined" } },
        { session }
      );

      for (const recipient of rfq.vendorRecipients) {
        if (String(recipient.vendorId) === String(quote.vendorId)) {
          recipient.responseState = "quoted";
        } else if (recipient.responseState === "pending") {
          recipient.responseState = "declined";
        }
      }

      rfq.status = "closed";
      await rfq.save({ session });

      try {
        const [order] = await Order.create([{
          rfqId: rfq._id,
          quoteId: quote._id,
          buyerId: rfq.buyerId,
          vendorId: quote.vendorId,
          productName: rfq.productName,
          quantity: rfq.quantity,
          totalPrice: quote.totalPrice,
          currency: quote.currency,
          status: "pending_confirmation",
          statusHistory: [{
            status: "pending_confirmation",
            changedBy: buyerId,
            changedAt: new Date(),
            note: "Order created from accepted quote",
          }],
        }], { session });
        createdOrder = order;
      } catch (error) {
        if (error?.code === 11000) throw httpError("An order already exists for this quote", 409);
        throw error;
      }
    });

    const eventBus = req.app.locals.eventBus || defaultEventBus;
    eventBus.emit("order:created", {
      orderId: createdOrder._id,
      rfqId: createdOrder.rfqId,
      buyerId: createdOrder.buyerId,
      vendorId: createdOrder.vendorId,
    });

    return res.status(201).json({ success: true, data: createdOrder });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
}

module.exports = { submitQuote, listQuotes, acceptQuote };
