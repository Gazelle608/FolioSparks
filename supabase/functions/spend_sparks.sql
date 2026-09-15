-- ============================================================
-- spend_sparks.sql
-- Atomic Sparks spend. Called via RPC from backend.
-- ============================================================

create or replace function public.spend_sparks(
  p_user_id uuid,
  p_chapter_id uuid,
  p_amount int,
  p_note text default null
)
returns public.spark_ledger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance int;
  v_story_id uuid;
  v_author_id uuid;
  v_row public.spark_ledger;
begin
  if p_amount <= 0 then
    raise exception 'Amount must be positive';
  end if;

  -- Lock this user's ledger rows to avoid races
  perform 1 from public.spark_ledger where user_id = p_user_id for update;

  select coalesce(sum(delta), 0) into v_balance
  from public.spark_ledger
  where user_id = p_user_id;

  if v_balance < p_amount then
    raise exception 'INSUFFICIENT_SPARKS: balance=% needed=%', v_balance, p_amount;
  end if;

  -- Grab story/author context for denormalization
  select story_id, author_id into v_story_id, v_author_id
  from public.chapters where id = p_chapter_id;

  if v_story_id is null then
    raise exception 'CHAPTER_NOT_FOUND';
  end if;

  insert into public.spark_ledger
    (user_id, delta, reason, chapter_id, story_id, author_id, note)
  values
    (p_user_id, -p_amount, 'chapter_spark', p_chapter_id, v_story_id, v_author_id, p_note)
  returning * into v_row;

  -- Denormalized counters
  update public.chapters
    set spark_count = spark_count + p_amount
    where id = p_chapter_id;

  update public.stories
    set spark_count = spark_count + p_amount
    where id = v_story_id;

  update public.authors
    set total_sparks_received = total_sparks_received + p_amount
    where id = v_author_id;

  return v_row;
end;
$$;