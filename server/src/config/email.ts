import { Resend } from "resend";

import { env, isProduction } from "./env.js";

// ============================================================
// Client
// ============================================================
// The Resend SDK reads the API key from the constructor. We pass
// it explicitly so there is a single source of truth (config/env).
// ============================================================
export const resend = new Resend(env.RESEND_API_KEY);

// ============================================================
// Sender identity
// ------------------------------------------------------------
// EMAIL_FROM must be a verified domain in Resend, e.g.
//   "FolioSparks <hello@foliosparks.com>"
// EMAIL_REPLY_TO is optional — omitted from the payload when unset.
// ============================================================
export const EMAIL_FROM = env.EMAIL_FROM;

export const EMAIL_REPLY_TO: string | undefined = env.EMAIL_REPLY_TO;

// ============================================================
// Prod sanity checks
// ============================================================
if (isProduction) {
  if (!env.RESEND_API_KEY.startsWith("re_")) {
    console.warn(
      "⚠️  RESEND_API_KEY does not look like a Resend key. Emails will fail.",
    );
  }

  if (EMAIL_FROM.includes("resend.dev")) {
    console.warn(
      "⚠️  EMAIL_FROM is still using the Resend sandbox domain. Verify your own domain before launch.",
    );
  }
}
