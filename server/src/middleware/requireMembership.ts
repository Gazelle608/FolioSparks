import type { NextFunction, Request, Response } from "express";

import type { Membership } from "../types/database.types.js";

import { supabaseAdmin } from "../config/supabase.js";
import { logger } from "../utils/logger.js";

declare module "express-serve-static-core" {
  interface Request {
    membership?: Membership;
  }
}

// ============================================================
// Tier ranking — used to compare "at least Spark" style checks
// ============================================================
const TIER_RANK: Record<"free" | "spark" | "spark_pro", number> = {
  free: 0,
  spark: 1,
  spark_pro: 2,
};

// ============================================================
// requireTier — factory, returns middleware that blocks below a tier
// Usage: router.get('/x', requireAuth, loadMembership, requireTier('spark'), handler)
// ============================================================
export function requireTier(requiredTier: "spark" | "spark_pro") {
  return (req: Request, res: Response, next: NextFunction) => {
    const current = req.membership?.tier ?? "free";
    const currentRank = TIER_RANK[current as keyof typeof TIER_RANK];
    const requiredRank = TIER_RANK[requiredTier];

    if (currentRank < requiredRank) {
      return res.status(403).json({
        error: `This feature requires the ${label(requiredTier)} tier`,
        code: "TIER_REQUIRED",
        currentTier: current,
        requiredTier,
      });
    }

    return next();
  };
}

// ============================================================
// Helpers
// ============================================================
function label(tier: "spark" | "spark_pro"): string {
  return tier === "spark" ? "Spark" : "Spark Pro";
}

// Synthetic free membership for anonymous / missing-row cases
const FREE_FALLBACK: Membership = {
  user_id: "anonymous",
  tier: "free",
  status: "active",
  stripe_customer_id: null,
  stripe_subscription_id: null,
  current_period_start: null,
  current_period_end: null,
  cancel_at_period_end: false,
  sparks_allowance: 100,
  last_grant_at: null,
  next_grant_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// ============================================================
// loadMembership — attaches req.membership, or a synthetic free row
// Always succeeds. Missing user = free fallback.
// Use this when you want the tier but don't want to block.
// ============================================================
export async function loadMembership(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) {
      // Attach a synthetic free membership for anonymous users
      req.membership = FREE_FALLBACK;
      return next();
    }

    const { data, error } = await supabaseAdmin
      .from("memberships")
      .select("*")
      .eq("user_id", req.user.id)
      .maybeSingle();

    if (error) {
      logger.warn("loadMembership: query failed, defaulting to free", {
        userId: req.user.id,
        error: error.message,
      });
      req.membership = FREE_FALLBACK;
      return next();
    }

    req.membership = data ?? FREE_FALLBACK;
    return next();
  }
  catch (error) {
    logger.error("loadMembership threw", {
      error: error instanceof Error ? error.message : String(error),
    });
    req.membership = FREE_FALLBACK;
    return next();
  }
}
// ============================================================
// Convenience exports — the most common gate combinations
// ============================================================

/** Blocks anyone below Spark */
export const requireSpark = requireTier("spark");

/** Blocks anyone below Spark Pro */
export const requireSparkProTier = requireTier("spark_pro");
