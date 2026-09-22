import cron from "node-cron";

import { supabaseAdmin } from "../config/supabase.js";
import { logger } from "../utils/logger.js";
import { wrapJob } from "./runner.js";

// ============================================================
// Schedule
// ------------------------------------------------------------
// Every 5 minutes. Polls don't need to close to the second — a
// 5-minute delay is fine.
// ============================================================
const SCHEDULE = "*/5 * * * *";

// ============================================================
// Job body
// ============================================================
async function closePolls(): Promise<number> {
  // Count polls that just closed (closed in the last 5 minutes)
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60_000).toISOString();

  const { count: before } = await supabaseAdmin
    .from("polls")
    .select("id", { count: "exact", head: true })
    .eq("status", "open")
    .lt("closes_at", new Date().toISOString());

  // Run the closer
  const { error } = await supabaseAdmin.rpc("close_expired_polls");

  if (error) {
    throw new Error(`close_expired_polls RPC failed: ${error.message}`);
  }

  // Count polls closed in this window for logging
  const { count: closedRecently } = await supabaseAdmin
    .from("polls")
    .select("id", { count: "exact", head: true })
    .eq("status", "closed")
    .gte("updated_at", fiveMinutesAgo);

  const closed = closedRecently ?? 0;
  if (closed > 0) {
    logger.info("Closed expired polls", {
      count: closed,
      dueBefore: before ?? 0,
    });
  }
  return closed;
}

// ============================================================
// Starter
// ============================================================
export function startPollCloser(): void {
  cron.schedule(SCHEDULE, () => {
    wrapJob("close-expired-polls", closePolls);
  });

  logger.info(`Scheduled: close expired polls (${SCHEDULE})`);
}

// ============================================================
// Manual trigger
// ============================================================
export async function runClosePollsNow(): Promise<number> {
  return closePolls();
}
