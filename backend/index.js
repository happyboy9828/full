import { createApp } from "./app.js";
import { connectDB } from "./db/db.js";
import config from "./config/env.js";
import logger from "./utils/logger.js";

async function startServer() {
  try {
    await connectDB();
    const app = createApp();
    app.listen(config.port, () => {
      logger.info("server_started", {
        port: config.port,
        env: config.nodeEnv,
      });
      console.log(`Server is running on port ${config.port}`);
      console.log(`Welcome: http://localhost:${config.port}/`);
      console.log(`Health: http://localhost:${config.port}/health`);
      console.log(`Status: http://localhost:${config.port}/status`);
      console.log(`Analytics Health: http://localhost:${config.port}/api/analytics/health`);
    });
  } catch (error) {
    logger.error("fatal_startup_error", { error: error.message });
    process.exit(1);
  }
}

startServer();
