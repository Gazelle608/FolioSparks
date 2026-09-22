import { z } from "zod";

const runtimeProcess = (
  globalThis as typeof globalThis & {
    process: {
      env: Record<string, string | undefined>;
      stderr: { write: (message: string) => void };
    };
  }
).process;
const runtimeEnv = runtimeProcess.env;
const stderr = runtimeProcess.stderr;

// ============================================================
// Schema
// ============================================================
const envSchema = z.object({
  // ---------- Runtime ----------
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_URL: z.string().url(),

  // ---------- Supabase ----------
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(20),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  SUPABASE_WEBHOOK_SECRET: z.string().min(10).optional(),

  // ---------- Email (Resend) ----------
  RESEND_API_KEY: z.string().startsWith("re_"),
  EMAIL_FROM: z.string().min(1),
  EMAIL_REPLY_TO: z.string().email().optional(),

  // ---------- Stripe ----------
  STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),
  STRIPE_PRICE_SPARK: z.string().startsWith("price_"),
  STRIPE_PRICE_SPARK_PRO: z.string().startsWith("price_"),

  // ---------- TTS (Spark Pro audio) ----------
  TTS_PROVIDER: z.enum(["google", "azure", "elevenlabs"]).default("google"),
  TTS_API_KEY: z.string().optional(),
  TTS_DEFAULT_VOICE: z.string().default("en-US-Neural2-F"),

  // ---------- Storage ----------
  SUPABASE_AUDIO_BUCKET: z.string().default("audio"),
  SUPABASE_COVERS_BUCKET: z.string().default("covers"),
  SUPABASE_AVATARS_BUCKET: z.string().default("avatars"),
});

export type Env = z.infer<typeof envSchema>;

// ============================================================
// Parse
// ============================================================
function loadEnv(): Env {
  const parsed = envSchema.safeParse(runtimeEnv);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;

    stderr.write("\n❌ Invalid environment configuration:\n");
    for (const [key, messages] of Object.entries(errors)) {
      stderr.write(`  • ${key}:\n`);
      for (const msg of messages ?? []) {
        stderr.write(`      ${msg}\n`);
      }
    }
    stderr.write("\nCheck your .env file against .env.example.\n");

    throw new Error("Invalid environment configuration");
  }

  return parsed.data;
}

export const env = loadEnv();

// ============================================================
// Derived helpers
// ============================================================
export const isProduction = env.NODE_ENV === "production";
export const isDevelopment = env.NODE_ENV === "development";
export const isTest = env.NODE_ENV === "test";

// ============================================================
// Compile-time guarantee that we never import service role
// into client-side code
// ============================================================
if ("window" in globalThis) {
  throw new TypeError(
    "config/env.ts was imported into the browser — this file must stay server-side only.",
  );
}
