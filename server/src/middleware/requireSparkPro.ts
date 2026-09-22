import type { NextFunction, Request, Response } from "express";

import { supabaseAdmin } from "../config/supabase.js";
import { logger } from "../utils/logger.js";

// ============================================================
// requireSparkPro — one call, enforces Spark Pro tier
// Loads membership on the fly if not already attached
// ============================================================
export async function requireSparkPro(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.user) {
    return res.status(401).json({
      error: "Not authenticated",
      code: "UNAUTHORIZED",
    });
  }

  // If another middleware already loaded it, use that
  if (req.membership) {
    return req.membership.tier === "spark_pro" ? next() : deny(res);
  }

  // Otherwise load it now
  try {
    const { data, error } = await supabaseAdmin
      .from("memberships")
      .select("tier, status")
      .eq("user_id", req.user.id)
      .maybeSingle();

    if (error || !data) {
      return deny(res);
    }

    // Only allow active or trialing Spark Pro
    const isActive = data.status === "active" || data.status === "trialing";
    if (data.tier !== "spark_pro" || !isActive) {
      return deny(res);
    }

    return next();
  }
  catch (error) {
    logger.error("requireSparkPro threw", {
      error: error instanceof Error ? error.message : String(error),
    });
    return deny(res);
  }
}

// ============================================================
// Helpers
// ============================================================
function deny(res: Response) {
  return res.status(403).json({
    error: "This feature requires Spark Pro",
    code: "SPARK_PRO_REQUIRED",
    upgradeUrl: "/membership",
  });
}
