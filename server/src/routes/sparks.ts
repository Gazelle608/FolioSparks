import { Router } from "express";
import { z } from "zod";

import * as sparkController from "../controllers/sparkcontroller.js";
import { requireAuth } from "../middleware/auth.js";
import { sparkLimiter } from "../middleware/rateLimiter.js";
import { validate } from "../middleware/validate.js";

const router = Router();

// ============================================================
// Schemas
// ============================================================
const spendSchema = z.object({
  chapterId: z.string().uuid(),
  amount: z.number().int().min(1).max(10_000),
  note: z.string().max(500).optional(),
});

const ledgerQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  reason: z
    .enum([
      "signup_bonus",
      "monthly_grant",
      "chapter_spark",
      "poll_reward",
      "admin_adjustment",
      "referral_bonus",
    ])
    .optional(),
});

// ============================================================
// Routes
// ============================================================

// GET /api/sparks/balance
router.get("/balance", requireAuth, sparkController.balance);

// GET /api/sparks/ledger
router.get(
  "/ledger",
  requireAuth,
  validate({ query: ledgerQuerySchema }),
  sparkController.ledger,
);

// POST /api/sparks/spend
router.post(
  "/spend",
  requireAuth,
  sparkLimiter,
  validate({ body: spendSchema }),
  sparkController.spend,
);

// GET /api/sparks/chapter/:chapterId
router.get(
  "/chapter/:chapterId",
  validate({ params: z.object({ chapterId: z.string().uuid() }) }),
  sparkController.chapterTotal,
);

// GET /api/sparks/author/:authorId
router.get(
  "/author/:authorId",
  validate({ params: z.object({ authorId: z.string().uuid() }) }),
  sparkController.authorTotal,
);

// GET /api/sparks/received — author dashboard
router.get("/received", requireAuth, sparkController.received);

// GET /api/sparks/sent — reader's giving history
router.get("/sent", requireAuth, sparkController.sent);

export default router;
