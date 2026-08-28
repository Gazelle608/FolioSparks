-- Insert sample authors
INSERT INTO public.authors (id, display_name, bio, donation_platforms)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Ren Hollow', 'Author of epic fantasy and political intrigue.', 
     '{"patreon": "https://patreon.com/renhollow", "ko-fi": "https://ko-fi.com/renhollow"}'::jsonb),
    ('22222222-2222-2222-2222-222222222222', 'Mira Wilde', 'Romance writer with a love for small towns.', 
     '{"paypal": "https://paypal.me/mirawilde"}'::jsonb),
    ('33333333-3333-3333-3333-333333333333', 'Tobi Oduya', 'Afrofuturism and mythic fiction author.', 
     '{"buymeacoffee": "https://buymeacoffee.com/tobioduya"}'::jsonb);

-- Insert sample books
INSERT INTO public.books (id, author_id, title, description, genre, tags, status, total_reads, total_sparks)
VALUES 
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 
     'The Ash Concordat', 'An empire signs a treaty with the fire that is eating it. Written live, with readers steering every act.',
     '{EPIC FANTASY}', '{co-written, reader polls, political}', 'published', 31288, 9075),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222',
     'Nine Days of Rain', 'Two rival florists, one flooded town, and a wedding that refuses to be cancelled.',
     '{ROMANCE}', '{co-written, reader polls, political}', 'published', 7310, 4820),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333',
     'Lagos Orbital', 'The first city in geostationary orbit runs on borrowed memory — and someone is spending hers fast.',
     '{SCIFI}', '{afrofuturism, serial, heist}', 'published', 26190, 2310);

-- Insert sample chapters
INSERT INTO public.chapters (book_id, title, content, chapter_number, word_count, is_published, published_at)
VALUES 
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'The Treaty', 'Chapter 1 content...', 1, 2500, true, NOW()),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'The Fire', 'Chapter 2 content...', 2, 2800, true, NOW()),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'The Flood', 'Chapter 1 content...', 1, 2200, true, NOW()),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'The Memory', 'Chapter 1 content...', 1, 3000, true, NOW());