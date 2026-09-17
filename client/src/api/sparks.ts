import type { ApiResult } from "./supabase";

import { err, ok, supabase } from "./supabase";

type SparkReason = string;

interface SparkLedgerEntry {
  id: string;
  user_id: string;
  chapter_id?: string | null;
  author_id?: string | null;
  delta: number;
  reason: SparkReason;
  note?: string | null;
  created_at: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Get current balance (uses the spark_balances view)
// ---------------------------------------------------------------------------
export async function getBalance(
  userId: string,
): Promise<ApiResult<number>> {
  const { data, error } = await supabase
    .from("spark_balances")
    .select("balance")
    .eq("user_id", userId)
    .maybeSingle();

  if (error)
    return err(error.message);
  return ok((data as { balance?: number } | null)?.balance ?? 0);
}

// ---------------------------------------------------------------------------
// Fetch ledger entries (user"s own history)
// ---------------------------------------------------------------------------
export interface LedgerOptions {
  limit?: number;
  offset?: number;
  reason?: SparkReason;
}

export async function getLedger(
  userId: string,
  opts: LedgerOptions = {},
): Promise<ApiResult<SparkLedgerEntry[]>> {
  const { limit = 50, offset = 0, reason } = opts;

  let query = supabase
    .from("spark_ledger")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (reason)
    query = query.eq("reason", reason);

  const { data, error } = await query;
  if (error)
    return err(error.message);
  return ok(data ?? []);
}

// ---------------------------------------------------------------------------
// Spend sparks on a chapter (atomic — uses spend_sparks RPC)
// ---------------------------------------------------------------------------
export interface SpendSparksInput {
  chapterId: string;
  amount: number;
  note?: string;
}

export async function spendSparks(
  input: SpendSparksInput,
): Promise<ApiResult<SparkLedgerEntry>> {
  const { data: userData, error: userError }
    = await supabase.auth.getUser();
  if (userError || !userData.user)
    return err("Not authenticated");

  const { data, error } = await supabase.rpc("spend_sparks" as never, {
    p_user_id: userData.user.id,
    p_chapter_id: input.chapterId,
    p_amount: input.amount,
    p_note: input.note ?? null,
  } as never);

  if (error)
    return err(error.message);
  return ok(data as unknown as SparkLedgerEntry);
}

// ---------------------------------------------------------------------------
// Sparks received by a chapter (public)
// ---------------------------------------------------------------------------
export async function getChapterSparkTotal(
  chapterId: string,
): Promise<ApiResult<number>> {
  const { data, error } = await supabase
    .from("chapter_spark_totals")
    .select("sparks_received")
    .eq("chapter_id", chapterId)
    .maybeSingle();

  if (error)
    return err(error.message);
  return ok(
    (data as { sparks_received?: number } | null)?.sparks_received ?? 0,
  );
}

// ---------------------------------------------------------------------------
// Sparks received by an author (public)
// ---------------------------------------------------------------------------
export async function getAuthorSparkTotal(
  authorId: string,
): Promise<ApiResult<number>> {
  const { data, error } = await supabase
    .from("author_spark_totals")
    .select("sparks_received")
    .eq("author_id", authorId)
    .maybeSingle();

  if (error)
    return err(error.message);
  return ok(
    (data as { sparks_received?: number } | null)?.sparks_received ?? 0,
  );
}

// ---------------------------------------------------------------------------
// Recent sparks landing on an author (for the "Sparks received" feed)
// ---------------------------------------------------------------------------
export async function getRecentSparksForAuthor(
  authorId: string,
  limit = 20,
): Promise<ApiResult<SparkLedgerEntry[]>> {
  const { data, error } = await supabase
    .from("spark_ledger")
    .select("*")
    .eq("author_id", authorId)
    .eq("reason", "chapter_spark")
    .lt("delta", 0)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error)
    return err(error.message);
  return ok(data ?? []);
}

// ---------------------------------------------------------------------------
// Sparks sent by a reader (their giving history)
// ---------------------------------------------------------------------------
export async function getSparksSent(
  userId: string,
  limit = 30,
): Promise<ApiResult<SparkLedgerEntry[]>> {
  const { data, error } = await supabase
    .from("spark_ledger")
    .select("*")
    .eq("user_id", userId)
    .eq("reason", "chapter_spark")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error)
    return err(error.message);
  return ok(data ?? []);
}
