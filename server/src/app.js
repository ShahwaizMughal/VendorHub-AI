const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const rfqRoutes = require("./routes/rfq.routes");
const quoteRoutes = require("./routes/quote.routes");
const orderRoutes = require("./routes/order.routes");
const errorHandler = require("./middleware/errorHandler");
const eventBus = require("./services/eventBus");
const sharedAiService = require("./services/aiService");

const app = express();

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map(value => value.trim()).filter(Boolean)
  : true;

app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: "draft-8", legacyHeaders: false }));

app.locals.eventBus = eventBus;
app.locals.aiService = sharedAiService;

app.get("/", (req, res) => {
  res.json({ success: true, message: "VendorHub AI API is running" });
});

app.get("/api/health", (req, res) => {
  res.json({ success: true, service: "vendorhub-api", status: "healthy" });
});

app.use("/api/rfqs", rfqRoutes);
app.use("/api/quotes", quoteRoutes);
app.use("/api/orders", orderRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorHandler);

module.exports = app;
