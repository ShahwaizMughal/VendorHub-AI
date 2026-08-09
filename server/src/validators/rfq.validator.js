function validationError(messages) {
  const error = new Error(messages.join("; "));
  error.statusCode = 400;
  error.details = messages;
  return error;
}

function validateRfqInput(body = {}) {
  const errors = [];
  const quantity = Number(body.quantity);
  const min = body.budget?.min == null ? null : Number(body.budget.min);
  const max = body.budget?.max == null ? null : Number(body.budget.max);
  const deliveryDate = new Date(body.deliveryDate);

  if (!String(body.productName || "").trim()) errors.push("productName is required");
  if (!Number.isFinite(quantity) || quantity <= 0) errors.push("quantity must be greater than 0");
  if (!body.deliveryDate || Number.isNaN(deliveryDate.getTime()) || deliveryDate <= new Date()) {
    errors.push("deliveryDate must be a valid future date");
  }

  if (min != null && (!Number.isFinite(min) || min < 0)) errors.push("budget.min must be a non-negative number");
  if (max != null && (!Number.isFinite(max) || max < 0)) errors.push("budget.max must be a non-negative number");
  if (min != null && max != null && min > max) errors.push("budget.min must be less than or equal to budget.max");

  if (!Array.isArray(body.vendorIds) || body.vendorIds.length === 0) {
    errors.push("At least one vendor must be selected");
  } else {
    const uniqueVendorIds = new Set(body.vendorIds.map(String));
    if (uniqueVendorIds.size > 10) errors.push("An RFQ can target at most 10 unique vendors");
    if (uniqueVendorIds.size !== body.vendorIds.length) errors.push("vendorIds must not contain duplicates");
  }

  if (body.attachments != null && !Array.isArray(body.attachments)) {
    errors.push("attachments must be an array");
  }

  if (Array.isArray(body.attachments)) {
    if (body.attachments.length > 5) errors.push("Maximum 5 attachments are allowed");

    const totalBytes = body.attachments.reduce((sum, attachment) => sum + Number(attachment?.size || 0), 0);
    if (totalBytes > 15 * 1024 * 1024) errors.push("Total attachment size cannot exceed 15MB");

    for (const attachment of body.attachments) {
      if (!attachment?.name || !attachment?.url || !Number.isFinite(Number(attachment?.size))) {
        errors.push("Each attachment requires name, url and numeric size");
        break;
      }
    }
  }

  if (errors.length) throw validationError(errors);
  return true;
}

module.exports = { validateRfqInput };
