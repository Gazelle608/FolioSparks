import { supabaseAdmin } from "../config/supabase.js";
import { HttpError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

// ============================================================
// List
// ============================================================
export async function list(storyId: string, includeUnpublished: boolean) {
  let query = supabaseAdmin
    .from("chapters")
    .select("*")
    .eq("story_id", storyId)
    .order("chapter_number", { ascending: true });

  if (!includeUnpublished) {
    query = query.eq("is_published", true);
  }

  const { data, error } = await query;
  if (error)
    throw HttpError.internal("Failed to load chapters");
  return data ?? [];
}

// ============================================================
// Get one
// ============================================================
export async function getById(id: string) {
  const { data } = await supabaseAdmin
    .from("chapters")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function getByNumber(storyId: string, num: number) {
  const { data } = await supabaseAdmin
    .from("chapters")
    .select("*")
    .eq("story_id", storyId)
    .eq("chapter_number", num)
    .maybeSingle();
  return data;
}

// ============================================================
// Create
// ============================================================
interface CreateChapterInput {
  story_id: string;
  author_id: string;
  chapter_number: number;
  title?: string;
  content: string;
  is_published?: boolean;
  scheduled_for?: string;
}

export async function create(input: CreateChapterInput) {
  const { data, error } = await supabaseAdmin
    .from("chapters")
    .insert({
      story_id: input.story_id,
      author_id: input.author_id,
      chapter_number: input.chapter_number,
      title: input.title ?? null,
      content: input.content,
      is_published: input.is_published ?? false,
      published_at: input.is_published ? new Date().toISOString() : null,
      scheduled_for: input.scheduled_for ?? null,
    })
    .select()
    .single();

  if (error || !data) {
    logger.error("Chapter create failed", { error: error?.message });
    throw HttpError.internal("Could not create chapter");
  }
  return data;
}

// ============================================================
// Bulk create (full manuscript path)
// ============================================================
interface BulkCreateInput {
  story_id: string;
  author_id: string;
  chapters: Array<{ chapter_number: number; title?: string; content: string }>;
  publishNow: boolean;
}

export async function bulkCreate(input: BulkCreateInput) {
  const now = new Date().toISOString();
  const rows = input.chapters.map(c => ({
    story_id: input.story_id,
    author_id: input.author_id,
    chapter_number: c.chapter_number,
    title: c.title ?? `Chapter ${c.chapter_number}`,
    content: c.content,
    is_published: input.publishNow,
    published_at: input.publishNow ? now : null,
  }));

  const { data, error } = await supabaseAdmin
    .from("chapters")
    .insert(rows)
    .select();

  if (error || !data) {
    logger.error("Bulk chapter create failed", { error: error?.message });
    throw HttpError.internal("Could not create chapters");
  }

  logger.info("Bulk chapters created", {
    storyId: input.story_id,
    count: data.length,
  });
  return data;
}

// ============================================================
// Update
// ============================================================
export async function update(
  id: string,
  updates: {
    title?: string | null;
    content?: string;
    scheduled_for?: string | null;
  },
) {
  const { data, error } = await supabaseAdmin
    .from("chapters")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error || !data)
    throw HttpError.internal("Could not update chapter");
  return data;
}

// ============================================================
// Publish / unpublish / schedule
// ============================================================
export async function publish(id: string) {
  const { data, error } = await supabaseAdmin
    .from("chapters")
    .update({
      is_published: true,
      published_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !data)
    throw HttpError.internal("Could not publish chapter");
  return data;
}

export async function unpublish(id: string) {
  const { data, error } = await supabaseAdmin
    .from("chapters")
    .update({ is_published: false, published_at: null })
    .eq("id", id)
    .select()
    .single();

  if (error || !data)
    throw HttpError.internal("Could not unpublish chapter");
  return data;
}

export async function schedule(id: string, scheduledFor: string) {
  const { data, error } = await supabaseAdmin
    .from("chapters")
    .update({ is_published: false, scheduled_for: scheduledFor })
    .eq("id", id)
    .select()
    .single();

  if (error || !data)
    throw HttpError.internal("Could not schedule chapter");
  return data;
}

// ============================================================
// Delete
// ============================================================
export async function remove(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from("chapters").delete().eq("id", id);
  if (error)
    throw HttpError.internal("Could not delete chapter");
}

// ============================================================
// Record read
// ============================================================
export async function recordRead(id: string): Promise<void> {
  // Increment read counts. Fire-and-forget.
  const { data: chapter } = await supabaseAdmin
    .from("chapters")
    .select("read_count, story_id")
    .eq("id", id)
    .maybeSingle();

  if (!chapter)
    return;

  await supabaseAdmin
    .from("chapters")
    .update({ read_count: (chapter.read_count ?? 0) + 1 })
    .eq("id", id);

  const { data: story } = await supabaseAdmin
    .from("stories")
    .select("read_count")
    .eq("id", chapter.story_id)
    .maybeSingle();

  if (story) {
    await supabaseAdmin
      .from("stories")
      .update({ read_count: (story.read_count ?? 0) + 1 })
      .eq("id", chapter.story_id);
  }
}

// ============================================================
// Adjacent chapters
// ============================================================
export async function getAdjacent(storyId: string, num: number) {
  const [prev, next] = await Promise.all([
    supabaseAdmin
      .from("chapters")
      .select("*")
      .eq("story_id", storyId)
      .eq("is_published", true)
      .lt("chapter_number", num)
      .order("chapter_number", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabaseAdmin
      .from("chapters")
      .select("*")
      .eq("story_id", storyId)
      .eq("is_published", true)
      .gt("chapter_number", num)
      .order("chapter_number", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    previous: prev.data ?? null,
    next: next.data ?? null,
  };
}
