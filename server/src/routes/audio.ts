import { Router } from "express";
import { z } from "zod";

import * as audioController from "../controllers/audiocontroller.js";
import { requireAuth } from "../middleware/auth.js";
import { expensiveLimiter } from "../middleware/rateLimiter.js";
import {
  loadMembership,
  requireTier,
} from "../middleware/requiremembership.js";
import { requireSparkPro } from "../middleware/requireSparkPro.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const chapterIdParam = z.object({ chapterId: z.string().uuid() });

// ============================================================
// Streaming — Spark tier and above
// ============================================================

// GET /api/audio/:chapterId/stream
router.get(
  "/:chapterId/stream",
  requireAuth,
  loadMembership,
  requireTier("spark"),
  validate({ params: chapterIdParam }),
  audioController.stream,
);

// ============================================================
// MP3 download — Spark Pro only
// ============================================================

// GET /api/audio/:chapterId/download
router.get(
  "/:chapterId/download",
  requireAuth,
  requireSparkPro,
  validate({ params: chapterIdParam }),
  audioController.download,
);

// ============================================================
// Author tools — Spark Pro only (only Pro authors can generate)
// ============================================================

// POST /api/audio/:chapterId/generate
router.post(
  "/:chapterId/generate",
  requireAuth,
  requireSparkPro,
  expensiveLimiter,
  validate({ params: chapterIdParam }),
  audioController.generate,
);

// GET /api/audio/:chapterId/status
router.get(
  "/:chapterId/status",
  requireAuth,
  validate({ params: chapterIdParam }),
  audioController.status,
);

export default router;
