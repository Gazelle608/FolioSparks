import type { Request } from "express";

import rateLimit, { type Options } from "express-rate-limit";

// ============================================================
// Shared config
// ============================================================
const baseOptions: Partial<Options> = {
  standardHeaders: true, // Return rate-limit headers (draft-6)
  legacyHeaders: false, // Don't send X-RateLimit-* (deprecated)
  // Use the authenticated user id when available, else IP
  keyGenerator: (req: Request) => {
    return req.user?.id ?? req.ip ?? "unknown";
  },
};

// Consistent JSON error shape
const handler: Options["handler"] = (_req, res) => {
  res.status(429).json({
    error: "Too many requests. Please slow down.",
    code: "RATE_LIMIT",
    retryAfter: res.getHeader("Retry-After"),
  });
};

// ============================================================
// General API — 300 requests / 15 min
// Mount once at /api in app.ts
// ============================================================
export const apiLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  max: 300,
  handler,
});

// ============================================================
// Authentication — 10 attempts / 15 min
// Login, signup, forgot-password, magic-link
// ============================================================
export const authLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true, // only count failures
  handler,
});

// ============================================================
// Email sending — 5 / 15 min
// Forgot-password, magic-link, resend-verification
// ============================================================
export const emailLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  max: 5,
  handler,
});

// ============================================================
// Sparks — 60 / min
// Spending is high-value: prevent hammering
// ============================================================
export const sparkLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 1000,
  max: 60,
  handler,
});

// ============================================================
// Writes — 30 / min
// Creating stories, chapters, polls, invites
// ============================================================
export const writeLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 1000,
  max: 30,
  handler,
});

// ============================================================
// Expensive — 10 / min
// TTS generation, bulk imports, analytics aggregations
// ============================================================
export const expensiveLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 1000,
  max: 10,
  handler,
});

// ============================================================
// Webhooks — loose, but non-zero
// Prevents accidental DDoS from a misbehaving provider
// ============================================================
export const webhookLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 1000,
  max: 300,
  // Webhooks are identified by IP, not user
  keyGenerator: (req: Request) => req.ip ?? "unknown",
  handler,
});
