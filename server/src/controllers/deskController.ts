import type { Request, Response } from "express";

import { z } from "zod";

import * as deskService from "../services/deskservice.js";
import * as storyService from "../services/storyService.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { HttpError } from "../utils/errors.js";

// ============================================================
// Schemas
// ============================================================
const createDeskSchema = z.object({
  title: z.string().min(1).max(200),
  brief: z.string().max(1000).optional(),
  max_cowriters: z.number().int().min(1).max(20).optional(),
});

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

// ============================================================
// GET /api/stories/:storyId/desk
// ============================================================
export const byStory = asyncHandler(async (req: Request, res: Response) => {
  const desk = await deskService.getByStory(req.params.storyId!);
  if (!desk)
    return res.json({ desk: null, members: [] });

  const members = await deskService.getMembers(desk.id);
  return res.json({ desk, members });
});

// ============================================================
// POST /api/stories/:storyId/desk
// ============================================================
export const open = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw HttpError.unauthorized();

  const storyId = req.params.storyId!;
  const story = await storyService.getById(storyId);
  if (!story)
    throw HttpError.notFound("Story not found");
  if (story.author_id !== req.user.id)
    throw HttpError.forbidden();

  const parsed = createDeskSchema.safeParse(req.body);
  if (!parsed.success)
    throw HttpError.badRequest("Invalid input");

  const desk = await deskService.open({
    story_id: storyId,
    owner_id: req.user.id,
    title: parsed.data.title,
    brief: parsed.data.brief,
    max_cowriters: parsed.data.max_cowriters,
  });

  return res.status(201).json({ desk });
});

// ============================================================
// DELETE /api/desks/:deskId — close desk
// ============================================================
export const close = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw HttpError.unauthorized();

  const desk = await deskService.getById(req.params.deskId!);
  if (!desk)
    throw HttpError.notFound("Desk not found");
  if (desk.owner_id !== req.user.id)
    throw HttpError.forbidden();

  const updated = await deskService.close(req.params.deskId!);
  return res.json({ desk: updated });
});

// ============================================================
// POST /api/desks/:deskId/invite
// ============================================================
export const invite = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw HttpError.unauthorized();

  const desk = await deskService.getById(req.params.deskId!);
  if (!desk)
    throw HttpError.notFound("Desk not found");
  if (desk.owner_id !== req.user.id)
    throw HttpError.forbidden();

  const parsed = inviteSchema.safeParse(req.body);
  if (!parsed.success)
    throw HttpError.badRequest("Invalid input");

  const invite = await deskService.invite({
    desk_id: desk.id,
    invited_user_id: parsed.data.invited_user_id,
    invited_by: req.user.id,
    message: parsed.data.message,
  });

  return res.status(201).json({ invite });
});

// ============================================================
// GET /api/desks/invites — my pending invites
// ============================================================
export const myInvites = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw HttpError.unauthorized();

  const invites = await deskService.getPendingInvites(req.user.id);
  return res.json({ invites });
});

// ============================================================
// POST /api/desks/invites/:inviteId/respond
// ============================================================
export const respondInvite = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user)
      throw HttpError.unauthorized();

    const parsed = respondInviteSchema.safeParse(req.body);
    if (!parsed.success)
      throw HttpError.badRequest("Invalid input");

    const invite = await deskService.respondInvite(
      req.params.inviteId!,
      req.user.id,
      parsed.data.accept,
    );

    return res.json({ invite });
  },
);

// ============================================================
// POST /api/desks/:deskId/submissions — co-writer submits a draft
// ============================================================
export const submitDraft = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw HttpError.unauthorized();

  const deskId = req.params.deskId!;
  const desk = await deskService.getById(deskId);
  if (!desk)
    throw HttpError.notFound("Desk not found");
  if (desk.status !== "open")
    throw HttpError.badRequest("Desk is closed");

  const isMember = await deskService.isMember(deskId, req.user.id);
  if (!isMember && desk.owner_id !== req.user.id) {
    throw HttpError.forbidden("Not a member of this desk");
  }

  const parsed = submitDraftSchema.safeParse(req.body);
  if (!parsed.success)
    throw HttpError.badRequest("Invalid input");

  const submission = await deskService.submitDraft({
    desk_id: deskId,
    chapter_number: parsed.data.chapter_number,
    title: parsed.data.title,
    content: parsed.data.content,
    submitted_by: req.user.id,
  });

  return res.status(201).json({ submission });
});

// ============================================================
// GET /api/desks/:deskId/submissions — owner reviews
// ============================================================
export const listSubmissions = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user)
      throw HttpError.unauthorized();

    const desk = await deskService.getById(req.params.deskId!);
    if (!desk)
      throw HttpError.notFound("Desk not found");
    if (desk.owner_id !== req.user.id)
      throw HttpError.forbidden();

    const submissions = await deskService.getSubmissions(desk.id);
    return res.json({ submissions });
  },
);

// ============================================================
// POST /api/submissions/:submissionId/approve
// ============================================================
export const approveSubmission = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user)
      throw HttpError.unauthorized();

    const submission = await deskService.getSubmission(
      req.params.submissionId!,
    );
    if (!submission)
      throw HttpError.notFound("Submission not found");

    const desk = await deskService.getById(submission.desk_id);
    if (!desk)
      throw HttpError.notFound("Desk not found");
    if (desk.owner_id !== req.user.id)
      throw HttpError.forbidden();

    await deskService.approveSubmission(req.params.submissionId!);
    return res.json({ ok: true });
  },
);

// ============================================================
// DELETE /api/submissions/:submissionId
// ============================================================
export const removeSubmission = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user)
      throw HttpError.unauthorized();

    const submission = await deskService.getSubmission(
      req.params.submissionId!,
    );
    if (!submission)
      throw HttpError.notFound("Submission not found");

    const desk = await deskService.getById(submission.desk_id);
    if (!desk)
      throw HttpError.notFound("Desk not found");
    if (desk.owner_id !== req.user.id)
      throw HttpError.forbidden();

    await deskService.removeSubmission(req.params.submissionId!);
    return res.status(204).send();
  },
);
