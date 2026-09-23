// ============================================================
// Post-auth routing
// ------------------------------------------------------------
// One place that decides where a signed-in user belongs, so every
// entry point — password sign-in, sign-up, Google OAuth, magic link,
// email confirmation — lands in the same spot.
// ============================================================

import type { Profile } from "../types/user";

import { ROUTES } from "./constants";

/** Transient route that resolves to the right home for the account */
export const POST_AUTH_PATH = ROUTES.dashboard;

/** Author dashboard */
export const STUDIO_PATH = ROUTES.studio;

/** Reader dashboard — bookshelf, Sparks allowance, membership */
export const READER_HOME_PATH = ROUTES.readerLibrary;

/** Where accounts that haven't finished onboarding go */
export const ONBOARDING_PATH = ROUTES.onboarding;

export const SIGN_IN_PATH = ROUTES.signIn;
export const SIGN_UP_PATH = ROUTES.signUp;
export const AUTH_CALLBACK_PATH = ROUTES.authCallback;
export const VERIFY_EMAIL_PATH = ROUTES.verifyEmail;

/**
 * The signed-in home for a profile:
 *   not onboarded → /onboarding
 *   author        → /studio
 *   reader        → /me/library
 */
export function resolveDashboardPath(
  profile: Profile | null | undefined,
): string {
  if (!profile?.onboarded_at)
    return ONBOARDING_PATH;

  return profile.is_author ? STUDIO_PATH : READER_HOME_PATH;
}

/**
 * Only same-origin, relative redirect targets are allowed — `?next=`
 * must never be turnable into an open redirect.
 */
export function safeNextPath(raw: string | null | undefined): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//"))
    return null;

  return raw;
}

/**
 * Build `${origin}/auth/callback`, preserving a `next` target so OAuth
 * round-trips and email links can return users to the page they wanted.
 */
export function buildAuthCallbackUrl(nextPath?: string | null): string {
  const url = new URL(`${window.location.origin}${AUTH_CALLBACK_PATH}`);

  const next = safeNextPath(nextPath);
  if (next)
    url.searchParams.set("next", next);

  return url.toString();
}
