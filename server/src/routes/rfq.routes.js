const router = require("express").Router();
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const ownsRfq = require("../middleware/ownsRfq");
const rfqController = require("../controllers/rfq.controller");
const quoteController = require("../controllers/quote.controller");

router.use(authenticate);
router.post("/", authorize("buyer"), rfqController.createRfq);
router.get("/:id", ownsRfq, rfqController.getRfq);
router.get("/:id/pdf", ownsRfq, rfqController.getRfqPdf);
router.get("/:id/match-suggestions", authorize("buyer"), rfqController.getMatchSuggestions);
router.get("/:id/quotes", authorize("buyer"), quoteController.listQuotes);

module.exports = router;
