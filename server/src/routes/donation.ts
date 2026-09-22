import { Router } from "express";
import { z } from "zod";

import * as donationController from "../controllers/donationcontroller.js";
import { requireAuth } from "../middleware/auth.js";
import { writeLimiter } from "../middleware/rateLimiter.js";
import { validate } from "../middleware/validate.js";

const router = Router();

// ============================================================
// Schemas
// ============================================================
const platformEnum = z.enum([
  "patreon",
  "ko_fi",
  "buymeacoffee",
  "paypal",
  "stripe",
  "cashapp",
  "venmo",
  "custom",
]);

const createLinkSchema = z.object({
  platform: platformEnum,
  url: z.string().url(),
  label: z.string().max(60).optional(),
  is_primary: z.boolean().optional(),
  display_order: z.number().int().min(0).optional(),
});

const updateLinkSchema = createLinkSchema.partial().extend({
  is_active: z.boolean().optional(),
});

const trackClickSchema = z.object({
  author_id: z.string().uuid(),
  platform: z.string().min(1).max(32),
});

// ============================================================
// Routes
// ============================================================

// GET /api/donations/author/:authorId — public, lists active links
router.get(
  "/author/:authorId",
  validate({ params: z.object({ authorId: z.string().uuid() }) }),
  donationController.byAuthor,
);

// POST /api/donations — create a link for the signed-in author
router.post(
  "/",
  requireAuth,
  writeLimiter,
  validate({ body: createLinkSchema }),
  donationController.create,
);

// PATCH /api/donations/:linkId
router.patch(
  "/:linkId",
  requireAuth,
  writeLimiter,
  validate({
    params: z.object({ linkId: z.string().uuid() }),
    body: updateLinkSchema,
  }),
  donationController.update,
);

// DELETE /api/donations/:linkId
router.delete(
  "/:linkId",
  requireAuth,
  validate({ params: z.object({ linkId: z.string().uuid() }) }),
  donationController.remove,
);

// POST /api/donations/track — fire-and-forget click tracking
router.post(
  "/track",
  validate({ body: trackClickSchema }),
  donationController.trackClick,
);

export default router;
