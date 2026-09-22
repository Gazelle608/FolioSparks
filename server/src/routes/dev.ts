/* eslint-disable node/no-process-env */
import { type Request, type Response, Router } from "express";

import { isProduction } from "../config/env.js";
import { supabaseAdmin } from "../config/supabase.js";
import { runClosePollsNow } from "../jobs/closePolls.js";
import { runAudioGeneratorNow } from "../jobs/generateChapterAudio.js";
// ============================================================
// Job triggers
// ============================================================
import { runMonthlySparksGrantNow } from "../jobs/monthlySparkGrant.js";
import { runPublishScheduledNow } from "../jobs/publishScheduledChapters.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { logger } from "../utils/logger.js";

const router = Router();

// ============================================================
// Guard — never mount in production
// ============================================================
if (isProduction) {
  logger.warn("Dev routes requested in production — refusing to mount");
}
else {
  logger.info("Dev routes mounted at /api/dev (dev only)");
}

// ============================================================
// GET /api/dev/ping — sanity check
// ============================================================
router.get("/ping", (_req: Request, res: Response) => {
  res.json({
    ok: true,
    env: isProduction ? "production" : "development",
    time: new Date().toISOString(),
  });
});

// ============================================================
// POST /api/dev/jobs/monthly-sparks
// Manually trigger the monthly Sparks grant
// ============================================================
router.post(
  "/jobs/monthly-sparks",
  asyncHandler(async (_req: Request, res: Response) => {
    const count = await runMonthlySparksGrantNow();
    res.json({ ok: true, processed: count });
  }),
);

// ============================================================
// POST /api/dev/jobs/publish-scheduled
// Manually publish any chapters whose scheduled_for has passed
// ============================================================
router.post(
  "/jobs/publish-scheduled",
  asyncHandler(async (_req: Request, res: Response) => {
    const count = await runPublishScheduledNow();
    res.json({ ok: true, processed: count });
  }),
);

// ============================================================
// POST /api/dev/jobs/close-polls
// Manually close + tally expired polls
// ============================================================
router.post(
  "/jobs/close-polls",
  asyncHandler(async (_req: Request, res: Response) => {
    const count = await runClosePollsNow();
    res.json({ ok: true, processed: count });
  }),
);

// ============================================================
// POST /api/dev/jobs/generate-audio
// Manually run a batch of TTS generation
// ============================================================
router.post(
  "/jobs/generate-audio",
  asyncHandler(async (_req: Request, res: Response) => {
    const count = await runAudioGeneratorNow();
    res.json({ ok: true, processed: count });
  }),
);

// ============================================================
// GET /api/dev/db/stats — quick health of the DB
// ============================================================
router.get(
  "/db/stats",
  asyncHandler(async (_req: Request, res: Response) => {
    const [profiles, stories, chapters, sparks, polls, desks, memberships]
      = await Promise.all([
        supabaseAdmin
          .from("profiles")
          .select("id", { count: "exact", head: true }),
        supabaseAdmin
          .from("stories")
          .select("id", { count: "exact", head: true }),
        supabaseAdmin
          .from("chapters")
          .select("id", { count: "exact", head: true }),
        supabaseAdmin
          .from("spark_ledger")
          .select("id", { count: "exact", head: true }),
        supabaseAdmin
          .from("polls")
          .select("id", { count: "exact", head: true }),
        supabaseAdmin
          .from("desks")
          .select("id", { count: "exact", head: true }),
        supabaseAdmin
          .from("memberships")
          .select("user_id", { count: "exact", head: true }),
      ]);

    res.json({
      ok: true,
      counts: {
        profiles: profiles.count ?? 0,
        stories: stories.count ?? 0,
        chapters: chapters.count ?? 0,
        spark_ledger_entries: sparks.count ?? 0,
        polls: polls.count ?? 0,
        desks: desks.count ?? 0,
        memberships: memberships.count ?? 0,
      },
      time: new Date().toISOString(),
    });
  }),
);

// ============================================================
// GET /api/dev/env — which external services are configured?
// ============================================================
router.get("/env", (_req: Request, res: Response) => {
  res.json({
    ok: true,
    services: {
      supabase: Boolean(
        process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
      ),
      resend: Boolean(process.env.RESEND_API_KEY),
      stripe: Boolean(
        process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET,
      ),
      tts: Boolean(process.env.TTS_API_KEY),
    },
    jobsEnabled: process.env.JOBS_ENABLED === "true",
  });
});

// ============================================================
// GET /api/dev/whoami — inspect the current session
// Useful for testing the auth middleware
// ============================================================
router.get("/whoami", (req: Request, res: Response) => {
  res.json({
    ok: true,
    user: req.user
      ? {
          id: req.user.id,
          email: req.user.email,
          email_confirmed_at: req.user.email_confirmed_at,
        }
      : null,
    hasMembership: Boolean(req.membership),
    membershipTier: req.membership?.tier ?? null,
  });
});

export default router;
