import type { Database, StoryStatus } from "../types/database.js";

import { supabaseAdmin } from "../config/supabase.js";
import { HttpError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";
import { slugify } from "./supabaseService.js";

// ============================================================
// Types
// ============================================================
interface ListOptions {
  genre?: string;
  tag?: string;
  status?: StoryStatus;
  search?: string;
  limit?: number;
  offset?: number;
  orderBy?: "published_at" | "spark_count" | "read_count" | "updated_at";
}

interface CreateStoryInput {
  author_id: string;
  title: string;
  slug: string;
  synopsis?: string;
  cover_url?: string | null;
  genre: string;
  tags?: string[];
  content_rating?: "general" | "teen" | "mature";
  language?: string;
  publish_mode?: "full_manuscript" | "chapter_by_chapter";
  allows_polls?: boolean;
  allows_sparks?: boolean;
  is_open_desk?: boolean;
  is_donation_enabled?: boolean;
}

// ============================================================
// List
// ============================================================
export async function list(opts: ListOptions = {}) {
  const {
    genre,
    tag,
    status,
    search,
    limit = 24,
    offset = 0,
    orderBy = "published_at",
  } = opts;

  let query = supabaseAdmin
    .from("stories")
    .select("*")
    .in("status", status ? [status] : ["ongoing", "completed", "hiatus"])
    .order(orderBy, { ascending: false })
    .range(offset, offset + limit - 1);

  if (genre)
    query = query.eq("genre", genre);
  if (tag)
    query = query.contains("tags", [tag]);
  if (search)
    query = query.ilike("title", `%${search}%`);

  const { data, error } = await query;
  if (error)
    throw HttpError.internal("Failed to load stories");
  return data ?? [];
}

// ============================================================
// Burning now
// ============================================================
export async function burningNow(limit = 6) {
  const { data, error } = await supabaseAdmin
    .from("stories")
    .select("*")
    .in("status", ["ongoing"])
    .order("spark_count", { ascending: false })
    .limit(limit);

  if (error)
    return [];
  return data ?? [];
}

// ============================================================
// Get one
// ============================================================
export async function getBySlug(slug: string) {
  const { data } = await supabaseAdmin
    .from("stories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return data;
}

export async function getById(id: string) {
  const { data } = await supabaseAdmin
    .from("stories")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}

// ============================================================
// By author
// ============================================================
export async function listByAuthor(authorId: string, includeDrafts: boolean) {
  let query = supabaseAdmin
    .from("stories")
    .select("*")
    .eq("author_id", authorId)
    .order("updated_at", { ascending: false });

  if (!includeDrafts) {
    query = query.in("status", ["ongoing", "completed", "hiatus"]);
  }

  const { data, error } = await query;
  if (error)
    throw HttpError.internal("Failed to load author stories");
  return data ?? [];
}

// ============================================================
// Create
// ============================================================
export async function create(input: CreateStoryInput) {
  // Ensure unique slug
  let slug = input.slug || slugify(input.title);
  let attempt = 0;

  while (attempt < 5) {
    const { data: existing } = await supabaseAdmin
      .from("stories")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!existing)
      break;

    attempt++;
    slug = `${slugify(input.title)}-${attempt + 1}`;
  }

  const { data, error } = await supabaseAdmin
    .from("stories")
    .insert({
      author_id: input.author_id,
      title: input.title,
      slug,
      synopsis: input.synopsis ?? null,
      cover_url: input.cover_url ?? null,
      genre: input.genre,
      tags: input.tags ?? [],
      content_rating: input.content_rating ?? "general",
      language: input.language ?? "en",
      publish_mode: input.publish_mode ?? "chapter_by_chapter",
      allows_polls: input.allows_polls ?? true,
      allows_sparks: input.allows_sparks ?? true,
      is_open_desk: input.is_open_desk ?? false,
      is_donation_enabled: input.is_donation_enabled ?? true,
      status: "draft",
    })
    .select()
    .single();

  if (error || !data) {
    logger.error("Story create failed", { error: error?.message });
    throw HttpError.internal("Could not create story");
  }

  logger.info("Story created", { storyId: data.id, authorId: input.author_id });
  return data;
}

// ============================================================
// Update
// ============================================================
// Columns a client is allowed to change on an existing story
type StoryUpdateInput = Database["public"]["Tables"]["stories"]["Update"];

export async function update(id: string, updates: StoryUpdateInput) {
  const { data, error } = await supabaseAdmin
    .from("stories")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !data)
    throw HttpError.internal("Could not update story");
  return data;
}

// ============================================================
// Publish
// ============================================================
export async function publish(id: string) {
  const { data, error } = await supabaseAdmin
    .from("stories")
    .update({
      status: "ongoing",
      published_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !data)
    throw HttpError.internal("Could not publish story");
  logger.info("Story published", { storyId: id });
  return data;
}

// ============================================================
// Delete
// ============================================================
export async function remove(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from("stories").delete().eq("id", id);
  if (error)
    throw HttpError.internal("Could not delete story");
  logger.info("Story deleted", { storyId: id });
}
