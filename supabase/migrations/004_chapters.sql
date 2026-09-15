-- ============================================================
-- 004_chapters.sql
-- Individual chapters within a story.
-- Chapters 1-3 are publicly readable (SEO + hook).
-- Chapters 4+ require an account.
-- ============================================================

create table public.chapters (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  author_id uuid not null references public.authors(id) on delete cascade,

  chapter_number int not null,
  title text,
  content text not null,
  word_count int not null default 0,

  is_published boolean not null default false,
  published_at timestamptz,
  scheduled_for timestamptz,

  -- Denormalized counters
  read_count bigint not null default 0,
  spark_count bigint not null default 0,
  comment_count int not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint chapter_number_positive check (chapter_number > 0),
  unique (story_id, chapter_number)
);

create index chapters_story_idx on public.chapters (story_id, chapter_number);
create index chapters_author_idx on public.chapters (author_id);
create index chapters_published_idx on public.chapters (published_at desc) where is_published = true;
create index chapters_scheduled_idx on public.chapters (scheduled_for) where is_published = false and scheduled_for is not null;

create trigger chapters_touch_updated_at
  before update on public.chapters
  for each row execute function public.touch_updated_at();

-- Auto-compute word_count on insert/update
create or replace function public.compute_word_count()
returns trigger
language plpgsql
as $$
begin
  new.word_count = array_length(regexp_split_to_array(trim(new.content), '\s+'), 1);
  return new;
end;
$$;

create trigger chapters_compute_word_count
  before insert or update of content on public.chapters
  for each row execute function public.compute_word_count();

-- Keep story counters fresh
create or replace function public.refresh_story_counters()
returns trigger
language plpgsql
as $$
declare
  v_story_id uuid;
begin
  v_story_id := coalesce(new.story_id, old.story_id);

  update public.stories s
  set
    chapter_count = (
      select count(*) from public.chapters
      where story_id = v_story_id and is_published = true
    ),
    word_count = (
      select coalesce(sum(word_count), 0) from public.chapters
      where story_id = v_story_id and is_published = true
    ),
    last_chapter_at = (
      select max(published_at) from public.chapters
      where story_id = v_story_id and is_published = true
    )
  where s.id = v_story_id;

  return coalesce(new, old);
end;
$$;

create trigger chapters_refresh_story
  after insert or update or delete on public.chapters
  for each row execute function public.refresh_story_counters();

-- Auto-publish scheduled chapters (called by cron)
create or replace function public.publish_scheduled_chapters()
returns void
language plpgsql
security definer
as $$
begin
  update public.chapters
  set is_published = true,
      published_at = now()
  where is_published = false
    and scheduled_for is not null
    and scheduled_for <= now();
end;
$$;