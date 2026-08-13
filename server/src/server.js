require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');

async function start() {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });

  const shutdown = (signal) => {
    console.log(`Received ${signal}, shutting down gracefully...`);
    server.close(() => process.exit(0));
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
