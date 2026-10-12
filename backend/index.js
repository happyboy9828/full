import { createApp } from "./app.js";
import { connectDBWithRetry } from "./db/db.js";
import config from "./config/env.js";

async function startServer() {
  try {
    await connectDBWithRetry();
    const app = createApp();
    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
      console.log(`Health: http://localhost:${config.port}/health`);
    });
  } catch (error) {
    console.error("Fatal startup error:", error.message);
    process.exit(1);
  }
}

startServer();
