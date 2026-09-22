// ============================================================
// FolioSparks — Server Constants
// ============================================================

// ------------------------------------------------------------
// Reading gate
// ------------------------------------------------------------
export const PUBLIC_CHAPTER_LIMIT = 3;

// ------------------------------------------------------------
// Spark economy (mirrors client/src/utils/constants.ts)
// ------------------------------------------------------------
export const SPARK_ALLOWANCES = {
  free: 100,
  spark: 1200,
  spark_pro: 3000,
} as const;

export const SPARK_LIMITS = {
  minSpend: 1,
  maxSpendPerTransaction: 10_000,
  noteMaxLength: 500,
} as const;

export const SPARK_REASONS = [
  "signup_bonus",
  "monthly_grant",
  "chapter_spark",
  "poll_reward",
  "admin_adjustment",
  "referral_bonus",
] as const;

// ------------------------------------------------------------
// Membership tiers
// ------------------------------------------------------------
export const MEMBERSHIP_TIERS = ["free", "spark", "spark_pro"] as const;

export const TIER_RANK: Record<(typeof MEMBERSHIP_TIERS)[number], number> = {
  free: 0,
  spark: 1,
  spark_pro: 2,
};

export const TIER_PRICING = {
  free: 0,
  spark: 5,
  spark_pro: 12,
} as const;

// ------------------------------------------------------------
// Story / chapter limits
// ------------------------------------------------------------
export const STORY_LIMITS = {
  titleMin: 2,
  titleMax: 200,
  synopsisMax: 1000,
  slugMin: 3,
  slugMax: 120,
  tagsMax: 15,
} as const;

export const CHAPTER_LIMITS = {
  titleMax: 120,
  contentMin: 1,
  bulkMax: 500,
  wordsPerMinute: 180,
} as const;

// ------------------------------------------------------------
// Poll limits
// ------------------------------------------------------------
export const POLL_LIMITS = {
  questionMax: 200,
  descriptionMax: 400,
  optionMax: 120,
  optionsMin: 2,
  optionsMax: 6,
} as const;

// ------------------------------------------------------------
// Desk limits
// ------------------------------------------------------------
export const DESK_LIMITS = {
  titleMax: 200,
  briefMax: 1000,
  maxCowritersMin: 1,
  maxCowritersMax: 20,
  messageMax: 300,
} as const;

// ------------------------------------------------------------
// Donation platforms
// ------------------------------------------------------------
export const DONATION_PLATFORMS = [
  "patreon",
  "ko_fi",
  "buymeacoffee",
  "paypal",
  "stripe",
  "cashapp",
  "venmo",
  "custom",
] as const;

export const PLATFORM_LABELS: Record<
  (typeof DONATION_PLATFORMS)[number],
  string
> = {
  patreon: "Patreon",
  ko_fi: "Ko-fi",
  buymeacoffee: "Buy Me a Coffee",
  paypal: "PayPal",
  stripe: "Stripe",
  cashapp: "Cash App",
  venmo: "Venmo",
  custom: "Custom",
};

// ------------------------------------------------------------
// Audio / TTS
// ------------------------------------------------------------
export const AUDIO_LIMITS = {
  maxCharsPerRequest: 5000,
  durationEstimateWpm: 180,
  streamUrlTtlSeconds: 900, // 15 min
  downloadUrlTtlSeconds: 900,
} as const;

// ------------------------------------------------------------
// Storage buckets
// ------------------------------------------------------------
export const STORAGE_BUCKETS = {
  covers: "covers",
  avatars: "avatars",
  audio: "audio",
} as const;

// ------------------------------------------------------------
// API limits
// ------------------------------------------------------------
export const API_LIMITS = {
  // Body size
  jsonBodyMaxBytes: 10 * 1024 * 1024, // 10 MB
  webhookBodyMaxBytes: 5 * 1024 * 1024, // 5 MB

  // Pagination
  defaultPageSize: 24,
  maxPageSize: 48,
  defaultLedgerPageSize: 50,
  maxLedgerPageSize: 100,

  // Rate limits (per window)
  generalWindowMs: 15 * 60 * 1000,
  generalMax: 300,
  authWindowMs: 15 * 60 * 1000,
  authMax: 10,
  emailWindowMs: 15 * 60 * 1000,
  emailMax: 5,
  sparkWindowMs: 60 * 1000,
  sparkMax: 60,
  writeWindowMs: 60 * 1000,
  writeMax: 30,
  expensiveWindowMs: 60 * 1000,
  expensiveMax: 10,
} as const;

// ------------------------------------------------------------
// Cron schedules
// ------------------------------------------------------------
export const CRON_SCHEDULES = {
  monthlySparksGrant: "5 0 1 * *", // 1st of month @ 00:05 UTC
  publishScheduled: "* * * * *", // every minute
  closePolls: "*/5 * * * *", // every 5 min
  generateAudio: "*/10 * * * *", // every 10 min
} as const;

export const JOB_BATCH_SIZES = {
  audioGeneration: 5,
} as const;

// ------------------------------------------------------------
// Email
// ------------------------------------------------------------
export const EMAIL_TIMING = {
  verificationExpiresHours: 24,
  passwordResetExpiresHours: 1,
  magicLinkExpiresHours: 1,
} as const;

// ------------------------------------------------------------
// HTTP status codes (for readability in handlers)
// ------------------------------------------------------------
export const HTTP = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  PAYLOAD_TOO_LARGE: 413,
  UNPROCESSABLE: 422,
  TOO_MANY: 429,
  INTERNAL: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// ------------------------------------------------------------
// Error codes (clients switch on these)
// ------------------------------------------------------------
export const ERROR_CODES = {
  BAD_REQUEST: "BAD_REQUEST",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  RATE_LIMIT: "RATE_LIMIT",
  SIGNUP_REQUIRED: "SIGNUP_REQUIRED",
  TIER_REQUIRED: "TIER_REQUIRED",
  SPARK_PRO_REQUIRED: "SPARK_PRO_REQUIRED",
  EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",
  INSUFFICIENT_SPARKS: "INSUFFICIENT_SPARKS",
  INTERNAL: "INTERNAL",
} as const;

// ------------------------------------------------------------
// Webhook event types we handle
// ------------------------------------------------------------
export const SUPABASE_AUTH_EVENTS = {
  USER_CREATED: "user.created",
  USER_CONFIRMED: "user.confirmed",
  USER_UPDATED: "user.updated",
  USER_DELETED: "user.deleted",
} as const;

export const STRIPE_EVENTS = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_succeeded",
  "invoice.payment_failed",
] as const;

// ------------------------------------------------------------
// Story status enum values
// ------------------------------------------------------------
export const STORY_STATUSES = [
  "draft",
  "ongoing",
  "hiatus",
  "completed",
  "cancelled",
] as const;

export const PUBLISH_MODES = ["full_manuscript", "chapter_by_chapter"] as const;

export const CONTENT_RATINGS = ["general", "teen", "mature"] as const;

export const POLL_STATUSES = ["open", "closed", "cancelled"] as const;

export const DESK_STATUSES = ["open", "closed"] as const;

export const INVITE_STATUSES = [
  "pending",
  "accepted",
  "declined",
  "revoked",
] as const;

// ------------------------------------------------------------
// Content rating
// ------------------------------------------------------------
export const DEFAULT_LANGUAGE = "en";
export const DEFAULT_CONTENT_RATING = "general";
export const DEFAULT_PUBLISH_MODE = "chapter_by_chapter";

// ------------------------------------------------------------
// Timings (ms)
// ------------------------------------------------------------
export const TIMING = {
  autosaveDelayMs: 1500,
  readingProgressDebounceMs: 2000,
  sparkReconcileDelayMs: 500,
} as const;

// ------------------------------------------------------------
// Session
// ------------------------------------------------------------
export const SESSION = {
  maxUserAgents: 10,
  refreshBeforeExpiryMs: 60_000,
} as const;
