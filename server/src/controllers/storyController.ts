import type { Request, Response } from "express";

import { z } from "zod";

import { supabaseAdmin } from "../config/supabase.js";
import * as storyService from "../services/storyService.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { HttpError } from "../utils/errors.js";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
        email: any; id: string 
};
  }
}

// ============================================================
// Schemas
// ============================================================
const listQuerySchema = z.object({
  genre: z.string().optional(),
  tag: z.string().optional(),
  status: z
    .enum(["draft", "ongoing", "hiatus", "completed", "cancelled"])
    .optional(),
  search: z.string().optional(),
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
  cover_url: z.string().optional().nullable(),
  genre: z.string().min(1),
  tags: z.array(z.string()).max(15).optional(),
  content_rating: z.enum(["general", "teen", "mature"]).optional(),
  language: z.string().default("en"),
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
  published_at: z.string().optional(),
});

// ============================================================
// GET /api/stories
// ============================================================
export const list = asyncHandler(async (req: Request, res: Response) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success)
    throw HttpError.badRequest("Invalid query");

  const stories = await storyService.list(parsed.data);
  return res.json({ stories });
});

// ============================================================
// GET /api/stories/burning — top by spark_count
// ============================================================
export const burning = asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 6, 24);
  const stories = await storyService.burningNow(limit);
  return res.json({ stories });
});

// ============================================================
// GET /api/stories/:slug
// ============================================================
export const getBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;
  const story = await storyService.getBySlug(slug!);
  if (!story)
    throw HttpError.notFound("Story not found");
  return res.json({ story });
});

// ============================================================
// GET /api/stories/id/:id — author"s own draft access
// ============================================================
export const getById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const story = await storyService.getById(id!);
  if (!story)
    throw HttpError.notFound("Story not found");

  // If the story is a draft, only the author can see it
  if (story.status === "draft") {
    if (!req.user || req.user.id !== story.author_id) {
      throw HttpError.forbidden("Not your draft");
    }
  }
  return res.json({ story });
});

// ============================================================
// POST /api/stories
// ============================================================
export const create = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw HttpError.unauthorized();

  const parsed = createStorySchema.safeParse(req.body);
  if (!parsed.success) {
    throw HttpError.badRequest(
      "Invalid input",
      parsed.error.flatten().fieldErrors as Record<string, string>,
    );
  }

  // Confirm the user is an author
  const { data: author } = await supabaseAdmin
    .from("authors")
    .select("id")
    .eq("id", req.user.id)
    .maybeSingle();

  if (!author) {
    throw HttpError.forbidden("Set up your author profile first");
  }

  const story = await storyService.create({
    ...parsed.data,
    author_id: req.user.id,
  });

  return res.status(201).json({ story });
});

// ============================================================
// PATCH /api/stories/:id
// ============================================================
export const update = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw HttpError.unauthorized();

  const parsed = updateStorySchema.safeParse(req.body);
  if (!parsed.success)
    throw HttpError.badRequest("Invalid input");

  const story = await storyService.getById(req.params.id!);
  if (!story)
    throw HttpError.notFound("Story not found");
  if (story.author_id !== req.user.id)
    throw HttpError.forbidden();

  const updated = await storyService.update(req.params.id!, parsed.data);
  return res.json({ story: updated });
});

// ============================================================
// POST /api/stories/:id/publish
// ============================================================
export const publish = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw HttpError.unauthorized();

  const story = await storyService.getById(req.params.id!);
  if (!story)
    throw HttpError.notFound("Story not found");
  if (story.author_id !== req.user.id)
    throw HttpError.forbidden();

  const updated = await storyService.publish(req.params.id!);
  return res.json({ story: updated });
});

// ============================================================
// DELETE /api/stories/:id
// ============================================================
export const remove = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw HttpError.unauthorized();

  const story = await storyService.getById(req.params.id!);
  if (!story)
    throw HttpError.notFound("Story not found");
  if (story.author_id !== req.user.id)
    throw HttpError.forbidden();

  await storyService.remove(req.params.id!);
  return res.status(204).send();
});

// ============================================================
// GET /api/stories/mine — author"s own stories (incl. drafts)
// ============================================================
export const mine = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw HttpError.unauthorized();

  const stories = await storyService.listByAuthor(req.user.id, true);
  return res.json({ stories });
});

// ============================================================
// GET /api/stories/author/:authorId — public author view
// ============================================================
export const byAuthor = asyncHandler(async (req: Request, res: Response) => {
  const stories = await storyService.listByAuthor(req.params.authorId!, false);
  return res.json({ stories });
});
