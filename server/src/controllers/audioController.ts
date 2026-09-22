import type { Request, Response } from "express";

import * as audioService from "../services/audioservice.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { HttpError } from "../utils/errors.js";

// ============================================================
// GET /api/audio/:chapterId/stream
// Spark + Spark Pro only — returns a signed URL
// ============================================================
export const stream = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw HttpError.unauthorized();

  const chapterId = req.params.chapterId as string;
  const result = await audioService.getStreamUrl(chapterId, req.user.id);
  return res.json(result);
});

// ============================================================
// GET /api/audio/:chapterId/download
// Spark Pro only — returns a signed download URL
// ============================================================
export const download = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw HttpError.unauthorized();

  const chapterId = req.params.chapterId as string;
  const result = await audioService.getDownloadUrl(chapterId, req.user.id);
  return res.json(result);
});

// ============================================================
// POST /api/audio/:chapterId/generate
// Author only — enqueues MP3 generation
// ============================================================
export const generate = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw HttpError.unauthorized();

  const chapterId = req.params.chapterId as string;
  const job = await audioService.requestGeneration(chapterId, req.user.id);
  return res.status(202).json({ jobId: job.jobId });
});

// ============================================================
// GET /api/audio/:chapterId/status
// Author only — poll generation progress
// ============================================================
export const status = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw HttpError.unauthorized();

  const chapterId = req.params.chapterId as string;
  const status = await audioService.getStatus(chapterId, req.user.id);
  return res.json(status);
});
