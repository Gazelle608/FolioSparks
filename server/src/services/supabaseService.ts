import type { PostgrestError } from "@supabase/supabase-js";

import type { Database } from "../types/database.js";

import { supabaseAdmin } from "../config/supabase.js";
import { HttpError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

// ============================================================
// Dynamic-table helpers
// ------------------------------------------------------------
// PostgREST's client is typed per generated table, so a helper that
// accepts a runtime table name can't be checked statically. We narrow
// once, here, so the rest of the file stays type-safe.
// ============================================================
type TableName = keyof Database["public"]["Tables"];

interface DynamicResult {
  data: unknown;
  count: number | null;
  error: PostgrestError | null;
}

interface DynamicQuery extends PromiseLike<DynamicResult> {
  eq: (column: string, value: string | number) => DynamicQuery;
  single: () => PromiseLike<DynamicResult>;
  maybeSingle: () => PromiseLike<DynamicResult>;
}

interface DynamicTable {
  select: (
    columns: string,
    options?: { count?: "exact"; head?: boolean },
  ) => DynamicQuery;
  update: (values: Record<string, unknown>) => DynamicQuery;
}

function dynamicTable(name: TableName): DynamicTable {
  return supabaseAdmin.from(name) as unknown as DynamicTable;
}

// ============================================================
// Query wrapper — throws HttpError on failure
// ============================================================
export function unwrap<T>(
  data: T | null,
  error: PostgrestError | null,
  context: string,
): T {
  if (error) {
    logger.error(`Supabase error in ${context}`, {
      code: error.code,
      message: error.message,
      details: error.details,
    });
    throw HttpError.internal(`Database error: ${context}`);
  }
  if (data === null) {
    throw HttpError.notFound(context);
  }
  return data;
}

// ============================================================
// queryOne — fetch a single row or null (doesn't throw on missing)
// ============================================================
export async function queryOne<T = Record<string, unknown>>(
  table: TableName,
  column: string,
  value: string | number,
): Promise<T | null> {
  const { data, error } = await dynamicTable(table)
    .select("*")
    .eq(column, value)
    .maybeSingle();

  if (error) {
    logger.error(`queryOne failed`, { table, column, error: error.message });
    throw HttpError.internal(`Database error on ${table}`);
  }
  return (data ?? null) as T | null;
}

// ============================================================
// exists — check if a row exists
// ============================================================
export async function exists(
  table: TableName,
  column: string,
  value: string | number,
): Promise<boolean> {
  const { count, error } = await dynamicTable(table)
    .select(column, { count: "exact", head: true })
    .eq(column, value);

  if (error) {
    logger.error(`exists failed`, { table, column, error: error.message });
    return false;
  }
  return (count ?? 0) > 0;
}

// ============================================================
// increment — atomic counter bump via RPC-style update
// ============================================================
export async function increment(
  table: TableName,
  id: string,
  column: string,
  by = 1,
): Promise<void> {
  // Supabase doesn't support atomic increments directly, so we
  // read-modify-write. For high-traffic counters, use a DB function.
  const { data, error } = await dynamicTable(table)
    .select(column)
    .eq("id", id)
    .single();

  if (error || !data)
    return;

  const current = (data as Record<string, number>)[column] ?? 0;
  await dynamicTable(table)
    .update({ [column]: current + by })
    .eq("id", id);
}

// ============================================================
// slug helpers — used by storyService
// ============================================================
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036F]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

// ============================================================
// Storage helpers
// ============================================================
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn = 900,
): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error || !data) {
    throw HttpError.internal("Could not sign storage URL");
  }
  return data.signedUrl;
}

export async function deleteStorageObject(
  bucket: string,
  path: string,
): Promise<void> {
  await supabaseAdmin.storage.from(bucket).remove([path]);
}
