import type { NextFunction, Request, Response } from "express";

import { ZodError } from "zod";

import { isProduction } from "../config/env.js";
import { HttpError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

// ============================================================
// notFoundHandler — runs if no route matched
// Mount AFTER all routes, BEFORE errorHandler
// ============================================================
export function notFoundHandler(req: Request, res: Response) {
  return res.status(404).json({
    error: `Route not found: ${req.method} ${req.originalUrl}`,
    code: "NOT_FOUND",
  });
}

// ============================================================
// errorHandler — central error formatter
// Mount LAST in app.ts
// ============================================================
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  // Already sent? Bail.
  if (res.headersSent)
    return;

  // --------------------------------------------------------
  // 1. Our own HTTP errors (thrown as `throw HttpError.badRequest(...)`)
  // --------------------------------------------------------
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: err.message,
      code: err.code ?? "HTTP_ERROR",
      ...(err.fields ? { fields: err.fields } : {}),
    });
  }

  // --------------------------------------------------------
  // 2. Zod validation errors (thrown by validate middleware)
  // --------------------------------------------------------
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Invalid request",
      code: "VALIDATION_ERROR",
      fields: err.flatten().fieldErrors,
    });
  }

  // --------------------------------------------------------
  // 3. Everything else — log full stack, return generic message
  // --------------------------------------------------------
  const message = err instanceof Error ? err.message : "Unknown error";
  const stack = err instanceof Error ? err.stack : undefined;

  logger.error("Unhandled error", {
    method: req.method,
    path: req.originalUrl,
    userId: req.user?.id,
    message,
    stack,
  });

  return res.status(500).json({
    error: isProduction ? "Internal server error" : message,
    code: "INTERNAL",
  });
}
