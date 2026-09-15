-- ============================================================
-- grant_monthly_sparks.sql
-- Grants each active user their monthly allowance.
-- Called by a cron job on the 1st of every month.
-- ============================================================

create or replace function public.grant_monthly_sparks()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int := 0;
  r record;
begin
  for r in
    select user_id, sparks_allowance, tier
    from public.memberships
    where status in ('active', 'trialing')
      and (next_grant_at is null or next_grant_at <= now())
  loop
    insert into public.spark_ledger (user_id, delta, reason, metadata)
    values (
      r.user_id,
      r.sparks_allowance,
      'monthly_grant',
      jsonb_build_object('tier', r.tier, 'granted_at', now())
    );

    update public.memberships
      set last_grant_at = now(),
          next_grant_at = now() + interval '1 month'
      where user_id = r.user_id;

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;