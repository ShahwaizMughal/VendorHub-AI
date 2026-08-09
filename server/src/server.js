const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');

const startServer = async () => {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`VendorHub AI Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = app;