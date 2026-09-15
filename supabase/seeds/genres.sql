-- ============================================================
-- genres.sql
-- Genre reference list. No demo stories.
-- ============================================================

create table if not exists public.genres (
  id serial primary key,
  slug text unique not null,
  name text not null,
  description text
);

insert into public.genres (slug, name, description) values
  ('epic-fantasy',   'Epic Fantasy',    'Sweeping worlds, high stakes, chosen ones.'),
  ('fantasy',        'Fantasy',         'Magic, myth, and everything in between.'),
  ('romance',        'Romance',         'Love in all its messy, beautiful forms.'),
  ('sci-fi',         'Sci-Fi',          'Futures, tech, and the questions that come with them.'),
  ('mystery',        'Mystery',         'Puzzles, clues, and the truths we chase.'),
  ('thriller',       'Thriller',        'High tension, tight pacing, sharp turns.'),
  ('horror',         'Horror',          'Fear, dread, and things best left unspoken.'),
  ('literary',       'Literary',        'Character-first, sentence-level craft.'),
  ('historical',     'Historical',      'Grounded in another time.'),
  ('contemporary',   'Contemporary',    'Here and now, no magic required.'),
  ('adventure',      'Adventure',       'Quests, journeys, and the road itself.'),
  ('paranormal',     'Paranormal',      'Ghosts, shifters, and the in-between.'),
  ('dystopian',      'Dystopian',       'Broken systems and the people inside them.'),
  ('comedy',         'Comedy',          'Timing, absurdity, and a good laugh.'),
  ('drama',          'Drama',           'Emotional weight, real consequences.'),
  ('poetry',         'Poetry',          'Verse, rhythm, and the space between words.')
on conflict (slug) do nothing;

alter table public.genres enable row level security;

create policy "genres_read_all"
  on public.genres for select using (true);