-- ============================================================
-- 007_desks.sql
-- Open co-writing desks. Author invites co-writers to draft chapters.
-- Original author always retains final edit.
-- ============================================================

create type desk_role as enum ('owner', 'cowriter', 'reader');
create type desk_status as enum ('open', 'closed');
create type invite_status as enum ('pending', 'accepted', 'declined', 'revoked');

create table public.desks (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  owner_id uuid not null references public.authors(id) on delete cascade,

  title text not null,
  brief text,
  status desk_status not null default 'open',
  max_cowriters int not null default 3,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index desks_story_idx on public.desks (story_id);
create index desks_open_idx on public.desks (story_id) where status = 'open';

create trigger desks_touch_updated_at
  before update on public.desks
  for each row execute function public.touch_updated_at();

create table public.desk_members (
  id uuid primary key default gen_random_uuid(),
  desk_id uuid not null references public.desks(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role desk_role not null default 'cowriter',
  joined_at timestamptz not null default now(),

  unique (desk_id, user_id)
);

create index desk_members_user_idx on public.desk_members (user_id);

create table public.desk_invites (
  id uuid primary key default gen_random_uuid(),
  desk_id uuid not null references public.desks(id) on delete cascade,
  invited_user_id uuid not null references public.profiles(id) on delete cascade,
  invited_by uuid not null references public.profiles(id),
  status invite_status not null default 'pending',
  message text,
  created_at timestamptz not null default now(),
  responded_at timestamptz,

  unique (desk_id, invited_user_id)
);

create index desk_invites_user_idx on public.desk_invites (invited_user_id, status);

-- Draft submissions from co-writers (owner approves before publishing)
create table public.desk_submissions (
  id uuid primary key default gen_random_uuid(),
  desk_id uuid not null references public.desks(id) on delete cascade,
  chapter_number int not null,
  submitted_by uuid not null references public.profiles(id) on delete cascade,
  title text,
  content text not null,
  word_count int not null default 0,
  is_approved boolean not null default false,
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

create index desk_submissions_desk_idx on public.desk_submissions (desk_id, chapter_number);
create index desk_submissions_pending_idx on public.desk_submissions (desk_id) where is_approved = false;