const transitions = Object.freeze({
  pending_confirmation: ["confirmed", "cancelled"],
  confirmed: ["in_production", "cancelled"],
  in_production: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
});

function canTransition(from, to) {
  return Boolean(transitions[from]?.includes(to));
}

function roleCanAdvance(role, from, to) {
  if (to === "cancelled") {
    return from !== "delivered" && ["buyer", "vendor"].includes(role);
  }

  if (from === "pending_confirmation" && to === "confirmed") return role === "vendor";
  if (from === "confirmed" && to === "in_production") return role === "vendor";
  if (from === "in_production" && to === "shipped") return role === "vendor";
  if (from === "shipped" && to === "delivered") return role === "buyer";

  return false;
}

async function updateOrderStatus(order, status, userId, role, note = "") {
  if (!canTransition(order.status, status)) {
    const error = new Error(`Invalid status transition: ${order.status} -> ${status}`);
    error.statusCode = 409;
    throw error;
  }

  if (!roleCanAdvance(role, order.status, status)) {
    const error = new Error("Your role cannot perform this status transition");
    error.statusCode = 403;
    throw error;
  }

  order.status = status;
  order.statusHistory.push({
    status,
    changedBy: userId,
    changedAt: new Date(),
    note: String(note).slice(0, 1000),
  });

  return order.save();
}

module.exports = { transitions, canTransition, roleCanAdvance, updateOrderStatus };
