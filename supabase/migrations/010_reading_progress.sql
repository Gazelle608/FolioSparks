-- ============================================================
-- 010_reading_progress.sql
-- Per-user reading position. Syncs across devices.
-- ============================================================

create table public.reading_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  story_id uuid not null references public.stories(id) on delete cascade,
  chapter_id uuid not null references public.chapters(id) on delete cascade,

  scroll_percent numeric(5,2) not null default 0,   -- 0.00–100.00
  last_read_at timestamptz not null default now(),

  unique (user_id, story_id)
);

create index reading_progress_user_idx on public.reading_progress (user_id, last_read_at desc);
create index reading_progress_story_idx on public.reading_progress (story_id);

-- Bookshelf / library: what users have saved
create table public.library_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  story_id uuid not null references public.stories(id) on delete cascade,
  added_at timestamptz not null default now(),

  unique (user_id, story_id)
);

create index library_entries_user_idx on public.library_entries (user_id, added_at desc);
create index library_entries_story_idx on public.library_entries (story_id);