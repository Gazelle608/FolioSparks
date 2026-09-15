-- ============================================================
-- 006_polls.sql
-- Chapter-ending polls that change canon. Readers vote with Sparks.
-- ============================================================

create type poll_status as enum ('open', 'closed', 'cancelled');

create table public.polls (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  author_id uuid not null references public.authors(id) on delete cascade,
  chapter_id uuid references public.chapters(id) on delete set null,

  question text not null,
  description text,
  status poll_status not null default 'open',
  closes_at timestamptz,
  winning_option_id uuid,

  total_votes int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index polls_story_idx on public.polls (story_id);
create index polls_open_idx on public.polls (closes_at) where status = 'open';

create trigger polls_touch_updated_at
  before update on public.polls
  for each row execute function public.touch_updated_at();

create table public.poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  option_text text not null,
  display_order int not null default 0,
  vote_count int not null default 0
);

create index poll_options_poll_idx on public.poll_options (poll_id, display_order);

create table public.poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  option_id uuid not null references public.poll_options(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),

  unique (poll_id, user_id)         -- one vote per user per poll
);

create index poll_votes_poll_idx on public.poll_votes (poll_id);
create index poll_votes_user_idx on public.poll_votes (user_id);