const Rfq = require("../models/Rfq");
const Quote = require("../models/Quote");
const { validateRfqInput } = require("../validators/rfq.validator");
const { rankVendors } = require("../services/vendorMatching.service");
const { generateRfqPdf } = require("../services/pdfService");
const defaultEventBus = require("../services/eventBus");

function userIdOf(req) {
  return req.user.userId || req.user.id || req.user._id;
}

function vendorIdOf(req) {
  return req.user.vendorId || req.user.userId || req.user.id || req.user._id;
}

async function createRfq(req, res, next) {
  try {
    validateRfqInput(req.body);

    const buyerId = userIdOf(req);
    const vendorIds = [...new Set(req.body.vendorIds.map(String))];

    const rfqData = {
      buyerId,
      productId: req.body.productId || null,
      productName: String(req.body.productName).trim(),
      quantity: Number(req.body.quantity),
      materialSpec: String(req.body.materialSpec || "").trim(),
      budget: req.body.budget
        ? {
            min: req.body.budget.min == null ? undefined : Number(req.body.budget.min),
            max: req.body.budget.max == null ? undefined : Number(req.body.budget.max),
            currency: String(req.body.budget.currency || "USD").trim().toUpperCase(),
          }
        : undefined,
      deliveryDate: new Date(req.body.deliveryDate),
      paymentTerms: String(req.body.paymentTerms || "").trim(),
      shippingMethod: String(req.body.shippingMethod || "").trim(),
      attachments: req.body.attachments || [],
      vendorRecipients: vendorIds.map(vendorId => ({ vendorId })),
    };

    const ranked = await rankVendors(rfqData, vendorIds, req.app.locals.aiService);

    const rfq = await Rfq.create({
      ...rfqData,
      matchScores: ranked.map(item => ({
        vendorId: item.vendorId,
        score: Math.max(0, Math.min(100, Number(item.score) || 0)),
        rationale: String(item.rationale || ""),
      })),
    });

    const eventBus = req.app.locals.eventBus || defaultEventBus;
    eventBus.emit("rfq:created", {
      rfqId: rfq._id,
      buyerId: rfq.buyerId,
      vendorIds,
      productName: rfq.productName,
      deliveryDate: rfq.deliveryDate,
    });

    return res.status(201).json({ success: true, data: rfq });
  } catch (error) {
    next(error);
  }
}

async function getRfq(req, res, next) {
  try {
    const rfq = req.rfq || await Rfq.findById(req.params.id).lean();
    if (!rfq) return res.status(404).json({ success: false, message: "RFQ not found" });

    const quotes = await Quote.find({ rfqId: rfq._id }).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: { rfq, quotes } });
  } catch (error) {
    next(error);
  }
}

async function getMatchSuggestions(req, res, next) {
  try {
    const rfq = await Rfq.findOne({ _id: req.params.id, buyerId: userIdOf(req) }).lean();
    if (!rfq) return res.status(404).json({ success: false, message: "RFQ not found" });

    const suggestions = [...(rfq.matchScores || [])].sort((a, b) => b.score - a.score);
    return res.json({ success: true, data: suggestions });
  } catch (error) {
    next(error);
  }
}

async function getRfqPdf(req, res, next) {
  try {
    const rfq = req.rfq || await Rfq.findById(req.params.id).lean();
    if (!rfq) return res.status(404).json({ success: false, message: "RFQ not found" });

    const quotes = await Quote.find({ rfqId: rfq._id }).sort({ createdAt: 1 }).lean();
    const pdf = await generateRfqPdf(rfq, quotes);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="rfq-${rfq._id}.pdf"`,
      "Content-Length": pdf.length,
      "Cache-Control": "private, no-store",
    });

    return res.send(pdf);
  } catch (error) {
    next(error);
  }
}

module.exports = { createRfq, getRfq, getMatchSuggestions, getRfqPdf, userIdOf, vendorIdOf };
