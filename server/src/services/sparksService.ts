import type { Json, SparkReason } from "../types/database.js";

import { supabaseAdmin } from "../config/supabase.js";
import { HttpError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

// ============================================================
// Types
// ============================================================
interface SpendInput {
  userId: string;
  chapterId: string;
  amount: number;
  note?: string;
}

interface LedgerOptions {
  limit?: number;
  offset?: number;
  reason?: SparkReason;
}

interface SparkEntry {
  id: string;
  user_id: string;
  delta: number;
  reason: SparkReason;
  chapter_id: string | null;
  story_id: string | null;
  author_id: string | null;
  note: string | null;
  created_at: string;
}

// ============================================================
// Balance
// ============================================================
export async function getBalance(userId: string): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from("spark_balances")
    .select("balance")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    logger.error("getBalance failed", { userId, error: error.message });
    return 0;
  }
  return data?.balance ?? 0;
}

// ============================================================
// Ledger
// ============================================================
export async function getLedger(
  userId: string,
  opts: LedgerOptions = {},
): Promise<SparkEntry[]> {
  const { limit = 50, offset = 0, reason } = opts;

  let query = supabaseAdmin
    .from("spark_ledger")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (reason)
    query = query.eq("reason", reason);

  const { data, error } = await query;
  if (error)
    throw HttpError.internal("Failed to load ledger");
  return data ?? [];
}

// ============================================================
// Spend — atomic via RPC
// ============================================================
export async function spend(input: SpendInput): Promise<SparkEntry> {
  const { userId, chapterId, amount, note } = input;

  const { data, error } = await supabaseAdmin.rpc("spend_sparks", {
    p_user_id: userId,
    p_chapter_id: chapterId,
    p_amount: amount,
    p_note: note ?? null,
  });

  if (error) {
    // The RPC raises exceptions for insufficient balance etc.
    const message = error.message ?? "Could not send Sparks";

    if (message.includes("INSUFFICIENT_SPARKS")) {
      throw HttpError.badRequest("Not enough Sparks");
    }
    if (message.includes("CHAPTER_NOT_FOUND")) {
      throw HttpError.notFound("Chapter not found");
    }

    logger.error("spend_sparks RPC failed", {
      userId,
      chapterId,
      error: message,
    });
    throw HttpError.internal("Could not send Sparks");
  }

  logger.info("Sparks sent", { userId, chapterId, amount });
  return data as unknown as SparkEntry;
}

// ============================================================
// Totals — public
// ============================================================
export async function getChapterTotal(chapterId: string): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from("chapter_spark_totals")
    .select("sparks_received")
    .eq("chapter_id", chapterId)
    .maybeSingle();

  if (error)
    return 0;
  return data?.sparks_received ?? 0;
}

export async function getAuthorTotal(authorId: string): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from("author_spark_totals")
    .select("sparks_received")
    .eq("author_id", authorId)
    .maybeSingle();

  if (error)
    return 0;
  return data?.sparks_received ?? 0;
}

// ============================================================
// Author side — sparks received on my chapters
// ============================================================
export async function getRecentForAuthor(
  authorId: string,
  limit = 20,
): Promise<SparkEntry[]> {
  const { data, error } = await supabaseAdmin
    .from("spark_ledger")
    .select("*")
    .eq("author_id", authorId)
    .eq("reason", "chapter_spark")
    .lt("delta", 0)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error)
    throw HttpError.internal("Failed to load recent Sparks");
  return data ?? [];
}

// ============================================================
// Reader side — sparks I've sent
// ============================================================
export async function getSent(
  userId: string,
  limit = 30,
): Promise<SparkEntry[]> {
  const { data, error } = await supabaseAdmin
    .from("spark_ledger")
    .select("*")
    .eq("user_id", userId)
    .eq("reason", "chapter_spark")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error)
    throw HttpError.internal("Failed to load sent Sparks");
  return data ?? [];
}

// ============================================================
// Grant — used by cron job and admin tools
// ============================================================
export async function grant(
  userId: string,
  amount: number,
  reason: SparkReason,
  metadata?: Json,
): Promise<void> {
  const { error } = await supabaseAdmin.from("spark_ledger").insert({
    user_id: userId,
    delta: amount,
    reason,
    metadata: metadata ?? {},
  });

  if (error) {
    logger.error("Failed to grant Sparks", {
      userId,
      amount,
      error: error.message,
    });
    throw HttpError.internal("Could not grant Sparks");
  }

  logger.info("Sparks granted", { userId, amount, reason });
}
