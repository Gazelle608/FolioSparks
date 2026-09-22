import type { Database } from "../types/database.js";

import { supabaseAdmin } from "../config/supabase.js";
import { HttpError } from "../utils/errors.js";

// ============================================================
// Types
// ============================================================
// Platform values come from the DB enum (mirrored in utils/constants.ts)
type DonationPlatform = Database["public"]["Enums"]["donation_platform"];

export async function listByAuthor(authorId: string) {
  const { data } = await supabaseAdmin
    .from("donation_links")
    .select("*")
    .eq("author_id", authorId)
    .eq("is_active", true)
    .order("display_order", { ascending: true });
  return data ?? [];
}

export async function getById(id: string) {
  const { data } = await supabaseAdmin
    .from("donation_links")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function create(input: {
  author_id: string;
  platform: DonationPlatform;
  url: string;
  label?: string;
  is_primary?: boolean;
  display_order?: number;
}) {
  const { data, error } = await supabaseAdmin
    .from("donation_links")
    .insert({
      author_id: input.author_id,
      platform: input.platform,
      url: input.url,
      label: input.label ?? null,
      is_primary: input.is_primary ?? false,
      display_order: input.display_order ?? 0,
    })
    .select()
    .single();

  if (error || !data)
    throw HttpError.internal("Could not create link");
  return data;
}

export async function update(id: string, updates: Record<string, unknown>) {
  const { data, error } = await supabaseAdmin
    .from("donation_links")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error || !data)
    throw HttpError.internal("Could not update link");
  return data;
}

export async function remove(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("donation_links")
    .delete()
    .eq("id", id);
  if (error)
    throw HttpError.internal("Could not delete link");
}

export async function trackClick(input: {
  author_id: string;
  platform: DonationPlatform;
  clicked_by: string | null;
}): Promise<void> {
  await supabaseAdmin.from("donation_clicks").insert({
    author_id: input.author_id,
    platform: input.platform,
    clicked_by: input.clicked_by,
  });
}
