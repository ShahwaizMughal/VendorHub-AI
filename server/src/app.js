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

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const env = require('./config/env');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: { status: 'healthy', timestamp: new Date().toISOString() }
  });
});

// Mounted domain routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.url} not found`
    }
  });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
