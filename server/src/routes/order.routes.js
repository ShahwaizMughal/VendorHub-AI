const router = require("express").Router();
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const controller = require("../controllers/order.controller");

router.use(authenticate);
router.get("/", authorize("buyer", "vendor"), controller.listOrders);
router.get("/:id", authorize("buyer", "vendor"), controller.getOrder);
router.patch("/:id/status", authorize("buyer", "vendor"), controller.updateStatus);

module.exports = router;
