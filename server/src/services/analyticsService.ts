import { supabaseAdmin } from "../config/supabase.js";
import { HttpError } from "../utils/errors.js";

// ============================================================
// Types
// ============================================================
export interface StoryAnalytics {
  totals: {
    sparks: number;
    reads: number;
    chapters: number;
    followers: number;
  };
  series: Array<{ date: string; sparks: number; reads: number }>;
  chapters: Array<{
    id: string;
    chapter_number: number;
    title: string | null;
    reads: number;
    sparks: number;
    is_published: boolean;
  }>;
}

// ============================================================
// Story analytics
// ============================================================
export async function getStoryAnalytics(
  storyId: string,
): Promise<StoryAnalytics> {
  const [storyResult, chaptersResult, seriesResult] = await Promise.all([
    supabaseAdmin
      .from("stories")
      .select("spark_count, read_count, chapter_count, follower_count")
      .eq("id", storyId)
      .single(),
    supabaseAdmin
      .from("chapters")
      .select(
        "id, chapter_number, title, read_count, spark_count, is_published",
      )
      .eq("story_id", storyId)
      .order("chapter_number", { ascending: true }),
    getSparksSeries(storyId, 30),
  ]);

  if (storyResult.error || !storyResult.data) {
    throw HttpError.notFound("Story not found");
  }

  const story = storyResult.data;
  const chapters = chaptersResult.data ?? [];

  return {
    totals: {
      sparks: story.spark_count ?? 0,
      reads: story.read_count ?? 0,
      chapters: story.chapter_count ?? 0,
      followers: story.follower_count ?? 0,
    },
    series: seriesResult,
    chapters: chapters.map(c => ({
      id: c.id,
      chapter_number: c.chapter_number,
      title: c.title,
      reads: c.read_count,
      sparks: c.spark_count,
      is_published: c.is_published,
    })),
  };
}

// ============================================================
// Author dashboard
// ============================================================
export async function getAuthorOverview(userId: string) {
  const { data: stories } = await supabaseAdmin
    .from("stories")
    .select(
      "id, title, slug, spark_count, read_count, chapter_count, follower_count",
    )
    .eq("author_id", userId)
    .order("updated_at", { ascending: false });

  const list = stories ?? [];

  return {
    totalStories: list.length,
    totalReads: list.reduce((sum, s) => sum + (s.read_count ?? 0), 0),
    totalSparks: list.reduce((sum, s) => sum + (s.spark_count ?? 0), 0),
    stories: list.map(s => ({
      id: s.id,
      title: s.title,
      slug: s.slug,
      sparks: s.spark_count ?? 0,
      reads: s.read_count ?? 0,
      chapters: s.chapter_count ?? 0,
      followers: s.follower_count ?? 0,
    })),
  };
}

// ============================================================
// Time series — Sparks per day for the last N days
// ============================================================
export async function getSparksSeries(
  storyId: string,
  days: number,
): Promise<Array<{ date: string; sparks: number; reads: number }>> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabaseAdmin
    .from("spark_ledger")
    .select("delta, created_at")
    .eq("story_id", storyId)
    .eq("reason", "chapter_spark")
    .lt("delta", 0)
    .gte("created_at", since.toISOString());

  if (error)
    return [];

  // Bucket by day
  const buckets = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    buckets.set(d.toISOString().slice(0, 10), 0);
  }

  for (const row of data ?? []) {
    const day = row.created_at.slice(0, 10);
    if (buckets.has(day)) {
      buckets.set(day, (buckets.get(day) ?? 0) + Math.abs(row.delta));
    }
  }

  return Array.from(buckets.entries()).map(([date, sparks]) => ({
    date,
    sparks,
    reads: 0, // add read tracking later if you want
  }));
}

// ============================================================
// Chapter breakdown — table of per-chapter stats
// ============================================================
export async function getChapterBreakdown(storyId: string) {
  const { data, error } = await supabaseAdmin
    .from("chapters")
    .select("id, chapter_number, title, read_count, spark_count, is_published")
    .eq("story_id", storyId)
    .order("chapter_number", { ascending: true });

  if (error)
    return [];
  return (data ?? []).map(c => ({
    id: c.id,
    chapter_number: c.chapter_number,
    title: c.title,
    reads: c.read_count,
    sparks: c.spark_count,
    is_published: c.is_published,
  }));
}

// ============================================================
// Donation clicks — aggregate by platform
// ============================================================
export async function getDonationClicks(
  authorId: string,
  days: number,
): Promise<Array<{ platform: string; count: number }>> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabaseAdmin
    .from("donation_clicks")
    .select("platform")
    .eq("author_id", authorId)
    .gte("clicked_at", since.toISOString());

  if (error)
    return [];

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    counts.set(row.platform, (counts.get(row.platform) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([platform, count]) => ({ platform, count }))
    .sort((a, b) => b.count - a.count);
}
