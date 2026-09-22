import cron from "node-cron";

import { supabaseAdmin } from "../config/supabase.js";
import { logger } from "../utils/logger.js";
import { wrapJob } from "./runner.js";

// ============================================================
// Schedule
// ------------------------------------------------------------
// Every minute. Cheap query — the DB is indexed on
// (scheduled_for) WHERE is_published = false.
// ============================================================
const SCHEDULE = "* * * * *";

// ============================================================
// Job body
// ============================================================
async function publishScheduledChapters(): Promise<number> {
  const { error } = await supabaseAdmin.rpc("publish_scheduled_chapters");

  if (error) {
    throw new Error(`publish_scheduled_chapters RPC failed: ${error.message}`);
  }

  // The RPC doesn't return a count, so we check how many chapters
  // flipped in the last minute for logging purposes only.
  const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();

  const { count } = await supabaseAdmin
    .from("chapters")
    .select("id", { count: "exact", head: true })
    .gte("published_at", oneMinuteAgo)
    .not("scheduled_for", "is", null);

  const published = count ?? 0;
  if (published > 0) {
    logger.info("Published scheduled chapters", { count: published });
  }
  return published;
}

// ============================================================
// Starter
// ============================================================
export function startScheduledPublisher(): void {
  cron.schedule(SCHEDULE, () => {
    wrapJob("publish-scheduled-chapters", publishScheduledChapters);
  });

  logger.info(`Scheduled: publish scheduled chapters (${SCHEDULE})`);
}

// ============================================================
// Manual trigger
// ============================================================
export async function runPublishScheduledNow(): Promise<number> {
  return publishScheduledChapters();
}
