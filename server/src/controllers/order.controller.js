const Order = require("../models/Order");
const { updateOrderStatus } = require("../services/order.service");
const defaultEventBus = require("../services/eventBus");

function userIdOf(req) {
  return req.user.userId || req.user.id || req.user._id;
}

function isParty(order, userId) {
  return String(order.buyerId) === String(userId) || String(order.vendorId) === String(userId);
}

async function listOrders(req, res, next) {
  try {
    const userId = userIdOf(req);
    const filter = req.user.role === "vendor" ? { vendorId: userId } : { buyerId: userId };
    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
}

async function getOrder(req, res, next) {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (!isParty(order, userIdOf(req))) return res.status(403).json({ success: false, message: "Forbidden" });
    return res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
}

async function updateStatus(req, res, next) {
  try {
    const status = String(req.body.status || "").trim();
    if (!status) return res.status(400).json({ success: false, message: "status is required" });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (!isParty(order, userIdOf(req))) return res.status(403).json({ success: false, message: "Forbidden" });

    const updated = await updateOrderStatus(
      order,
      status,
      userIdOf(req),
      req.user.role,
      req.body.note || ""
    );

    const eventBus = req.app.locals.eventBus || defaultEventBus;
    eventBus.emit("order:status_changed", {
      orderId: updated._id,
      status: updated.status,
      buyerId: updated.buyerId,
      vendorId: updated.vendorId,
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

module.exports = { listOrders, getOrder, updateStatus };
