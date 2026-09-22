import { createApp } from "./app.js";
import { env, isProduction } from "./config/env.js";
import { startPollCloser } from "./jobs/closePolls.js";
import { startAudioGenerator } from "./jobs/generateChapterAudio.js";
import { startMonthlySparksGrant } from "./jobs/monthlySparkGrant.js";
import { startScheduledPublisher } from "./jobs/publishScheduledChapters.js";
import { logger } from "./utils/logger.js";

// ============================================================
// Create app
// ============================================================
const app = createApp();

// ============================================================
// Jobs — enabled in production or when JOBS_ENABLED=true
// ============================================================
// eslint-disable-next-line node/no-process-env
const jobsEnabled = process.env.JOBS_ENABLED === "true" || isProduction;

if (jobsEnabled) {
  logger.info("Starting background jobs");
  startMonthlySparksGrant();
  startScheduledPublisher();
  startPollCloser();
  startAudioGenerator();
}
else {
  logger.info("Background jobs disabled (set JOBS_ENABLED=true to enable)");
}

// ============================================================
// Listen
// ============================================================
const server = app.listen(env.PORT, () => {
  logger.info(`FolioSparks server listening`, {
    port: env.PORT,
    env: env.NODE_ENV,
    client: env.CLIENT_URL,
    jobs: jobsEnabled,
  });
});

// ============================================================
// Graceful shutdown
// ============================================================
let shuttingDown = false;

function shutdown(signal: string): void {
  if (shuttingDown)
    return;
  shuttingDown = true;

  logger.info(`${signal} received — shutting down gracefully`);

  // Stop accepting new connections
  server.close((err) => {
    if (err) {
      logger.error("Error while closing server", {
        error: err.message,
      });
      process.exit(1);
    }

    logger.info("Server closed cleanly");
    process.exit(0);
  });

  // Force-kill if shutdown takes >10s
  setTimeout(() => {
    logger.warn("Forcing shutdown after 10s timeout");
    process.exit(1);
  }, 10_000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// ============================================================
// Unhandled errors — log and (in prod) exit
// ============================================================
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", {
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
  });
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception", {
    error: err.message,
    stack: err.stack,
  });
  // In production, we can't trust the process state after an uncaught exception
  if (isProduction) {
    process.exit(1);
  }
});

// Export for tests
export { app };
