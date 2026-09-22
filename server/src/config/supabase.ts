import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../types/database.js";

import { env, isProduction } from "./env.js";

// ============================================================
// Admin client — bypasses RLS, uses service-role key
// ------------------------------------------------------------
// Only for trusted server-side operations:
//   • Auth admin calls (createUser, generateLink, etc.)
//   • Webhook handlers
//   • Cron jobs
//   • Backend writes that need to bypass RLS
// NEVER expose this client to the browser.
// ============================================================
export const supabaseAdmin: SupabaseClient<Database> = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        "x-application-name": "foliosparks-server",
      },
    },
    db: {
      schema: "public",
    },
  },
);

// ============================================================
// Public client — respects RLS, uses anon key
// ------------------------------------------------------------
// Used when you need to act on behalf of the anon role, e.g.:
//   • Public reads that RLS should gate
//   • Anything where you want the same permissions the browser has
// ============================================================
export const supabasePublic: SupabaseClient<Database> = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        "x-application-name": "foliosparks-server-anon",
      },
    },
  },
);

// ============================================================
// User-scoped client factory
// ------------------------------------------------------------
// Creates a client that carries a user"s JWT — every query runs
// under RLS as that user. Use this in request handlers when you
// want DB-level permission enforcement (defense in depth).
// ============================================================
export function supabaseAsUser(accessToken: string): SupabaseClient<Database> {
  return createClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "x-application-name": "foliosparks-server-user",
      },
    },
  });
}

// ============================================================
// Sanity check — warn if service key looks wrong
// ============================================================
if (isProduction && !env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is required in production");
}
