-- ============================================================
-- 005_sparks_ledger.sql
-- Sparks = engagement currency. Never real money.
-- Ledger, not balance. Every grant/spend is an immutable row.
-- ============================================================

create type spark_reason as enum (
  'signup_bonus',
  'monthly_grant',
  'chapter_spark',       -- spending
  'poll_reward',
  'admin_adjustment',
  'referral_bonus'
);

create table public.spark_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  delta int not null,                          -- + grant, - spend
  reason spark_reason not null,

  -- optional context
  chapter_id uuid references public.chapters(id) on delete set null,
  story_id uuid references public.stories(id) on delete set null,
  author_id uuid references public.authors(id) on delete set null,

  note text,                                   -- reader's message to author
  metadata jsonb default '{}'::jsonb,

  created_at timestamptz not null default now(),

  constraint delta_not_zero check (delta <> 0),
  constraint note_length check (note is null or char_length(note) <= 500)
);

create index spark_ledger_user_idx on public.spark_ledger (user_id, created_at desc);
create index spark_ledger_chapter_idx on public.spark_ledger (chapter_id) where chapter_id is not null;
create index spark_ledger_author_idx on public.spark_ledger (author_id, created_at desc) where author_id is not null;
create index spark_ledger_reason_idx on public.spark_ledger (reason);

-- Current balance per user (fast view)
create or replace view public.spark_balances as
  select
    user_id,
    coalesce(sum(delta), 0)::bigint as balance
  from public.spark_ledger
  group by user_id;

-- Sparks received per chapter (for author analytics)
create or replace view public.chapter_spark_totals as
  select
    chapter_id,
    sum(-delta)::bigint as sparks_received
  from public.spark_ledger
  where reason = 'chapter_spark' and delta < 0
  group by chapter_id;

-- Sparks received per author
create or replace view public.author_spark_totals as
  select
    author_id,
    sum(-delta)::bigint as sparks_received
  from public.spark_ledger
  where reason = 'chapter_spark' and delta < 0 and author_id is not null
  group by author_id;