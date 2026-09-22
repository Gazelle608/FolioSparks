import cron from "node-cron";

import { supabaseAdmin } from "../config/supabase.js";
import { logger } from "../utils/logger.js";
import { wrapJob } from "./runner.js";

// ============================================================
// Schedule
// ------------------------------------------------------------
// "5 0 1 * *" = minute 5, hour 0, day-of-month 1, every month
// Runs at 00:05 UTC on the 1st — 5 minutes after month rollover so
// any in-flight transactions complete before we grant.
// ============================================================
const SCHEDULE = "5 0 1 * *";

// ============================================================
// Job body
// ============================================================
async function grantMonthlySparks(): Promise<number> {
  const { data, error } = await supabaseAdmin.rpc("grant_monthly_sparks");

  if (error) {
    throw new Error(`grant_monthly_sparks RPC failed: ${error.message}`);
  }

  const granted = typeof data === "number" ? data : 0;

  logger.info("Monthly Sparks granted", { count: granted });
  return granted;
}

// ============================================================
// Starter — call this once at boot
// ============================================================
export function startMonthlySparksGrant(): void {
  cron.schedule(SCHEDULE, () => {
    wrapJob("monthly-sparks-grant", grantMonthlySparks);
  });

  logger.info(`Scheduled: monthly Sparks grant (${SCHEDULE})`);
}

// ============================================================
// Manual trigger — used by admin endpoints and tests
// ============================================================
export async function runMonthlySparksGrantNow(): Promise<number> {
  return grantMonthlySparks();
}
