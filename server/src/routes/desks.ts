import { Router } from "express";
import { z } from "zod";

import * as deskController from "../controllers/deskController.js";
import { requireAuth } from "../middleware/auth.js";
import { writeLimiter } from "../middleware/rateLimiter.js";
import { validate } from "../middleware/validate.js";

const router = Router();

// ============================================================
// Schemas
// ============================================================
const inviteSchema = z.object({
  invited_user_id: z.string().uuid(),
  message: z.string().max(300).optional(),
});

const submitDraftSchema = z.object({
  chapter_number: z.number().int().positive(),
  title: z.string().max(120).optional(),
  content: z.string().min(1),
});

const respondInviteSchema = z.object({
  accept: z.boolean(),
});

const idParam = z.object({ deskId: z.string().uuid() });
const inviteIdParam = z.object({ inviteId: z.string().uuid() });
const submissionIdParam = z.object({ submissionId: z.string().uuid() });

// ============================================================
// Desk lifecycle
// ============================================================

// DELETE /api/desks/:deskId — close desk
router.delete(
  "/:deskId",
  requireAuth,
  validate({ params: idParam }),
  deskController.close,
);

// ============================================================
// Invites
// ============================================================

// GET /api/desks/invites — my pending invites
router.get("/invites", requireAuth, deskController.myInvites);

// POST /api/desks/:deskId/invite
router.post(
  "/:deskId/invite",
  requireAuth,
  writeLimiter,
  validate({
    params: idParam,
    body: inviteSchema,
  }),
  deskController.invite,
);

// POST /api/desks/invites/:inviteId/respond
router.post(
  "/invites/:inviteId/respond",
  requireAuth,
  validate({
    params: inviteIdParam,
    body: respondInviteSchema,
  }),
  deskController.respondInvite,
);

// ============================================================
// Submissions
// ============================================================

// POST /api/desks/:deskId/submissions — co-writer submits draft
router.post(
  "/:deskId/submissions",
  requireAuth,
  writeLimiter,
  validate({
    params: idParam,
    body: submitDraftSchema,
  }),
  deskController.submitDraft,
);

// GET /api/desks/:deskId/submissions — owner reviews
router.get(
  "/:deskId/submissions",
  requireAuth,
  validate({ params: idParam }),
  deskController.listSubmissions,
);

// POST /api/desks/submissions/:submissionId/approve
router.post(
  "/submissions/:submissionId/approve",
  requireAuth,
  validate({ params: submissionIdParam }),
  deskController.approveSubmission,
);

// DELETE /api/desks/submissions/:submissionId
router.delete(
  "/submissions/:submissionId",
  requireAuth,
  validate({ params: submissionIdParam }),
  deskController.removeSubmission,
);

export default router;
