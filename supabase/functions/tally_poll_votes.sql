-- ============================================================
-- tally_poll_votes.sql
-- Recomputes poll option vote counts and picks the winner.
-- Called by a cron job or on-demand when a poll closes.
-- ============================================================

create or replace function public.tally_poll_votes(p_poll_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_winner uuid;
  v_total int;
begin
  -- Refresh counts
  update public.poll_options po
    set vote_count = (
      select count(*) from public.poll_votes
      where option_id = po.id
    )
    where po.poll_id = p_poll_id;

  select coalesce(sum(vote_count), 0) into v_total
  from public.poll_options where poll_id = p_poll_id;

  -- Winner = most votes, ties broken by display_order
  select id into v_winner
  from public.poll_options
  where poll_id = p_poll_id
  order by vote_count desc, display_order asc
  limit 1;

  update public.polls
    set total_votes = v_total,
        winning_option_id = v_winner,
        status = 'closed',
        updated_at = now()
    where id = p_poll_id;

  return v_winner;
end;
$$;

-- Auto-close polls whose closes_at has passed
create or replace function public.close_expired_polls()
returns void
language plpgsql
security definer
as $$
declare
  r record;
begin
  for r in
    select id from public.polls
    where status = 'open'
      and closes_at is not null
      and closes_at <= now()
  loop
    perform public.tally_poll_votes(r.id);
  end loop;
end;
$$;