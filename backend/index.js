import { createApp } from "./app.js";
import { connectDBWithRetry } from "./db/db.js";
import config from "./config/env.js";

// Build the Express app once (lazily) so the module is safe to import in any
// environment, including Vercel's @vercel/node runtime which calls the default
// export as a request handler `(req, res) => ...`.
let app = null;
let dbConnectPromise = null;

function ensureApp() {
  if (!app) {
    app = createApp();
    // Kick off the DB connection in the background. It retries forever so the
    // server can still serve health/endpoints while MongoDB is unreachable.
    if (!dbConnectPromise) {
      dbConnectPromise = connectDBWithRetry().catch((error) => {
        console.error("DB connection retry loop exited:", error.message);
      });
    }
  }
  return app;
}

// Vercel @vercel/node calls this as the request handler.
export default function handler(req, res) {
  ensureApp()(req, res);
}

// Local dev / traditional host: start the HTTP server when run directly.
function startServer() {
  const application = ensureApp();
  const port = Number(process.env.PORT) || config.port;
  const server = application.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Welcome: http://localhost:${port}/`);
    console.log(`Health: http://localhost:${port}/health`);
  });
  return server;
}

export { startServer };

// Boot when run directly (npm start / node index.js).
const isDirectRun =
  process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/"));
if (isDirectRun) {
  startServer();
}