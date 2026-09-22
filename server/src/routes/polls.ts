import { Router } from "express";
import { z } from "zod";

import * as pollController from "../controllers/pollcontroller.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import { expensiveLimiter, writeLimiter } from "../middleware/rateLimiter.js";
import { validate } from "../middleware/validate.js";

const router = Router();

// ============================================================
// Schemas
// ============================================================
const voteSchema = z.object({
  optionId: z.string().uuid(),
});

// ============================================================
// Routes
// ============================================================

// GET /api/polls/:pollId/results
router.get(
  "/:pollId/results",
  optionalAuth,
  validate({ params: z.object({ pollId: z.string().uuid() }) }),
  pollController.results,
);

// POST /api/polls/:pollId/vote
router.post(
  "/:pollId/vote",
  requireAuth,
  writeLimiter,
  validate({
    params: z.object({ pollId: z.string().uuid() }),
    body: voteSchema,
  }),
  pollController.vote,
);

// POST /api/polls/:pollId/close
router.post(
  "/:pollId/close",
  requireAuth,
  expensiveLimiter,
  validate({ params: z.object({ pollId: z.string().uuid() }) }),
  pollController.close,
);

// DELETE /api/polls/:pollId
router.delete(
  "/:pollId",
  requireAuth,
  validate({ params: z.object({ pollId: z.string().uuid() }) }),
  pollController.remove,
);

// ============================================================
// Chapter-scoped: GET /api/polls/chapter/:chapterId
// ============================================================
router.get(
  "/chapter/:chapterId",
  optionalAuth,
  validate({ params: z.object({ chapterId: z.string().uuid() }) }),
  pollController.byChapter,
);

export default router;
