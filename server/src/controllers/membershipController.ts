import type { Request, Response } from "express";

import { z } from "zod";

import * as membershipService from "../services/membershipService.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { HttpError } from "../utils/errors.js";

// ============================================================
// Schemas
// ============================================================
const checkoutSchema = z.object({
  tier: z.enum(["spark", "spark_pro"]),
});

// ============================================================
// GET /api/memberships/me
// ============================================================
export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw HttpError.unauthorized();

  const membership = await membershipService.get(req.user.id);
  return res.json({ membership });
});

// ============================================================
// POST /api/memberships/checkout
// ============================================================
export const checkout = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw HttpError.unauthorized();

  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success)
    throw HttpError.badRequest("Invalid tier");

  const url = await membershipService.createCheckoutSession(
    req.user.id,
    req.user.email!,
    parsed.data.tier,
  );

  return res.json({ url });
});

// ============================================================
// POST /api/memberships/portal
// ============================================================
export const portal = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw HttpError.unauthorized();

  const url = await membershipService.createBillingPortalSession(req.user.id);
  return res.json({ url });
});

// ============================================================
// POST /api/memberships/cancel
// ============================================================
export const cancel = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw HttpError.unauthorized();

  const membership = await membershipService.cancelAtPeriodEnd(req.user.id);
  return res.json({ membership });
});

// ============================================================
// POST /api/memberships/resume
// ============================================================
export const resume = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw HttpError.unauthorized();

  const membership = await membershipService.resume(req.user.id);
  return res.json({ membership });
});
