-- ============================================================
-- 012_donation_clicks.sql
-- Anonymous click tracking for author donation links.
-- Analytics only — the API treats this as fire-and-forget and
-- never fails a click request because of it.
-- ============================================================

create table if not exists public.donation_clicks (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.authors(id) on delete cascade,

  platform donation_platform not null,
  clicked_by uuid references public.profiles(id) on delete set null,  -- null = anonymous
  clicked_at timestamptz not null default now()
);

create index if not exists donation_clicks_author_idx
  on public.donation_clicks (author_id, clicked_at desc);

-- ------------------------------------------------------------
-- RLS — anyone can record a click, only the author can read them
-- ------------------------------------------------------------
alter table public.donation_clicks enable row level security;

drop policy if exists "donation_clicks_read_own" on public.donation_clicks;
create policy "donation_clicks_read_own"
  on public.donation_clicks for select
  using (author_id = auth.uid());

drop policy if exists "donation_clicks_insert_any" on public.donation_clicks;
create policy "donation_clicks_insert_any"
  on public.donation_clicks for insert
  with check (clicked_by is null or clicked_by = auth.uid());
