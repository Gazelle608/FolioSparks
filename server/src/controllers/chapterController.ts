import type { Request, Response } from "express";

import { z } from "zod";

import * as chapterService from "../services/chapterservice.js";
import * as storyService from "../services/storyservice.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { HttpError } from "../utils/errors.js";

// ============================================================
// Constants
// ============================================================
const PUBLIC_CHAPTER_LIMIT = 3;

// ============================================================
// Schemas
// ============================================================
const createChapterSchema = z.object({
  chapter_number: z.number().int().positive(),
  title: z.string().max(120).optional(),
  content: z.string().min(1),
  is_published: z.boolean().optional(),
  scheduled_for: z.string().datetime().optional(),
});

const bulkCreateSchema = z.object({
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

const updateChapterSchema = z.object({
  title: z.string().max(120).optional().nullable(),
  content: z.string().min(1).optional(),
  scheduled_for: z.string().datetime().nullable().optional(),
});

// ============================================================
// GET /api/stories/:storyId/chapters
// ============================================================
export const listByStory = asyncHandler(async (req: Request, res: Response) => {
  const storyId = req.params.storyId!;
  const story = await storyService.getById(storyId);
  if (!story)
    throw HttpError.notFound("Story not found");

  const isOwner = req.user?.id === story.author_id;
  const chapters = await chapterService.list(storyId, isOwner);

  // Strip content for the list view — only metadata + preview
  const preview = chapters.map((ch: { chapter_number: number; content: string | any[] }) => {
    const isLocked = !req.user && ch.chapter_number > PUBLIC_CHAPTER_LIMIT;
    return {
      ...ch,
      content: isLocked ? "" : undefined,
      preview: isLocked ? ch.content.slice(0, 500) : undefined,
    };
  });

  return res.json({ chapters: preview });
});

// ============================================================
// GET /api/stories/:storyId/chapters/:num
// ============================================================
export const getByNumber = asyncHandler(async (req: Request, res: Response) => {
  const storyId = req.params.storyId!;
  const num = Number(req.params.num);
  if (!Number.isFinite(num) || num < 1) {
    throw HttpError.badRequest("Invalid chapter number");
  }

  const story = await storyService.getById(storyId);
  if (!story)
    throw HttpError.notFound("Story not found");

  const chapter = await chapterService.getByNumber(storyId, num);
  if (!chapter)
    throw HttpError.notFound("Chapter not found");

  // Public gate: chapters > 3 require auth
  const isOwner = req.user?.id === story.author_id;
  const isLocked
  = !isOwner && !chapter.is_published
    ? true
    : !req.user && num > PUBLIC_CHAPTER_LIMIT;

  if (isLocked) {
    return res.status(402).json({
      error: "SIGNUP_REQUIRED",
      message: "Create a free account to keep reading.",
      preview: chapter.content.slice(0, 500),
      chapter: {
        id: chapter.id,
        chapter_number: chapter.chapter_number,
        title: chapter.title,
        word_count: chapter.word_count,
      },
    });
  }

  // Record read (fire-and-forget)
  if (chapter.is_published && !isOwner) {
    chapterService.recordRead(chapter.id).catch(() => {});
  }

  const adjacent = await chapterService.getAdjacent(storyId, num);

  return res.json({ chapter, adjacent });
});

// ============================================================
// POST /api/stories/:storyId/chapters
// ============================================================
export const create = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw HttpError.unauthorized();

  const storyId = req.params.storyId!;
  const story = await storyService.getById(storyId);
  if (!story)
    throw HttpError.notFound("Story not found");
  if (story.author_id !== req.user.id)
    throw HttpError.forbidden();

  const parsed = createChapterSchema.safeParse(req.body);
  if (!parsed.success)
    throw HttpError.badRequest("Invalid input");

  const chapter = await chapterService.create({
    ...parsed.data,
    story_id: storyId,
    author_id: req.user.id,
  });

  return res.status(201).json({ chapter });
});

// ============================================================
// POST /api/stories/:storyId/chapters/bulk
// Full manuscript upload path
// ============================================================
export const bulkCreate = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw HttpError.unauthorized();

  const storyId = req.params.storyId!;
  const story = await storyService.getById(storyId);
  if (!story)
    throw HttpError.notFound("Story not found");
  if (story.author_id !== req.user.id)
    throw HttpError.forbidden();

  const parsed = bulkCreateSchema.safeParse(req.body);
  if (!parsed.success)
    throw HttpError.badRequest("Invalid input");

  const chapters = await chapterService.bulkCreate({
    story_id: storyId,
    author_id: req.user.id,
    chapters: parsed.data.chapters,
    publishNow: parsed.data.publishNow,
  });

  return res.status(201).json({ chapters, count: chapters.length });
});

// ============================================================
// PATCH /api/chapters/:id
// ============================================================
export const update = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw HttpError.unauthorized();

  const chapter = await chapterService.getById(req.params.id!);
  if (!chapter)
    throw HttpError.notFound("Chapter not found");
  if (chapter.author_id !== req.user.id)
    throw HttpError.forbidden();

  const parsed = updateChapterSchema.safeParse(req.body);
  if (!parsed.success)
    throw HttpError.badRequest("Invalid input");

  const updated = await chapterService.update(req.params.id!, parsed.data);
  return res.json({ chapter: updated });
});

// ============================================================
// POST /api/chapters/:id/publish
// ============================================================
export const publish = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw HttpError.unauthorized();

  const chapter = await chapterService.getById(req.params.id!);
  if (!chapter)
    throw HttpError.notFound("Chapter not found");
  if (chapter.author_id !== req.user.id)
    throw HttpError.forbidden();

  const updated = await chapterService.publish(req.params.id!);
  return res.json({ chapter: updated });
});

// ============================================================
// POST /api/chapters/:id/unpublish
// ============================================================
export const unpublish = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw HttpError.unauthorized();

  const chapter = await chapterService.getById(req.params.id!);
  if (!chapter)
    throw HttpError.notFound("Chapter not found");
  if (chapter.author_id !== req.user.id)
    throw HttpError.forbidden();

  const updated = await chapterService.unpublish(req.params.id!);
  return res.json({ chapter: updated });
});

// ============================================================
// POST /api/chapters/:id/schedule
// ============================================================
export const schedule = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw HttpError.unauthorized();

  const { scheduled_for } = req.body as { scheduled_for?: string };
  if (!scheduled_for)
    throw HttpError.badRequest("scheduled_for is required");

  const chapter = await chapterService.getById(req.params.id!);
  if (!chapter)
    throw HttpError.notFound("Chapter not found");
  if (chapter.author_id !== req.user.id)
    throw HttpError.forbidden();

  const updated = await chapterService.schedule(req.params.id!, scheduled_for);
  return res.json({ chapter: updated });
});

// ============================================================
// DELETE /api/chapters/:id
// ============================================================
export const remove = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw HttpError.unauthorized();

  const chapter = await chapterService.getById(req.params.id!);
  if (!chapter)
    throw HttpError.notFound("Chapter not found");
  if (chapter.author_id !== req.user.id)
    throw HttpError.forbidden();

  await chapterService.remove(req.params.id!);
  return res.status(204).send();
});
