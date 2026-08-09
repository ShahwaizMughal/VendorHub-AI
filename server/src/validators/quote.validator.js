function validateQuoteInput(body = {}) {
  const errors = [];
  const unitPrice = Number(body.unitPrice);
  const totalPrice = Number(body.totalPrice);
  const leadTimeDays = Number(body.leadTimeDays);

  if (!body.rfqId) errors.push("rfqId is required");
  if (!Number.isFinite(unitPrice) || unitPrice < 0) errors.push("unitPrice must be a non-negative number");
  if (!Number.isFinite(totalPrice) || totalPrice < 0) errors.push("totalPrice must be a non-negative number");
  if (!Number.isFinite(leadTimeDays) || leadTimeDays < 0) errors.push("leadTimeDays must be a non-negative number");
  if (!String(body.currency || "").trim()) errors.push("currency is required");
  if (String(body.currency || "").trim().length > 3) errors.push("currency must be a 3-letter code");
  if (String(body.notes || "").length > 5000) errors.push("notes cannot exceed 5000 characters");

  if (errors.length) {
    const error = new Error(errors.join("; "));
    error.statusCode = 400;
    error.details = errors;
    throw error;
  }
}

module.exports = { validateQuoteInput };
