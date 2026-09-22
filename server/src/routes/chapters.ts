import { Router } from "express";
import { z } from "zod";

import * as chapterController from "../controllers/chapterController.js";
import { requireAuth } from "../middleware/auth.js";
import { writeLimiter } from "../middleware/rateLimiter.js";
import { commonSchemas, validate } from "../middleware/validate.js";

const router = Router();

// ============================================================
// Schemas
// ============================================================
const updateChapterSchema = z.object({
  title: z.string().max(120).nullable().optional(),
  content: z.string().min(1).optional(),
  scheduled_for: z.string().datetime().nullable().optional(),
});

const scheduleSchema = z.object({
  scheduled_for: z.string().datetime(),
});

// ============================================================
// Routes
// ============================================================

// PATCH /api/chapters/:id
router.patch(
  "/:id",
  requireAuth,
  writeLimiter,
  validate({
    params: commonSchemas.idParam,
    body: updateChapterSchema,
  }),
  chapterController.update,
);

// POST /api/chapters/:id/publish
router.post(
  "/:id/publish",
  requireAuth,
  writeLimiter,
  validate({ params: commonSchemas.idParam }),
  chapterController.publish,
);

// POST /api/chapters/:id/unpublish
router.post(
  "/:id/unpublish",
  requireAuth,
  validate({ params: commonSchemas.idParam }),
  chapterController.unpublish,
);

// POST /api/chapters/:id/schedule
router.post(
  "/:id/schedule",
  requireAuth,
  validate({
    params: commonSchemas.idParam,
    body: scheduleSchema,
  }),
  chapterController.schedule,
);

// DELETE /api/chapters/:id
router.delete(
  "/:id",
  requireAuth,
  validate({ params: commonSchemas.idParam }),
  chapterController.remove,
);

export default router;
