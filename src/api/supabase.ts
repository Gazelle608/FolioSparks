import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "../types/database";

// ---------------------------------------------------------------------------
// Env
// ---------------------------------------------------------------------------
const env = (import.meta as ImportMeta & {
  env: Record<string, string | undefined>;
}).env;
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Check your .env file.",
  );
}

// ---------------------------------------------------------------------------
// Typed client
// ---------------------------------------------------------------------------
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "foliosparks-auth",
    },
    global: {
      headers: {
        "x-application-name": "foliosparks-client",
      },
    },
  },
);

// ---------------------------------------------------------------------------
// Storage bucket names (single source of truth)
// ---------------------------------------------------------------------------
export const BUCKETS = {
  COVERS: "covers",
  AVATARS: "avatars",
  AUDIO: "audio",
} as const;

// ---------------------------------------------------------------------------
// Reusable helper: unwrap Supabase responses into { data, error }
// ---------------------------------------------------------------------------
export type ApiResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

export function ok<T>(data: T): ApiResult<T> {
  return { data, error: null };
}

export function err<T = never>(message: string): ApiResult<T> {
  return { data: null, error: message };
}

// ---------------------------------------------------------------------------
// Public URL helpers
// ---------------------------------------------------------------------------
export function getCoverUrl(path: string | null | undefined): string {
  if (!path)
    return "/default-cover.png";
  if (path.startsWith("http"))
    return path;
  const { data } = supabase.storage.from(BUCKETS.COVERS).getPublicUrl(path);
  return data.publicUrl;
}

export function getAvatarUrl(path: string | null | undefined): string {
  if (!path)
    return "/default-avatar.png";
  if (path.startsWith("http"))
    return path;
  const { data } = supabase.storage.from(BUCKETS.AVATARS).getPublicUrl(path);
  return data.publicUrl;
}

// ---------------------------------------------------------------------------
// Signed URL for private audio (Spark Pro only — server checks tier first)
// ---------------------------------------------------------------------------
export async function getSignedAudioUrl(
  storagePath: string,
  expiresInSeconds = 900,
): Promise<ApiResult<string>> {
  const { data, error } = await supabase.storage
    .from(BUCKETS.AUDIO)
    .createSignedUrl(storagePath, expiresInSeconds);

  if (error || !data)
    return err(error?.message ?? "Failed to sign audio URL");
  return ok(data.signedUrl);
}
