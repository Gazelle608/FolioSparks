import type { ApiResult } from "./supabase";

import { err, getCoverUrl, ok, supabase } from "./supabase";

type Story = Record<string, unknown>;
type StoryStatus = "draft" | "ongoing" | "completed" | "hiatus";
type PublishMode = string;
type ContentRating = string;

// ---------------------------------------------------------------------------
// List published stories (library + homepage)
// ---------------------------------------------------------------------------
export interface ListStoriesOptions {
  genre?: string;
  tag?: string;
  status?: StoryStatus;
  search?: string;
  limit?: number;
  offset?: number;
  orderBy?: "published_at" | "spark_count" | "read_count";
}

export async function listStories(
  opts: ListStoriesOptions = {},
): Promise<ApiResult<Story[]>> {
  const {
    genre,
    tag,
    status,
    search,
    limit = 24,
    offset = 0,
    orderBy = "published_at",
  } = opts;

  let query = supabase
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
    return err(error.message);
  return ok(data ?? []);
}

// ---------------------------------------------------------------------------
// Get one story by slug (public view)
// ---------------------------------------------------------------------------
export async function getStoryBySlug(slug: string): Promise<ApiResult<Story>> {
  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error)
    return err(error.message);
  return ok(data);
}

// ---------------------------------------------------------------------------
// Get one story by id (author view — includes drafts)
// ---------------------------------------------------------------------------
export async function getStoryById(id: string): Promise<ApiResult<Story>> {
  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .eq("id", id)
    .single();

  if (error)
    return err(error.message);
  return ok(data);
}

// ---------------------------------------------------------------------------
// Stories by author
// ---------------------------------------------------------------------------
export async function getStoriesByAuthor(
  authorId: string,
  includeDrafts = false,
): Promise<ApiResult<Story[]>> {
  let query = supabase
    .from("stories")
    .select("*")
    .eq("author_id", authorId)
    .order("updated_at", { ascending: false });

  if (!includeDrafts) {
    query = query.in("status", ["ongoing", "completed", "hiatus"]);
  }

  const { data, error } = await query;
  if (error)
    return err(error.message);
  return ok(data ?? []);
}

// ---------------------------------------------------------------------------
// Create story (draft)
// ---------------------------------------------------------------------------
export interface CreateStoryInput {
  author_id: string;
  title: string;
  slug: string;
  synopsis?: string;
  cover_url?: string;
  genre: string;
  tags?: string[];
  content_rating?: ContentRating;
  language?: string;
  publish_mode: PublishMode;
  allows_polls?: boolean;
  allows_sparks?: boolean;
  is_open_desk?: boolean;
  is_donation_enabled?: boolean;
}

export async function createStory(
  input: CreateStoryInput,
): Promise<ApiResult<Story>> {
  const { data, error } = await supabase
    .from("stories")
    .insert({
      ...input,
      tags: input.tags ?? [],
      status: "draft",
    } as any)
    .select()
    .single();

  if (error)
    return err(error.message);
  return ok(data);
}

// ---------------------------------------------------------------------------
// Update story
// ---------------------------------------------------------------------------
export type UpdateStoryInput = Partial<
  Omit<CreateStoryInput, "author_id" | "slug">
> & {
  status?: StoryStatus;
  published_at?: string;
};

export async function updateStory(
  id: string,
  updates: UpdateStoryInput,
): Promise<ApiResult<Story>> {
  const { data, error } = await supabase
    .from("stories")
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();

  if (error)
    return err(error.message);
  return ok(data);
}

// ---------------------------------------------------------------------------
// Publish story (flip status + stamp published_at)
// ---------------------------------------------------------------------------
export async function publishStory(id: string): Promise<ApiResult<Story>> {
  const { data, error } = await supabase
    .from("stories")
    .update({
      status: "ongoing",
      published_at: new Date().toISOString(),
    } as never)
    .eq("id", id)
    .select()
    .single();

  if (error)
    return err(error.message);
  return ok(data);
}

// ---------------------------------------------------------------------------
// Delete story (cascades chapters, polls, desks)
// ---------------------------------------------------------------------------
export async function deleteStory(id: string): Promise<ApiResult<null>> {
  const { error } = await supabase.from("stories").delete().eq("id", id);
  if (error)
    return err(error.message);
  return ok(null);
}

// ---------------------------------------------------------------------------
// Upload cover
// ---------------------------------------------------------------------------
export async function uploadCover(
  storyId: string,
  file: File,
): Promise<ApiResult<string>> {
  const ext = file.name.split(".").pop();
  const path = `${storyId}/cover-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("covers")
    .upload(path, file, { upsert: true, cacheControl: "3600" });

  if (uploadError)
    return err(uploadError.message);

  const { error: updateError } = await supabase
    .from("stories")
    .update({ cover_url: path } as never)
    .eq("id", storyId);

  if (updateError)
    return err(updateError.message);
  return ok(getCoverUrl(path));
}

// ---------------------------------------------------------------------------
// Featured / "Burning right now" (top by spark_count)
// ---------------------------------------------------------------------------
export async function getBurningNow(limit = 6): Promise<ApiResult<Story[]>> {
  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .in("status", ["ongoing"])
    .order("spark_count", { ascending: false })
    .limit(limit);

  if (error)
    return err(error.message);
  return ok(data ?? []);
}

// ---------------------------------------------------------------------------
// Story stats (aggregates)
// ---------------------------------------------------------------------------
export interface StoryStats {
  chapter_count: number;
  word_count: number;
  read_count: number;
  spark_count: number;
  follower_count: number;
}

export async function getStoryStats(
  storyId: string,
): Promise<ApiResult<StoryStats>> {
  const { data, error } = await supabase
    .from("stories")
    .select(
      "chapter_count, word_count, read_count, spark_count, follower_count",
    )
    .eq("id", storyId)
    .single();

  if (error)
    return err(error.message);
  return ok(data);
}
