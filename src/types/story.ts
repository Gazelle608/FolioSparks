// ============================================================
// Story
// Mirrors: public.stories
// ============================================================

// Postgres enums
export type StoryStatus =
  | 'draft'
  | 'ongoing'
  | 'hiatus'
  | 'completed'
  | 'cancelled';

export type PublishMode = 'full_manuscript' | 'chapter_by_chapter';

export type ContentRating = 'general' | 'teen' | 'mature';

// ---------------------------------------------------------------------------
// Row shape — 1:1 with the stories table
// ---------------------------------------------------------------------------
export interface Story {
  id: string;
  author_id: string;

  title: string;
  slug: string;
  synopsis: string | null;
  cover_url: string | null;

  genre: string;
  tags: string[];
  content_rating: ContentRating;
  language: string;

  status: StoryStatus;
  publish_mode: PublishMode;

  allows_polls: boolean;
  allows_sparks: boolean;
  is_open_desk: boolean;
  is_donation_enabled: boolean;

  chapter_count: number;
  word_count: number;
  read_count: number;
  spark_count: number;
  follower_count: number;

  published_at: string | null;
  last_chapter_at: string | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Insert / Update
// ---------------------------------------------------------------------------
export interface StoryInsert {
  author_id: string;
  title: string;
  slug: string;
  synopsis?: string | null;
  cover_url?: string | null;
  genre: string;
  tags?: string[];
  content_rating?: ContentRating;
  language?: string;
  status?: StoryStatus;
  publish_mode?: PublishMode;
  allows_polls?: boolean;
  allows_sparks?: boolean;
  is_open_desk?: boolean;
  is_donation_enabled?: boolean;
}

export interface StoryUpdate {
  title?: string;
  slug?: string;
  synopsis?: string | null;
  cover_url?: string | null;
  genre?: string;
  tags?: string[];
  content_rating?: ContentRating;
  language?: string;
  status?: StoryStatus;
  publish_mode?: PublishMode;
  allows_polls?: boolean;
  allows_sparks?: boolean;
  is_open_desk?: boolean;
  is_donation_enabled?: boolean;
  published_at?: string | null;
}

// ---------------------------------------------------------------------------
// Composed card view — Story + joined author (used by StoryCard, StoryGrid)
// ---------------------------------------------------------------------------
export interface StoryCardData extends Story {
  author: {
    id: string;
    pen_name: string | null;
    username: string;
    avatar_url: string | null;
    is_verified: boolean;
  };
}

// ---------------------------------------------------------------------------
// Filter state — what the library page keeps in memory
// ---------------------------------------------------------------------------
export interface StoryFilterState {
  genre: string | null;
  status: StoryStatus | null;
  tags: string[];
  sort: 'recent' | 'popular' | 'sparks' | 'alphabetical';
}

// ---------------------------------------------------------------------------
// Query options — what gets passed to listStories()
// ---------------------------------------------------------------------------
export interface ListStoriesOptions {
  genre?: string;
  tag?: string;
  status?: StoryStatus;
  search?: string;
  limit?: number;
  offset?: number;
  orderBy?: 'published_at' | 'spark_count' | 'read_count' | 'updated_at';
}

// ---------------------------------------------------------------------------
// Aggregate stats returned by getStoryStats()
// ---------------------------------------------------------------------------
export interface StoryStats {
  chapter_count: number;
  word_count: number;
  read_count: number;
  spark_count: number;
  follower_count: number;
}

// ---------------------------------------------------------------------------
// Genre list — mirrors the seeded genres table
// ---------------------------------------------------------------------------
export interface Genre {
  id: number;
  slug: string;
  name: string;
  description: string | null;
}