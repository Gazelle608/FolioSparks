import type { Request, Response } from "express";

import { z } from "zod";

import * as sparksService from "../services/sparksService.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { HttpError } from "../utils/errors.js";

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
// GET /api/sparks/balance
// ============================================================
export const balance = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw HttpError.unauthorized();

  const balance = await sparksService.getBalance(req.user.id);
  return res.json({ balance });
});

// ============================================================
// GET /api/sparks/ledger
// ============================================================
export const ledger = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw HttpError.unauthorized();

  const parsed = ledgerQuerySchema.safeParse(req.query);
  if (!parsed.success)
    throw HttpError.badRequest("Invalid query");

  const entries = await sparksService.getLedger(req.user.id, parsed.data);
  return res.json({ entries });
});

// ============================================================
// POST /api/sparks/spend
// ============================================================
export const spend = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw HttpError.unauthorized();

  const parsed = spendSchema.safeParse(req.body);
  if (!parsed.success)
    throw HttpError.badRequest("Invalid input");

  const result = await sparksService.spend({
    userId: req.user.id,
    chapterId: parsed.data.chapterId,
    amount: parsed.data.amount,
    note: parsed.data.note,
  });

  return res.status(201).json({ entry: result });
});

// ============================================================
// GET /api/sparks/chapter/:chapterId — public total
// ============================================================
export const chapterTotal = asyncHandler(
  async (req: Request, res: Response) => {
    const total = await sparksService.getChapterTotal(req.params.chapterId!);
    return res.json({ total });
  },
);

// ============================================================
// GET /api/sparks/author/:authorId — public total
// ============================================================
export const authorTotal = asyncHandler(async (req: Request, res: Response) => {
  const total = await sparksService.getAuthorTotal(req.params.authorId!);
  return res.json({ total });
});

// ============================================================
// GET /api/sparks/received — recent sparks on my chapters
// ============================================================
export const received = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw HttpError.unauthorized();

  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const entries = await sparksService.getRecentForAuthor(req.user.id, limit);
  return res.json({ entries });
});

// ============================================================
// GET /api/sparks/sent — sparks I"ve sent
// ============================================================
export const sent = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw HttpError.unauthorized();

  const limit = Math.min(Number(req.query.limit) || 30, 100);
  const entries = await sparksService.getSent(req.user.id, limit);
  return res.json({ entries });
});
