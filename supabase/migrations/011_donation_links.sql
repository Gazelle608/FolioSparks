-- ============================================================
-- 011_donation_links.sql
-- Author-owned donation links. FolioSparks takes 0%.
-- Authors can attach one link per platform, plus custom entries.
-- ============================================================

create type donation_platform as enum (
  'patreon',
  'ko_fi',
  'buymeacoffee',
  'paypal',
  'stripe',
  'cashapp',
  'venmo',
  'custom'
);

create table public.donation_links (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.authors(id) on delete cascade,

  platform donation_platform not null,
  label text,                    -- display name (e.g. "Buy me a coffee")
  url text not null,
  is_primary boolean not null default false,   -- shown first on story pages
  is_active boolean not null default true,
  display_order int not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint url_format check (url ~* '^https?://'),
  unique (author_id, platform, url)
);

create index donation_links_author_idx on public.donation_links (author_id, display_order);
create index donation_links_active_idx on public.donation_links (author_id) where is_active = true;

create trigger donation_links_touch_updated_at
  before update on public.donation_links
  for each row execute function public.touch_updated_at();

-- Only one primary per author
create unique index donation_links_one_primary
  on public.donation_links (author_id)
  where is_primary = true;