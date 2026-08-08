const router = require("express").Router();
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const controller = require("../controllers/quote.controller");

router.use(authenticate);
router.post("/", authorize("vendor"), controller.submitQuote);
router.post("/:id/accept", authorize("buyer"), controller.acceptQuote);

module.exports = router;
