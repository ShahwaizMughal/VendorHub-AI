const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');

const env = require('./config/env');
const { generalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const eventBus = require('./services/eventBus');
const sharedAiService = require('./services/aiService');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const rfqRoutes = require('./routes/rfq.routes');
const quoteRoutes = require('./routes/quote.routes');
const orderRoutes = require('./routes/order.routes');
const favoriteRoutes = require('./routes/favorite.routes');
const searchRoutes = require('./routes/search.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();

const allowedOrigins = env.CLIENT_URL
  ? env.CLIENT_URL.split(',').map((value) => value.trim()).filter(Boolean)
  : true;

// --- Security & platform middleware ---
app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(generalLimiter);

if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Shared services, available to any controller via req.app.locals.*
app.locals.eventBus = eventBus;
app.locals.aiService = sharedAiService;

// --- Health checks ---
app.get('/', (req, res) => {
  res.json({ success: true, message: 'VendorHub AI API is running' });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: { status: 'healthy', service: 'vendorhub-api', timestamp: new Date().toISOString() }
  });
});

// --- Domain routes ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rfqs', rfqRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/dashboard', dashboardRoutes);

// --- 404 + centralized error handling (must be last) ---
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.originalUrl} not found` }
  });
});

app.use(errorHandler);

module.exports = app;
