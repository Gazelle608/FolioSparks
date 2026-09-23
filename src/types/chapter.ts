// ============================================================
// Chapter + Audio Asset
// Mirrors: public.chapters, public.audio_assets
// ============================================================

export type AudioStatus = 'pending' | 'generating' | 'ready' | 'failed';

// ---------------------------------------------------------------------------
// Chapter row
// ---------------------------------------------------------------------------
export interface Chapter {
  id: string;
  story_id: string;
  author_id: string;

  chapter_number: number;
  title: string | null;
  content: string;
  word_count: number;

  is_published: boolean;
  published_at: string | null;
  scheduled_for: string | null;

  read_count: number;
  spark_count: number;
  comment_count: number;

  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Insert / Update
// ---------------------------------------------------------------------------
export interface ChapterInsert {
  story_id: string;
  author_id: string;
  chapter_number: number;
  title?: string | null;
  content: string;
  is_published?: boolean;
  published_at?: string | null;
  scheduled_for?: string | null;
}

export interface ChapterUpdate {
  title?: string | null;
  content?: string;
  is_published?: boolean;
  published_at?: string | null;
  scheduled_for?: string | null;
}

// ---------------------------------------------------------------------------
// Bulk insert (full manuscript path)
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

// ---------------------------------------------------------------------------
// Reader navigation helpers
// ---------------------------------------------------------------------------
export interface AdjacentChapters {
  previous: Chapter | null;
  next: Chapter | null;
}

// ---------------------------------------------------------------------------
// Audio asset
// ---------------------------------------------------------------------------
export interface AudioAsset {
  id: string;
  chapter_id: string;
  storage_path: string | null;
  voice_id: string;
  duration_seconds: number | null;
  size_bytes: number | null;
  status: AudioStatus;
  error_message: string | null;
  generated_at: string | null;
  created_at: string;
}