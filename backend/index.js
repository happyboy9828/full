import { createApp } from "./app.js";
import { connectDBWithRetry } from "./db/db.js";
import config from "./config/env.js";

function startServer() {
  const app = createApp();

  // Vercel (and other PaaS) inject the port via PORT env var; fall back to config.
  const port = Number(process.env.PORT) || config.port;

  const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Welcome: http://localhost:${port}/`);
    console.log(`Health: http://localhost:${port}/health`);
  });

  // Attempt DB connection in the background. If it fails, retry automatically
  // so the server keeps running and the welcome message is always served.
  connectDBWithRetry().catch((error) => {
    console.error("DB connection retry loop exited:", error.message);
  });

  return server;
}

// Local dev / traditional host: start the HTTP server immediately.
// Vercel @vercel/node imports the default export as the request handler,
// so we also export the app factory for that path.
export default startServer;
export { startServer };

// Boot when run directly (npm start / node index.js).
// In ESM, process.argv[1] is the entry file path; compare to this module's URL.
const isDirectRun =
  process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/"));
if (isDirectRun) {
  startServer();
}
