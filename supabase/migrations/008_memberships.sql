-- ============================================================
-- 008_memberships.sql
-- Tiered subscriptions. Sparks allowance per tier.
-- Stripe wired in later (columns ready).
-- ============================================================

create type membership_tier as enum ('free', 'spark', 'spark_pro');
create type membership_status as enum ('active', 'past_due', 'cancelled', 'trialing');

create table public.memberships (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  tier membership_tier not null default 'free',
  status membership_status not null default 'active',

  -- Stripe (nullable until wired up)
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,

  -- Allowance tracking
  sparks_allowance int not null default 100,   -- per month
  last_grant_at timestamptz,
  next_grant_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index memberships_tier_idx on public.memberships (tier);
create index memberships_stripe_customer_idx on public.memberships (stripe_customer_id) where stripe_customer_id is not null;
create index memberships_next_grant_idx on public.memberships (next_grant_at) where tier <> 'free';

create trigger memberships_touch_updated_at
  before update on public.memberships
  for each row execute function public.touch_updated_at();

-- Auto-create a free membership on profile insert
create or replace function public.create_default_membership()
returns trigger
language plpgsql
as $$
begin
  insert into public.memberships (user_id, tier, sparks_allowance)
  values (new.id, 'free', 100)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger profiles_create_membership
  after insert on public.profiles
  for each row execute function public.create_default_membership();

-- Tier → allowance lookup (single source of truth)
create or replace function public.allowance_for_tier(t membership_tier)
returns int
language sql
immutable
as $$
  select case t
    when 'free' then 100
    when 'spark' then 1200
    when 'spark_pro' then 3000
  end;
$$;