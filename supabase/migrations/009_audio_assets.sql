-- ============================================================
-- 009_audio_assets.sql
-- Server-generated MP3s stored in Supabase Storage.
-- Free tier: no audio (uses browser TTS on client).
-- Spark tier: browser TTS only.
-- Spark Pro tier: streaming + MP3 download.
-- ============================================================

create type audio_status as enum ('pending', 'generating', 'ready', 'failed');

create table public.audio_assets (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters(id) on delete cascade,

  storage_path text,                    -- e.g. 'audio/<story>/<chapter>.mp3'
  voice_id text not null,               -- 'en-US-Neural2-F'
  duration_seconds int,
  size_bytes bigint,

  status audio_status not null default 'pending',
  error_message text,

  generated_at timestamptz,
  created_at timestamptz not null default now(),

  unique (chapter_id, voice_id)
);

create index audio_assets_chapter_idx on public.audio_assets (chapter_id);
create index audio_assets_pending_idx on public.audio_assets (status) where status in ('pending', 'generating');