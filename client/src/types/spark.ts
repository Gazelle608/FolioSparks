// ============================================================
// Sparks — the engagement currency
// Mirrors: public.spark_ledger, views
// ============================================================

// Postgres enum
export type SparkReason =
  | 'signup_bonus'
  | 'monthly_grant'
  | 'chapter_spark'      // spending
  | 'poll_reward'
  | 'admin_adjustment'
  | 'referral_bonus';

// ---------------------------------------------------------------------------
// Ledger row
// ---------------------------------------------------------------------------
export interface SparkLedgerEntry {
  id: string;
  user_id: string;
  delta: number;         // + grant, - spend
  reason: SparkReason;
  chapter_id: string | null;
  story_id: string | null;
  author_id: string | null;
  note: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Insert shape
// ---------------------------------------------------------------------------
export interface SparkLedgerInsert {
  user_id: string;
  delta: number;
  reason: SparkReason;
  chapter_id?: string | null;
  story_id?: string | null;
  author_id?: string | null;
  note?: string | null;
  metadata?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// View shapes
// ---------------------------------------------------------------------------
export interface SparkBalance {
  user_id: string;
  balance: number;
}

export interface ChapterSparkTotal {
  chapter_id: string;
  sparks_received: number;
}

export interface AuthorSparkTotal {
  author_id: string;
  sparks_received: number;
}

// ---------------------------------------------------------------------------
// Action payloads
// ---------------------------------------------------------------------------
export interface SpendSparksInput {
  chapterId: string;
  amount: number;
  note?: string;
}

// ---------------------------------------------------------------------------
// UI-facing types
// ---------------------------------------------------------------------------
export interface SparkDisplayTier {
  label: string;
  color: 'spark' | 'primary' | 'danger';
}

export interface SparkLedgerOptions {
  limit?: number;
  offset?: number;
  reason?: SparkReason;
}