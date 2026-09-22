import type { Request, Response } from "express";

import { z } from "zod";

import * as pollService from "../services/pollService.js";
import * as storyService from "../services/storyservice.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { HttpError } from "../utils/errors.js";

// ============================================================
// Schemas
// ============================================================
const createPollSchema = z.object({
  chapter_id: z.string().uuid(),
  question: z.string().min(1).max(200),
  description: z.string().max(400).optional(),
  closes_at: z.string().datetime().optional(),
  options: z.array(z.string().min(1).max(120)).min(2).max(6),
});

const voteSchema = z.object({
  optionId: z.string().uuid(),
});

// ============================================================
// GET /api/stories/:storyId/polls
// ============================================================
export const listByStory = asyncHandler(async (req: Request, res: Response) => {
  const polls = await pollService.listByStory(req.params.storyId!);
  return res.json({ polls });
});

// ============================================================
// GET /api/chapters/:chapterId/poll
// ============================================================
export const byChapter = asyncHandler(async (req: Request, res: Response) => {
  const poll = await pollService.getByChapter(req.params.chapterId!);
  if (!poll)
    return res.json({ poll: null });

  const options = await pollService.getOptions(poll.id);
  const myVote = req.user
    ? await pollService.getUserVote(poll.id, req.user.id)
    : null;

  return res.json({
    poll,
    options,
    myVoteOptionId: myVote?.option_id ?? null,
  });
});

// ============================================================
// POST /api/stories/:storyId/polls
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
  if (!story.allows_polls) {
    throw HttpError.badRequest("Polls are disabled on this story");
  }

  const parsed = createPollSchema.safeParse(req.body);
  if (!parsed.success)
    throw HttpError.badRequest("Invalid input");

  const poll = await pollService.create({
    story_id: storyId,
    author_id: req.user.id,
    chapter_id: parsed.data.chapter_id,
    question: parsed.data.question,
    description: parsed.data.description,
    closes_at: parsed.data.closes_at,
    options: parsed.data.options,
  });

  return res.status(201).json({ poll });
});

// ============================================================
// POST /api/polls/:pollId/vote
// ============================================================
export const vote = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw HttpError.unauthorized();

  const parsed = voteSchema.safeParse(req.body);
  if (!parsed.success)
    throw HttpError.badRequest("Invalid input");

  const pollId = req.params.pollId!;

  const existing = await pollService.getUserVote(pollId, req.user.id);
  if (existing)
    throw HttpError.conflict("You already voted in this poll");

  const poll = await pollService.getById(pollId);
  if (!poll)
    throw HttpError.notFound("Poll not found");
  if (poll.status !== "open")
    throw HttpError.badRequest("Poll is closed");

  const vote = await pollService.vote(
    pollId,
    parsed.data.optionId,
    req.user.id,
  );
  return res.status(201).json({ vote });
});

// ============================================================
// GET /api/polls/:pollId/results
// ============================================================
export const results = asyncHandler(async (req: Request, res: Response) => {
  const poll = await pollService.getById(req.params.pollId!);
  if (!poll)
    throw HttpError.notFound("Poll not found");

  const options = await pollService.getOptions(poll.id);
  const myVote = req.user
    ? await pollService.getUserVote(poll.id, req.user.id)
    : null;

  return res.json({
    poll,
    options,
    myVoteOptionId: myVote?.option_id ?? null,
  });
});

// ============================================================
// POST /api/polls/:pollId/close
// ============================================================
export const close = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw HttpError.unauthorized();

  const poll = await pollService.getById(req.params.pollId!);
  if (!poll)
    throw HttpError.notFound("Poll not found");
  if (poll.author_id !== req.user.id)
    throw HttpError.forbidden();

  const winningOptionId = await pollService.close(req.params.pollId!);
  return res.json({ winningOptionId });
});

// ============================================================
// DELETE /api/polls/:pollId
// ============================================================
export const remove = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw HttpError.unauthorized();

  const poll = await pollService.getById(req.params.pollId!);
  if (!poll)
    throw HttpError.notFound("Poll not found");
  if (poll.author_id !== req.user.id)
    throw HttpError.forbidden();

  await pollService.remove(req.params.pollId!);
  return res.status(204).send();
});
