import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";

import { env, isProduction } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import devRoutes from "./routes/dev.js";
import routes from "./routes/index.js";
import webhookRoutes from "./routes/webhooks.js";
import { API_LIMITS } from "./utils/constants.js";
import { logger } from "./utils/logger.js";

// ============================================================
// Create app
// ============================================================
export function createApp(): Express {
  const app = express();

  // ==========================================================
  // Trust proxy — required behind Railway/Fly/Render/Vercel
  // So req.ip returns the real client IP, not the LB
  // ==========================================================
  if (isProduction) {
    app.set("trust proxy", 1);
  }

  // ==========================================================
  // Security headers
  // ==========================================================
  app.use(
    helmet({
      contentSecurityPolicy: false, // API only — no HTML served
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );

  // ==========================================================
  // CORS
  // ==========================================================
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow same-origin (no origin) and the configured client URL
        if (!origin)
          return callback(null, true);

        const allowed = [env.CLIENT_URL];

        // In dev, also allow localhost variants
        if (!isProduction) {
          allowed.push("http://localhost:5173");
          allowed.push("http://127.0.0.1:5173");
        }

        if (allowed.includes(origin)) {
          return callback(null, true);
        }

        logger.warn("CORS rejected origin", { origin });
        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );

  // ==========================================================
  // Request logging
  // ==========================================================
  app.use((req, _res, next) => {
    logger.debug(`${req.method} ${req.originalUrl}`, {
      ip: req.ip,
      ua: req.headers["user-agent"],
    });
    next();
  });

  // ==========================================================
  // Body parsing
  // ----------------------------------------------------------
  // Webhooks need the raw body for signature verification, so
  // they get their own parser BEFORE the JSON one.
  // ==========================================================
  app.use(
    "/api/webhooks",
    express.raw({
      type: "application/json",
      limit: API_LIMITS.webhookBodyMaxBytes,
    }),
  );

  app.use(
    express.json({
      limit: API_LIMITS.jsonBodyMaxBytes,
      // In dev, keep the raw string so we can debug malformed JSON
      verify: !isProduction
        ? (req, _res, buf) => {
            (req as { rawBody?: string }).rawBody = buf.toString();
          }
        : undefined,
    }),
  );

  app.use(express.urlencoded({ extended: true }));

  // ==========================================================
  // Webhooks — mounted BEFORE general rate limiter
  // So a misbehaving provider can't exhaust the global budget
  // ==========================================================
  app.use("/api/webhooks", webhookRoutes);

  // ==========================================================
  // Main API — rate limited
  // ==========================================================
  app.use("/api", apiLimiter, routes);

  // ==========================================================
  // Dev-only routes (job triggers, debug endpoints)
  // ==========================================================
  if (!isProduction) {
    app.use("/api/dev", devRoutes);
    logger.info("Dev routes enabled at /api/dev");
  }

  // ==========================================================
  // Root — a friendly ping
  // ==========================================================
  app.get("/", (_req, res) => {
    res.json({
      name: "FolioSparks API",
      version: "0.1.0",
      status: "ok",
      docs: "https://docs.foliosparks.com",
    });
  });

  // ==========================================================
  // 404 + error handlers — MUST be last
  // ==========================================================
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
