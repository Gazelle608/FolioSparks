// ============================================================
// FolioSparks — Constants
// Values that are true across the entire platform.
// ============================================================

// ---------------------------------------------------------------------------
// Reading gate — how many chapters readers can see without an account
// ---------------------------------------------------------------------------
export const PUBLIC_CHAPTER_LIMIT = 3;

// ---------------------------------------------------------------------------
// Spark allowances by tier (mirrors memberships.sparks_allowance)
// ---------------------------------------------------------------------------
export const SPARK_ALLOWANCES = {
  free: 100,
  spark: 1200,
  spark_pro: 3000,
} as const;

// ---------------------------------------------------------------------------
// Tier pricing in USD (mirrors api/memberships.ts TIER_PRICING)
// ---------------------------------------------------------------------------
export const TIER_PRICING = {
  free: 0,
  spark: 5,
  spark_pro: 12,
} as const;

// ---------------------------------------------------------------------------
// Upload limits
// ---------------------------------------------------------------------------
export const UPLOAD_LIMITS = {
  coverMaxBytes: 5 * 1024 * 1024, // 5 MB
  avatarMaxBytes: 2 * 1024 * 1024, // 2 MB
  manuscriptMaxBytes: 5 * 1024 * 1024, // 5 MB
  imageMimeTypes: ["image/jpeg", "image/png", "image/webp"] as const,
  manuscriptMimeTypes: [
    "text/plain",
    "text/markdown",
    "application/octet-stream", // some browsers use this for .txt
  ] as const,
} as const;

// ---------------------------------------------------------------------------
// Text limits
// ---------------------------------------------------------------------------
export const TEXT_LIMITS = {
  username: { min: 3, max: 24 },
  displayName: { min: 2, max: 60 },
  bio: { max: 500 },
  tagline: { max: 80 },
  storyTitle: { min: 2, max: 200 },
  storySynopsis: { max: 1000 },
  chapterTitle: { max: 120 },
  pollQuestion: { max: 200 },
  pollDescription: { max: 400 },
  pollOption: { max: 120 },
  pollOptions: { min: 2, max: 6 },
  sparkNote: { max: 500 },
  deskBrief: { max: 1000 },
  inviteMessage: { max: 300 },
} as const;

// ---------------------------------------------------------------------------
// Story tags — max per story
// ---------------------------------------------------------------------------
export const MAX_TAGS_PER_STORY = 15;
export const MAX_TAGS_DISPLAYED = 4;

// ---------------------------------------------------------------------------
// Storage bucket names (mirrors api/supabase.ts BUCKETS)
// ---------------------------------------------------------------------------
export const BUCKETS = {
  COVERS: "covers",
  AVATARS: "avatars",
  AUDIO: "audio",
} as const;

// ---------------------------------------------------------------------------
// Query defaults
// ---------------------------------------------------------------------------
export const PAGE_SIZE = 24;
export const LEDGER_PAGE_SIZE = 50;

// ---------------------------------------------------------------------------
// Timing (ms)
// ---------------------------------------------------------------------------
export const TIMING = {
  autosaveDelay: 1500,
  readingProgressDebounce: 2000,
  toastDuration: 4000,
  toastErrorDuration: 6000,
  sparkReconcileDelay: 500,
  auditDebounce: 300,
} as const;

// ---------------------------------------------------------------------------
// Local storage keys — single source of truth so nothing collides
// ---------------------------------------------------------------------------
export const STORAGE_KEYS = {
  theme: "foliosparks:theme",
  readerPrefs: "foliosparks:reader-prefs",
  audioVolume: "foliosparks:audio-volume",
  audioRate: "foliosparks:audio-rate",
  auth: "foliosparks-auth",
} as const;

// ---------------------------------------------------------------------------
// Route paths — avoid magic strings in navigate() calls
// ---------------------------------------------------------------------------
export const ROUTES = {
  home: "/",
  library: "/library",
  membership: "/membership",
  signIn: "/signin",
  signUp: "/signup",
  onboarding: "/onboarding",
  checkoutSuccess: "/checkout/success",
  studio: "/studio",
  studioNew: "/studio/new",
  donationSettings: "/studio/settings/donations",
  readerLibrary: "/me/library",

  // Auth hand-offs
  /** Post-auth landing — resolves to /studio, /me/library or /onboarding */
  dashboard: "/dashboard",
  /** Supabase redirect target for email links + Google OAuth */
  authCallback: "/auth/callback",
  /** "Check your inbox" after sign-up when confirmation is required */
  verifyEmail: "/verify-email",

  // Dynamic builders
  story: (slug: string) => `/story/${slug}`,
  reader: (slug: string, chapterNumber: number) =>
    `/read/${slug}/${chapterNumber}`,
  studioStory: (storyId: string) => `/studio/story/${storyId}`,
  studioPublish: (storyId: string) => `/studio/story/${storyId}/publish`,
  studioChapter: (storyId: string, num: number) =>
    `/studio/story/${storyId}/chapter/${num}`,
  studioAnalytics: (storyId: string) => `/studio/story/${storyId}/analytics`,
  authorProfile: (username: string) => `/@${username}`,
} as const;

// ---------------------------------------------------------------------------
// Genre slug list — mirrors the seeded genres table
// Used for validation before the DB responds.
// ---------------------------------------------------------------------------
export const VALID_GENRES = [
  "epic-fantasy",
  "fantasy",
  "sci-fi",
  "mystery",
  "romance",
  "thriller",
  "horror",
  "literary",
  "historical",
  "contemporary",
  "adventure",
  "paranormal",
  "dystopian",
  "comedy",
  "drama",
  "poetry",
] as const;

export type ValidGenre = (typeof VALID_GENRES)[number];

// ---------------------------------------------------------------------------
// Donation platform labels
// ---------------------------------------------------------------------------
export const PLATFORM_LABELS: Record<string, string> = {
  patreon: "Patreon",
  ko_fi: "Ko-fi",
  buymeacoffee: "Buy Me a Coffee",
  paypal: "PayPal",
  stripe: "Stripe",
  cashapp: "Cash App",
  venmo: "Venmo",
  custom: "Support",
};

// ---------------------------------------------------------------------------
// External links
// ---------------------------------------------------------------------------
export const EXTERNAL_LINKS = {
  twitter: "https://twitter.com/foliosparks",
  discord: "https://discord.gg/foliosparks",
  email: "hello@foliosparks.com",
  terms: "/terms",
  privacy: "/privacy",
} as const;
