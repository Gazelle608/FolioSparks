-- ============================================================
-- 002_authors.sql
-- Author-specific data. A user becomes an author by inserting here.
-- Holds the author's chosen donation platform links.
-- ============================================================

create table public.authors (
  id uuid primary key references public.profiles(id) on delete cascade,
  pen_name text,
  tagline text,
  total_sparks_received bigint not null default 0,
  total_reads bigint not null default 0,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index authors_total_sparks_idx on public.authors (total_sparks_received desc);

create trigger authors_touch_updated_at
  before update on public.authors
  for each row execute function public.touch_updated_at();

-- Flip profiles.is_author when an author row is created
create or replace function public.mark_profile_as_author()
returns trigger
language plpgsql
as $$
begin
  update public.profiles set is_author = true where id = new.id;
  return new;
end;
$$;

create trigger authors_mark_profile
  after insert on public.authors
  for each row execute function public.mark_profile_as_author();