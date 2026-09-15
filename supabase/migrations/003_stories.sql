-- ============================================================
-- 003_stories.sql
-- A story = a serialized work. Chapters hang off this.
-- ============================================================

create type story_status as enum ('draft', 'ongoing', 'hiatus', 'completed', 'cancelled');
create type publish_mode as enum ('full_manuscript', 'chapter_by_chapter');
create type content_rating as enum ('general', 'teen', 'mature');

create table public.stories (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.authors(id) on delete cascade,

  title text not null,
  slug text unique not null,
  synopsis text,
  cover_url text,

  genre text not null,
  tags text[] not null default '{}',
  content_rating content_rating not null default 'general',
  language text not null default 'en',

  status story_status not null default 'draft',
  publish_mode publish_mode not null default 'chapter_by_chapter',

  -- Feature toggles
  allows_polls boolean not null default true,
  allows_sparks boolean not null default true,
  is_open_desk boolean not null default false,       -- co-writing enabled
  is_donation_enabled boolean not null default true,

  -- Denormalized counters (updated by triggers)
  chapter_count int not null default 0,
  word_count int not null default 0,
  read_count bigint not null default 0,
  spark_count bigint not null default 0,
  follower_count bigint not null default 0,

  published_at timestamptz,
  last_chapter_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint slug_format check (slug ~ '^[a-z0-9-]{3,120}$'),
  constraint tags_limit check (array_length(tags, 1) is null or array_length(tags, 1) <= 15)
);

create index stories_author_idx on public.stories (author_id);
create index stories_status_idx on public.stories (status);
create index stories_genre_idx on public.stories (genre);
create index stories_tags_gin on public.stories using gin (tags);
create index stories_spark_count_idx on public.stories (spark_count desc) where status in ('ongoing', 'completed');
create index stories_published_at_idx on public.stories (published_at desc) where status in ('ongoing', 'completed');

create trigger stories_touch_updated_at
  before update on public.stories
  for each row execute function public.touch_updated_at();