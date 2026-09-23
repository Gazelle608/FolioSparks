import type { ApiResult } from "./supabase";

import { err, ok, supabase } from "./supabase";

interface Chapter {
  id: string;
  story_id: string;
  author_id: string;
  chapter_number: number;
  title?: string;
  content: string;
  is_published: boolean;
  published_at?: string | null;
  scheduled_for?: string | null;
}

// ---------------------------------------------------------------------------
// Get chapters for a story (ordered)
// ---------------------------------------------------------------------------
export async function listChapters(
  storyId: string,
  includeUnpublished = false,
): Promise<ApiResult<Chapter[]>> {
  let query = supabase
    .from("chapters")
    .select("*")
    .eq("story_id", storyId)
    .order("chapter_number", { ascending: true });

  if (!includeUnpublished) {
    query = query.eq("is_published", true);
  }

  const { data, error } = await query;
  if (error)
    return err(error.message);
  return ok(data ?? []);
}

// ---------------------------------------------------------------------------
// Get one chapter
// ---------------------------------------------------------------------------
export async function getChapter(
  chapterId: string,
): Promise<ApiResult<Chapter>> {
  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("id", chapterId)
    .single();

  if (error)
    return err(error.message);
  return ok(data);
}

// ---------------------------------------------------------------------------
// Get chapter by story + number (used by reader navigation)
// ---------------------------------------------------------------------------
export async function getChapterByNumber(
  storyId: string,
  chapterNumber: number,
): Promise<ApiResult<Chapter>> {
  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("story_id", storyId)
    .eq("chapter_number", chapterNumber)
    .single();

  if (error)
    return err(error.message);
  return ok(data);
}

// ---------------------------------------------------------------------------
// Create chapter (draft)
// ---------------------------------------------------------------------------
export interface CreateChapterInput {
  story_id: string;
  author_id: string;
  chapter_number: number;
  title?: string;
  content: string;
  is_published?: boolean;
  scheduled_for?: string;
}

export async function createChapter(
  input: CreateChapterInput,
): Promise<ApiResult<Chapter>> {
  const { data, error } = await supabase
    .from("chapters")
    .insert({
      ...input,
      is_published: input.is_published ?? false,
      published_at: input.is_published ? new Date().toISOString() : null,
    } as never)
    .select()
    .single();

  if (error)
    return err(error.message);
  return ok(data);
}

// ---------------------------------------------------------------------------
// Bulk create chapters (full manuscript path)
// ---------------------------------------------------------------------------
export interface BulkChapterInput {
  story_id: string;
  author_id: string;
  chapters: Array<{
    chapter_number: number;
    title?: string;
    content: string;
  }>;
  publishNow?: boolean;
}

export async function bulkCreateChapters(
  input: BulkChapterInput,
): Promise<ApiResult<Chapter[]>> {
  const now = new Date().toISOString();

  const rows = input.chapters.map(c => ({
    story_id: input.story_id,
    author_id: input.author_id,
    chapter_number: c.chapter_number,
    title: c.title ?? `Chapter ${c.chapter_number}`,
    content: c.content,
    is_published: input.publishNow ?? false,
    published_at: input.publishNow ? now : null,
  }));

  const { data, error } = await supabase
    .from("chapters")
    .insert(rows as never[])
    .select();

  if (error)
    return err(error.message);
  return ok(data ?? []);
}

// ---------------------------------------------------------------------------
// Update chapter
// ---------------------------------------------------------------------------
export interface UpdateChapterInput {
  title?: string;
  content?: string;
  scheduled_for?: string | null;
}

export async function updateChapter(
  chapterId: string,
  updates: UpdateChapterInput,
): Promise<ApiResult<Chapter>> {
  const { data, error } = await supabase
    .from("chapters")
    .update(updates as never)
    .eq("id", chapterId)
    .select()
    .single();

  if (error)
    return err(error.message);
  return ok(data);
}

// ---------------------------------------------------------------------------
// Publish chapter
// ---------------------------------------------------------------------------
export async function publishChapter(
  chapterId: string,
): Promise<ApiResult<Chapter>> {
  const { data, error } = await supabase
    .from("chapters")
    .update({
      is_published: true,
      published_at: new Date().toISOString(),
    } as never)
    .eq("id", chapterId)
    .select()
    .single();

  if (error)
    return err(error.message);
  return ok(data);
}

// ---------------------------------------------------------------------------
// Schedule chapter
// ---------------------------------------------------------------------------
export async function scheduleChapter(
  chapterId: string,
  scheduledFor: string,
): Promise<ApiResult<Chapter>> {
  const { data, error } = await supabase
    .from("chapters")
    .update({ scheduled_for: scheduledFor, is_published: false } as never)
    .eq("id", chapterId)
    .select()
    .single();

  if (error)
    return err(error.message);
  return ok(data);
}

// ---------------------------------------------------------------------------
// Unpublish chapter
// ---------------------------------------------------------------------------
export async function unpublishChapter(
  chapterId: string,
): Promise<ApiResult<Chapter>> {
  const { data, error } = await supabase
    .from("chapters")
    .update({ is_published: false, published_at: null } as never)
    .eq("id", chapterId)
    .select()
    .single();

  if (error)
    return err(error.message);
  return ok(data);
}

// ---------------------------------------------------------------------------
// Delete chapter
// ---------------------------------------------------------------------------
export async function deleteChapter(
  chapterId: string,
): Promise<ApiResult<null>> {
  const { error } = await supabase
    .from("chapters")
    .delete()
    .eq("id", chapterId);
  if (error)
    return err(error.message);
  return ok(null);
}

// ---------------------------------------------------------------------------
// Increment read count (fire-and-forget from reader page)
// ---------------------------------------------------------------------------
export async function recordRead(chapterId: string): Promise<void> {
  // Uses RPC defined in your DB or a simple update
  await supabase.rpc(
    "increment_chapter_reads",
    { p_chapter_id: chapterId } as never,
  );
}

// ---------------------------------------------------------------------------
// Next chapter helper
// ---------------------------------------------------------------------------
export async function getAdjacentChapters(
  storyId: string,
  currentNumber: number,
): Promise<ApiResult<{ previous: Chapter | null; next: Chapter | null }>> {
  const [prev, next] = await Promise.all([
    supabase
      .from("chapters")
      .select("*")
      .eq("story_id", storyId)
      .eq("is_published", true)
      .lt("chapter_number", currentNumber)
      .order("chapter_number", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("chapters")
      .select("*")
      .eq("story_id", storyId)
      .eq("is_published", true)
      .gt("chapter_number", currentNumber)
      .order("chapter_number", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  if (prev.error)
    return err(prev.error.message);
  if (next.error)
    return err(next.error.message);

  return ok({
    previous: prev.data ?? null,
    next: next.data ?? null,
  });
}
