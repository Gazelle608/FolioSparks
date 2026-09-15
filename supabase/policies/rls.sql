-- ============================================================
-- Row Level Security
-- Everyone reads public content; only owners write.
-- ============================================================

-- Enable RLS on all tables
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
-- Public can read chapters 1-3 of any non-draft story (SEO gate).
-- Signed-in users can read all published chapters.
-- Owners can read/write their own drafts.
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
-- Only the owner sees their ledger. Authors can see sparks on their chapters.
create policy "spark_ledger_read_own"
  on public.spark_ledger for select
  using (user_id = auth.uid() or author_id = auth.uid());

-- Inserts go through spend_sparks() RPC (security definer), so no direct policy.

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

-- Writes go through Stripe webhook (service role), so no direct policy.

-- ---------- audio_assets ----------
create policy "audio_read_all"
  on public.audio_assets for select using (true);

-- Writes via service role from the generation job.

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