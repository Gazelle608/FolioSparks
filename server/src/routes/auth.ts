import { Router } from "express";
import { z } from "zod";

import * as authController from "../controllers/authcontroller.js";
import { requireAuth } from "../middleware/auth.js";
import { authLimiter, emailLimiter } from "../middleware/rateLimiter.js";
import { validate } from "../middleware/validate.js";

const router = Router();

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

const emailOnlySchema = z.object({
  email: z.string().email(),
});

// ============================================================
// Routes
// ============================================================

// POST /api/auth/signup
router.post(
  "/signup",
  authLimiter,
  validate({ body: signUpSchema }),
  authController.signUp,
);

// POST /api/auth/forgot-password
router.post(
  "/forgot-password",
  emailLimiter,
  validate({ body: emailOnlySchema }),
  authController.forgotPassword,
);

// POST /api/auth/magic-link
router.post(
  "/magic-link",
  emailLimiter,
  validate({ body: emailOnlySchema }),
  authController.magicLink,
);

// POST /api/auth/resend-verification
router.post(
  "/resend-verification",
  requireAuth,
  emailLimiter,
  authController.resendVerification,
);

// GET /api/auth/me
router.get("/me", requireAuth, authController.me);

export default router;
