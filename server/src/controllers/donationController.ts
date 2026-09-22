import type { Request, Response } from "express";

import { z } from "zod";

import * as donationService from "../services/donationservice.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { DONATION_PLATFORMS } from "../utils/constants.js";
import { HttpError } from "../utils/errors.js";

// ============================================================
// Schemas
// ============================================================
// Single source of truth for platform values (mirrors the DB enum)
const platformEnum = z.enum(DONATION_PLATFORMS);

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
  platform: platformEnum,
});

// ============================================================
// GET /api/donations/author/:authorId
// ============================================================
export const byAuthor = asyncHandler(async (req: Request, res: Response) => {
  const links = await donationService.listByAuthor(req.params.authorId!);
  return res.json({ links });
});

// ============================================================
// POST /api/donations
// ============================================================
export const create = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw HttpError.unauthorized();

  const parsed = createLinkSchema.safeParse(req.body);
  if (!parsed.success) {
    throw HttpError.badRequest(
      "Invalid input",
      parsed.error.flatten().fieldErrors as Record<string, string>,
    );
  }

  const link = await donationService.create({
    author_id: req.user.id,
    ...parsed.data,
  });

  return res.status(201).json({ link });
});

// ============================================================
// PATCH /api/donations/:linkId
// ============================================================
export const update = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw HttpError.unauthorized();

  const link = await donationService.getById(req.params.linkId!);
  if (!link)
    throw HttpError.notFound("Link not found");
  if (link.author_id !== req.user.id)
    throw HttpError.forbidden();

  const parsed = updateLinkSchema.safeParse(req.body);
  if (!parsed.success)
    throw HttpError.badRequest("Invalid input");

  const updated = await donationService.update(req.params.linkId!, parsed.data);
  return res.json({ link: updated });
});

// ============================================================
// DELETE /api/donations/:linkId
// ============================================================
export const remove = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw HttpError.unauthorized();

  const link = await donationService.getById(req.params.linkId!);
  if (!link)
    throw HttpError.notFound("Link not found");
  if (link.author_id !== req.user.id)
    throw HttpError.forbidden();

  await donationService.remove(req.params.linkId!);
  return res.status(204).send();
});

// ============================================================
// POST /api/donations/track — fire-and-forget click tracking
// ============================================================
export const trackClick = asyncHandler(async (req: Request, res: Response) => {
  const parsed = trackClickSchema.safeParse(req.body);
  if (!parsed.success)
    return res.json({ ok: true });

  // Never fail this request — it's just analytics
  donationService
    .trackClick({
      author_id: parsed.data.author_id,
      platform: parsed.data.platform,
      clicked_by: req.user?.id ?? null,
    })
    .catch(() => {});

  return res.json({ ok: true });
});
