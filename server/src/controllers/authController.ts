import type { User } from "@supabase/supabase-js";
import type { Request, Response } from "express";

import { randomUUID } from "node:crypto";
import { z } from "zod";

import { env } from "../config/env.js";
import { supabaseAdmin } from "../config/supabase.js";
import * as authService from "../services/authservice.js";
import * as emailService from "../services/emailService.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { HttpError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

// ============================================================
// Schemas
// ============================================================
const signUpSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
  username: z
    .string()
    .min(3)
    .max(24)
    .regex(/^[a-z0-9_]+$/),
  displayName: z.string().min(2).max(60),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const magicLinkSchema = z.object({
  email: z.string().email(),
});

// ============================================================
// POST /api/auth/signup
// ============================================================
export const signUp = asyncHandler(async (req: Request, res: Response) => {
  const parsed = signUpSchema.safeParse(req.body);
  if (!parsed.success) {
    throw HttpError.badRequest(
      "Invalid input",
      parsed.error.flatten().fieldErrors as Record<string, string>,
    );
  }

  const result = await authService.signUpWithEmail(parsed.data);

  if (result.error && !result.userId) {
    throw HttpError.badRequest(result.error);
  }

  return res.status(201).json({
    userId: result.userId,
    needsVerification: result.needsVerification,
    message: result.needsVerification
      ? "Check your email to verify your account"
      : "Account created",
  });
});

// ============================================================
// POST /api/auth/forgot-password
// ============================================================
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success)
      throw HttpError.badRequest("Invalid email");

    const { email } = parsed.data;

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo: `${env.CLIENT_URL}/auth/reset` },
    });

    // Don't leak whether the email exists
    if (error || !data?.properties?.action_link) {
      logger.warn("Password reset requested for unknown email", { email });
      return res.json({ ok: true });
    }

    await emailService.sendPasswordResetEmail({
      to: email,
      resetUrl: data.properties.action_link,
      expiresInHours: 1,
    });

    return res.json({ ok: true });
  },
);

// ============================================================
// POST /api/auth/magic-link
// ============================================================
export const magicLink = asyncHandler(async (req: Request, res: Response) => {
  const parsed = magicLinkSchema.safeParse(req.body);
  if (!parsed.success)
    throw HttpError.badRequest("Invalid email");

  const { email } = parsed.data;

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: {
      redirectTo: `${env.CLIENT_URL}/auth/callback?type=magic`,
    },
  });

  if (error || !data?.properties?.action_link) {
    return res.json({ ok: true });
  }

  await emailService.sendMagicLinkEmail({
    to: email,
    magicLinkUrl: data.properties.action_link,
  });

  return res.json({ ok: true });
});

// ============================================================
// POST /api/auth/resend-verification
// ============================================================
export const resendVerification = asyncHandler(
  async (req: Request, res: Response) => {
    const user = (req as Request & { user?: User }).user;
    if (!user)
      throw HttpError.unauthorized();

    if (user.email_confirmed_at) {
      throw HttpError.badRequest("Email already verified");
    }

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "signup",
      email: user.email!,
      password: `${randomUUID()}Aa1!`,
      options: {
        redirectTo: `${env.CLIENT_URL}/auth/callback?type=email_verified`,
      },
    });

    if (error || !data?.properties?.action_link) {
      throw HttpError.internal("Could not generate verification link");
    }

    const displayName = (user.user_metadata?.display_name as string | undefined) ?? user.email!.split("@")[0]!;

    await emailService.sendVerificationEmail({
      to: user.email!,
      displayName,
      verificationUrl: data.properties.action_link,
      expiresInHours: 24,
    });

    return res.json({ ok: true });
  },
);

// ============================================================
// GET /api/auth/me
// ============================================================
export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as Request & { user?: User }).user;
  if (!user)
    throw HttpError.unauthorized();

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return res.json({
    user: {
      id: user.id,
      email: user.email,
      email_confirmed_at: user.email_confirmed_at,
      user_metadata: user.user_metadata,
    },
    profile,
  });
});
