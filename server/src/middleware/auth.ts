import type { NextFunction, Request, Response } from "express";

import { supabaseAdmin } from "../config/supabase.js";
import { logger } from "../utils/logger.js";

// ============================================================
// requireAuth — a valid Bearer token is mandatory
// ============================================================
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Missing or invalid Authorization header",
        code: "UNAUTHORIZED",
      });
    }

    const token = header.slice("Bearer ".length).trim();
    if (!token) {
      return res.status(401).json({
        error: "Empty bearer token",
        code: "UNAUTHORIZED",
      });
    }

    // Verify with Supabase. This is one network call per protected request.
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({
        error: "Invalid or expired token",
        code: "UNAUTHORIZED",
      });
    }

    req.user = {
      id: data.user.id,
      email: data.user.email ?? null,
      email_confirmed_at: data.user.email_confirmed_at ?? null,
    };
    return next();
  }
  catch (error) {
    logger.error("requireAuth threw", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({
      error: "Authentication failed",
      code: "AUTH_FAILURE",
    });
  }
}

// ============================================================
// optionalAuth — attach req.user when possible, otherwise pass
// Use on routes that behave differently for signed-in users
// (e.g. chapter read gate, public story fetch)
// ============================================================
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      return next();
    }

    const token = header.slice("Bearer ".length).trim();
    if (!token)
      return next();

    const { data } = await supabaseAdmin.auth.getUser(token);

    if (data?.user) {
      req.user = {
        id: data.user.id,
        email: data.user.email ?? null,
        email_confirmed_at: data.user.email_confirmed_at ?? null,
      };
    }
  }
  catch {
    // Swallow — treat as anonymous
  }

  return next();
}

// ============================================================
// requireEmailVerified — user must have confirmed their email
// Use on sensitive actions if you want to gate them
// ============================================================
export async function requireEmailVerified(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.user) {
    return res
      .status(401)
      .json({ error: "Not authenticated", code: "UNAUTHORIZED" });
  }

  if (!req.user.email_confirmed_at) {
    return res.status(403).json({
      error: "Please verify your email first",
      code: "EMAIL_NOT_VERIFIED",
    });
  }

  return next();
}
