const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');

const mongoose = require("mongoose");
const app = require("./app");

const PORT = Number(process.env.PORT || 5000);

async function start() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required");

  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  const shutdown = async signal => {
    console.log(`${signal} received. Shutting down...`);
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

start().catch(error => {
  console.error("Server startup failed:", error.message);
  process.exit(1);
});
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
