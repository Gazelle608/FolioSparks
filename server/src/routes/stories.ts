import { Router } from "express";
import { z } from "zod";

import * as chapterController from "../controllers/chaptercontroller.js";
import * as deskController from "../controllers/deskcontroller.js";
import * as pollController from "../controllers/pollcontroller.js";
import * as storyController from "../controllers/storycontroller.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import { expensiveLimiter, writeLimiter } from "../middleware/rateLimiter.js";
import {
  loadMembership,
  requireTier,
} from "../middleware/requiremembership.js";
import { commonSchemas, validate } from "../middleware/validate.js";

const router = Router();

// ============================================================
// Schemas
// ============================================================
const listQuerySchema = z.object({
  genre: z.string().optional(),
  tag: z.string().optional(),
  status: z
    .enum(["draft", "ongoing", "hiatus", "completed", "cancelled"])
    .optional(),
  search: z.string().max(120).optional(),
  limit: z.coerce.number().int().min(1).max(48).default(24),
  offset: z.coerce.number().int().min(0).default(0),
  orderBy: z
    .enum(["published_at", "spark_count", "read_count", "updated_at"])
    .default("published_at"),
});

const createStorySchema = z.object({
  title: z.string().min(2).max(200),
  slug: z.string().regex(/^[a-z0-9-]{3,120}$/),
  synopsis: z.string().max(1000).optional(),
  cover_url: z.string().url().optional().nullable(),
  genre: z.string().min(1),
  tags: z.array(z.string()).max(15).optional(),
  content_rating: z.enum(["general", "teen", "mature"]).optional(),
  language: z.string().min(2).max(5).default("en"),
  publish_mode: z.enum(["full_manuscript", "chapter_by_chapter"]).optional(),
  allows_polls: z.boolean().optional(),
  allows_sparks: z.boolean().optional(),
  is_open_desk: z.boolean().optional(),
  is_donation_enabled: z.boolean().optional(),
});

const updateStorySchema = createStorySchema.partial().extend({
  status: z
    .enum(["draft", "ongoing", "hiatus", "completed", "cancelled"])
    .optional(),
});

const createChapterSchema = z.object({
  chapter_number: z.number().int().positive(),
  title: z.string().max(120).optional(),
  content: z.string().min(1),
  is_published: z.boolean().optional(),
  scheduled_for: z.string().datetime().optional(),
});

const bulkChaptersSchema = z.object({
  chapters: z
    .array(
      z.object({
        chapter_number: z.number().int().positive(),
        title: z.string().max(120).optional(),
        content: z.string().min(1),
      }),
    )
    .min(1)
    .max(500),
  publishNow: z.boolean().default(false),
});

// ============================================================
// Public list + search
// ============================================================

// GET /api/stories
router.get("/", validate({ query: listQuerySchema }), storyController.list);

// GET /api/stories/burning
router.get("/burning", storyController.burning);

// GET /api/stories/mine — author's own stories (incl. drafts)
router.get("/mine", requireAuth, storyController.mine);

// GET /api/stories/author/:authorId — public author view
router.get(
  "/author/:authorId",
  validate({ params: z.object({ authorId: z.string().uuid() }) }),
  storyController.byAuthor,
);

// ============================================================
// Story CRUD
// ============================================================

// GET /api/stories/id/:id — author draft access
router.get(
  "/id/:id",
  optionalAuth,
  validate({ params: commonSchemas.idParam }),
  storyController.getById,
);

// GET /api/stories/:slug
router.get("/:slug", storyController.getBySlug);

// POST /api/stories
router.post(
  "/",
  requireAuth,
  writeLimiter,
  validate({ body: createStorySchema }),
  storyController.create,
);

// PATCH /api/stories/:id
router.patch(
  "/:id",
  requireAuth,
  writeLimiter,
  validate({
    params: commonSchemas.idParam,
    body: updateStorySchema,
  }),
  storyController.update,
);

// POST /api/stories/:id/publish
router.post(
  "/:id/publish",
  requireAuth,
  writeLimiter,
  validate({ params: commonSchemas.idParam }),
  storyController.publish,
);

// DELETE /api/stories/:id
router.delete(
  "/:id",
  requireAuth,
  validate({ params: commonSchemas.idParam }),
  storyController.remove,
);

// ============================================================
// Nested: chapters under stories
// ============================================================

// GET /api/stories/:storyId/chapters
router.get(
  "/:storyId/chapters",
  optionalAuth,
  validate({ params: commonSchemas.storyIdParam }),
  chapterController.listByStory,
);

// GET /api/stories/:storyId/chapters/:num
router.get(
  "/:storyId/chapters/:num",
  optionalAuth,
  validate({
    params: z.object({
      storyId: z.string().uuid(),
      num: z.coerce.number().int().positive(),
    }),
  }),
  chapterController.getByNumber,
);

// POST /api/stories/:storyId/chapters
router.post(
  "/:storyId/chapters",
  requireAuth,
  writeLimiter,
  validate({
    params: commonSchemas.storyIdParam,
    body: createChapterSchema,
  }),
  chapterController.create,
);

// POST /api/stories/:storyId/chapters/bulk
router.post(
  "/:storyId/chapters/bulk",
  requireAuth,
  expensiveLimiter,
  validate({
    params: commonSchemas.storyIdParam,
    body: bulkChaptersSchema,
  }),
  chapterController.bulkCreate,
);

// ============================================================
// Nested: polls under stories
// ============================================================

// GET /api/stories/:storyId/polls
router.get(
  "/:storyId/polls",
  validate({ params: commonSchemas.storyIdParam }),
  pollController.listByStory,
);

// POST /api/stories/:storyId/polls
router.post(
  "/:storyId/polls",
  requireAuth,
  loadMembership,
  requireTier("spark_pro"), // polls are Pro-only
  writeLimiter,
  validate({ params: commonSchemas.storyIdParam }),
  pollController.create,
);

// ============================================================
// Nested: desk under stories
// ============================================================

// GET /api/stories/:storyId/desk
router.get(
  "/:storyId/desk",
  validate({ params: commonSchemas.storyIdParam }),
  deskController.byStory,
);

// POST /api/stories/:storyId/desk
router.post(
  "/:storyId/desk",
  requireAuth,
  loadMembership,
  requireTier("spark_pro"), // co-writing desks are Pro-only
  writeLimiter,
  validate({ params: commonSchemas.storyIdParam }),
  deskController.open,
);

export default router;
