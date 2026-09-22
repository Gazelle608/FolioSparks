import { Router } from "express";
import { z } from "zod";

import * as membershipController from "../controllers/membershipcontroller.js";
import { requireAuth } from "../middleware/auth.js";
import { expensiveLimiter, writeLimiter } from "../middleware/rateLimiter.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const checkoutSchema = z.object({
  tier: z.enum(["spark", "spark_pro"]),
});

// ============================================================
// Routes
// ============================================================

// GET /api/memberships/me
router.get("/me", requireAuth, membershipController.me);

// POST /api/memberships/checkout
router.post(
  "/checkout",
  requireAuth,
  expensiveLimiter,
  validate({ body: checkoutSchema }),
  membershipController.checkout,
);

// POST /api/memberships/portal
router.post(
  "/portal",
  requireAuth,
  expensiveLimiter,
  membershipController.portal,
);

// POST /api/memberships/cancel
router.post("/cancel", requireAuth, writeLimiter, membershipController.cancel);

// POST /api/memberships/resume
router.post("/resume", requireAuth, writeLimiter, membershipController.resume);

export default router;
