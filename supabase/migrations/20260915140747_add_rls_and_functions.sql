-- ============================================================
-- add_rls_and_functions.sql
-- Applies all RLS policies and economy functions.
-- Runs AFTER migrations 001-011.
-- ============================================================

-- ============================================================
-- PART 1: ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Enable RLS on every table
alter table public.profiles         enable row level security;
alter table public.authors          enable row level security;
alter table public.stories          enable row level security;
alter table public.chapters         enable row level security;
alter table public.spark_ledger     enable row level security;
alter table public.polls            enable row level security;
alter table public.poll_options     enable row level security;
alter table public.poll_votes       enable row level security;
alter table public.desks            enable row level security;
alter table public.desk_members     enable row level security;
alter table public.desk_invites     enable row level security;
alter table public.desk_submissions enable row level security;
alter table public.memberships      enable row level security;
alter table public.audio_assets     enable row level security;
alter table public.reading_progress enable row level security;
alter table public.library_entries  enable row level security;
alter table public.donation_links   enable row level security;

-- ---------- profiles ----------
create policy "profiles_read_all"
  on public.profiles for select using (true);

create policy "profiles_update_own"
  on public.profiles for update using (auth.uid() = id);

-- ---------- authors ----------
create policy "authors_read_all"
  on public.authors for select using (true);

create policy "authors_insert_own"
  on public.authors for insert with check (auth.uid() = id);

create policy "authors_update_own"
  on public.authors for update using (auth.uid() = id);

-- ---------- stories ----------
create policy "stories_read_published"
  on public.stories for select
  using (status <> 'draft' or author_id = auth.uid());

create policy "stories_insert_own"
  on public.stories for insert
  with check (author_id = auth.uid());

create policy "stories_update_own"
  on public.stories for update using (author_id = auth.uid());

create policy "stories_delete_own"
  on public.stories for delete using (author_id = auth.uid());

-- ---------- chapters ----------
-- Chapters 1-3 public; published chapters require auth; drafts owner-only
create policy "chapters_read_public"
  on public.chapters for select
  using (
    (is_published = true and chapter_number <= 3)
    or (is_published = true and auth.uid() is not null)
    or author_id = auth.uid()
  );

create policy "chapters_insert_own"
  on public.chapters for insert
  with check (author_id = auth.uid());

create policy "chapters_update_own"
  on public.chapters for update using (author_id = auth.uid());

create policy "chapters_delete_own"
  on public.chapters for delete using (author_id = auth.uid());

-- ---------- spark_ledger ----------
create policy "spark_ledger_read_own"
  on public.spark_ledger for select
  using (user_id = auth.uid() or author_id = auth.uid());

-- ---------- polls ----------
create policy "polls_read_all"
  on public.polls for select using (true);

create policy "polls_write_own"
  on public.polls for all
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

create policy "poll_options_read_all"
  on public.poll_options for select using (true);

create policy "poll_options_write_own"
  on public.poll_options for all
  using (
    exists (
      select 1 from public.polls
      where polls.id = poll_options.poll_id and polls.author_id = auth.uid()
    )
  );

create policy "poll_votes_read_all"
  on public.poll_votes for select using (true);

create policy "poll_votes_insert_own"
  on public.poll_votes for insert
  with check (user_id = auth.uid());

-- ---------- desks ----------
create policy "desks_read_all"
  on public.desks for select using (true);

create policy "desks_write_owner"
  on public.desks for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "desk_members_read_all"
  on public.desk_members for select using (true);

create policy "desk_members_insert_owner"
  on public.desk_members for insert
  with check (
    exists (
      select 1 from public.desks
      where desks.id = desk_members.desk_id and desks.owner_id = auth.uid()
    )
    or user_id = auth.uid()
  );

create policy "desk_invites_read_involved"
  on public.desk_invites for select
  using (
    invited_user_id = auth.uid()
    or exists (
      select 1 from public.desks
      where desks.id = desk_invites.desk_id and desks.owner_id = auth.uid()
    )
  );

create policy "desk_invites_insert_owner"
  on public.desk_invites for insert
  with check (
    exists (
      select 1 from public.desks
      where desks.id = desk_invites.desk_id and desks.owner_id = auth.uid()
    )
  );

create policy "desk_submissions_read_involved"
  on public.desk_submissions for select
  using (
    submitted_by = auth.uid()
    or exists (
      select 1 from public.desks
      where desks.id = desk_submissions.desk_id and desks.owner_id = auth.uid()
    )
  );

create policy "desk_submissions_insert_member"
  on public.desk_submissions for insert
  with check (
    submitted_by = auth.uid()
    and exists (
      select 1 from public.desk_members
      where desk_members.desk_id = desk_submissions.desk_id
        and desk_members.user_id = auth.uid()
    )
  );

create policy "desk_submissions_approve_owner"
  on public.desk_submissions for update
  using (
    exists (
      select 1 from public.desks
      where desks.id = desk_submissions.desk_id and desks.owner_id = auth.uid()
    )
  );

-- ---------- memberships ----------
create policy "memberships_read_own"
  on public.memberships for select using (user_id = auth.uid());

-- ---------- audio_assets ----------
create policy "audio_read_all"
  on public.audio_assets for select using (true);

-- ---------- reading_progress ----------
create policy "reading_progress_own"
  on public.reading_progress for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------- library_entries ----------
create policy "library_entries_own"
  on public.library_entries for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------- donation_links ----------
create policy "donation_links_read_all"
  on public.donation_links for select using (is_active = true);

create policy "donation_links_write_own"
  on public.donation_links for all
  using (author_id = auth.uid())
  with check (author_id = auth.uid());


-- ============================================================
-- PART 2: ECONOMY FUNCTIONS
-- ============================================================

-- ---------- spend_sparks ----------
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

  perform 1 from public.spark_ledger where user_id = p_user_id for update;

  select coalesce(sum(delta), 0) into v_balance
  from public.spark_ledger
  where user_id = p_user_id;

  if v_balance < p_amount then
    raise exception 'INSUFFICIENT_SPARKS: balance=% needed=%', v_balance, p_amount;
  end if;

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

-- ---------- grant_monthly_sparks ----------
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

-- ---------- tally_poll_votes ----------
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
  update public.poll_options po
    set vote_count = (
      select count(*) from public.poll_votes
      where option_id = po.id
    )
    where po.poll_id = p_poll_id;

  select coalesce(sum(vote_count), 0) into v_total
  from public.poll_options where poll_id = p_poll_id;

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

-- ---------- close_expired_polls ----------
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

-- ---------- publish_scheduled_chapters ----------
create or replace function public.publish_scheduled_chapters()
returns void
language plpgsql
security definer
as $$
begin
  update public.chapters
  set is_published = true,
      published_at = now()
  where is_published = false
    and scheduled_for is not null
    and scheduled_for <= now();
end;
$$;

-- ---------- allowance_for_tier ----------
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

-- ---------- handle_new_user (profile bootstrap) ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'username',
      'user_' || substr(replace(new.id::text, '-', ''), 1, 12)
    ),
    coalesce(
      new.raw_user_meta_data->>'display_name',
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- create_default_membership ----------
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

drop trigger if exists profiles_create_membership on public.profiles;
create trigger profiles_create_membership
  after insert on public.profiles
  for each row execute function public.create_default_membership();

-- ---------- mark_profile_as_author ----------
create or replace function public.mark_profile_as_author()
returns trigger
language plpgsql
as $$
begin
  update public.profiles set is_author = true where id = new.id;
  return new;
end;
$$;

drop trigger if exists authors_mark_profile on public.authors;
create trigger authors_mark_profile
  after insert on public.authors
  for each row execute function public.mark_profile_as_author();

-- ---------- touch_updated_at ----------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- compute_word_count ----------
create or replace function public.compute_word_count()
returns trigger
language plpgsql
as $$
begin
  new.word_count = array_length(
    regexp_split_to_array(trim(new.content), '\s+'), 1
  );
  return new;
end;
$$;

drop trigger if exists chapters_compute_word_count on public.chapters;
create trigger chapters_compute_word_count
  before insert or update of content on public.chapters
  for each row execute function public.compute_word_count();

-- ---------- refresh_story_counters ----------
create or replace function public.refresh_story_counters()
returns trigger
language plpgsql
as $$
declare
  v_story_id uuid;
begin
  v_story_id := coalesce(new.story_id, old.story_id);

  update public.stories s
  set
    chapter_count = (
      select count(*) from public.chapters
      where story_id = v_story_id and is_published = true
    ),
    word_count = (
      select coalesce(sum(word_count), 0) from public.chapters
      where story_id = v_story_id and is_published = true
    ),
    last_chapter_at = (
      select max(published_at) from public.chapters
      where story_id = v_story_id and is_published = true
    )
  where s.id = v_story_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists chapters_refresh_story on public.chapters;
create trigger chapters_refresh_story
  after insert or update or delete on public.chapters
  for each row execute function public.refresh_story_counters();