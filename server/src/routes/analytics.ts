import { Router } from "express";
import { z } from "zod";

import * as analyticsController from "../controllers/analyticsController.js";
import { requireAuth } from "../middleware/auth.js";
import { expensiveLimiter } from "../middleware/rateLimiter.js";
import {
  loadMembership,
  requireTier,
} from "../middleware/requireMembership.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const storyIdParam = z.object({ storyId: z.string().uuid() });
const daysQuery = z.object({
  days: z.coerce.number().int().min(1).max(90).default(30),
});

// ============================================================
// Author-only analytics — all require Spark Pro
// ============================================================

// GET /api/analytics/me — author dashboard overview
router.get(
  "/me",
  requireAuth,
  loadMembership,
  requireTier("spark_pro"),
  analyticsController.me,
);

// GET /api/analytics/story/:storyId — full story analytics
router.get(
  "/story/:storyId",
  requireAuth,
  loadMembership,
  requireTier("spark_pro"),
  validate({ params: storyIdParam }),
  analyticsController.story,
);

// GET /api/analytics/story/:storyId/sparks
router.get(
  "/story/:storyId/sparks",
  requireAuth,
  loadMembership,
  requireTier("spark_pro"),
  expensiveLimiter,
  validate({
    params: storyIdParam,
    query: daysQuery,
  }),
  analyticsController.sparksSeries,
);

// GET /api/analytics/story/:storyId/chapters
router.get(
  "/story/:storyId/chapters",
  requireAuth,
  loadMembership,
  requireTier("spark_pro"),
  validate({ params: storyIdParam }),
  analyticsController.chapterBreakdown,
);

// GET /api/analytics/donations — click counts for the author
router.get(
  "/donations",
  requireAuth,
  loadMembership,
  requireTier("spark_pro"),
  validate({ query: daysQuery }),
  analyticsController.donationClicks,
);

export default router;
