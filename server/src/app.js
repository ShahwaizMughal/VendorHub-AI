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
