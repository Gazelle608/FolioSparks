import type { Request, Response } from "express";

import * as analyticsService from "../services/analyticsservice.js";
import * as storyService from "../services/storyservice.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { HttpError } from "../utils/errors.js";

// ============================================================
// GET /api/analytics/story/:storyId
// Author only — full story analytics
// ============================================================
export const story = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw HttpError.unauthorized();

  const storyId = Array.isArray(req.params.storyId)
    ? req.params.storyId[0]
    : req.params.storyId;
  const s = await storyService.getById(storyId);
  if (!s)
    throw HttpError.notFound("Story not found");
  if (s.author_id !== req.user.id)
    throw HttpError.forbidden();

  const analytics = await analyticsService.getStoryAnalytics(storyId);
  return res.json(analytics);
});

// ============================================================
// GET /api/analytics/me
// Author's overall dashboard
// ============================================================
export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw HttpError.unauthorized();

  const overview = await analyticsService.getAuthorOverview(req.user.id);
  return res.json(overview);
});

// ============================================================
// GET /api/analytics/story/:storyId/sparks
// Time-series of Sparks over the last 30 days
// ============================================================
export const sparksSeries = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user)
      throw HttpError.unauthorized();

    const storyId = Array.isArray(req.params.storyId)
      ? req.params.storyId[0]
      : req.params.storyId;
    const s = await storyService.getById(storyId);
    if (!s)
      throw HttpError.notFound("Story not found");
    if (s.author_id !== req.user.id)
      throw HttpError.forbidden();

    const days = Math.min(Number(req.query.days) || 30, 90);
    const series = await analyticsService.getSparksSeries(storyId, days);
    return res.json({ series });
  },
);

// ============================================================
// GET /api/analytics/story/:storyId/chapters
// Per-chapter breakdown table
// ============================================================
export const chapterBreakdown = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user)
      throw HttpError.unauthorized();

    const storyId = Array.isArray(req.params.storyId)
      ? req.params.storyId[0]
      : req.params.storyId;
    const s = await storyService.getById(storyId);
    if (!s)
      throw HttpError.notFound("Story not found");
    if (s.author_id !== req.user.id)
      throw HttpError.forbidden();

    const breakdown = await analyticsService.getChapterBreakdown(storyId);
    return res.json({ breakdown });
  },
);

// ============================================================
// GET /api/analytics/donations
// Click counts per platform for the author
// ============================================================
export const donationClicks = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user)
      throw HttpError.unauthorized();

    const days = Math.min(Number(req.query.days) || 30, 90);
    const clicks = await analyticsService.getDonationClicks(req.user.id, days);
    return res.json({ clicks });
  },
);
