-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sparks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sparks_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read their own profile" 
    ON public.users FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.users FOR UPDATE 
    USING (auth.uid() = id);

-- Authors policies
CREATE POLICY "Anyone can read author profiles" 
    ON public.authors FOR SELECT 
    USING (true);

CREATE POLICY "Authors can update their own profile" 
    ON public.authors FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Authors can insert their own profile" 
    ON public.authors FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Books policies
CREATE POLICY "Anyone can read published books" 
    ON public.books FOR SELECT 
    USING (status IN ('published', 'complete'));

CREATE POLICY "Authors can read their own books" 
    ON public.books FOR SELECT 
    USING (auth.uid() = author_id);

CREATE POLICY "Authors can insert their own books" 
    ON public.books FOR INSERT 
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own books" 
    ON public.books FOR UPDATE 
    USING (auth.uid() = author_id);

-- Chapters policies
CREATE POLICY "Anyone can read published chapters" 
    ON public.chapters FOR SELECT 
    USING (is_published = true);

CREATE POLICY "Authors can read their own chapters" 
    ON public.chapters FOR SELECT 
    USING (auth.uid() IN (SELECT author_id FROM public.books WHERE id = book_id));

CREATE POLICY "Authors can insert chapters" 
    ON public.chapters FOR INSERT 
    WITH CHECK (auth.uid() IN (SELECT author_id FROM public.books WHERE id = book_id));

CREATE POLICY "Authors can update their own chapters" 
    ON public.chapters FOR UPDATE 
    USING (auth.uid() IN (SELECT author_id FROM public.books WHERE id = book_id));

-- Sparks policies
CREATE POLICY "Users can read their own sparks balance" 
    ON public.user_sparks FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can read sparks transactions" 
    ON public.sparks_transactions FOR SELECT 
    USING (auth.uid() = from_user_id OR auth.uid() = to_author_id);

CREATE POLICY "Users can insert sparks transactions" 
    ON public.sparks_transactions FOR INSERT 
    WITH CHECK (auth.uid() = from_user_id);

-- Polls policies
CREATE POLICY "Anyone can read active polls" 
    ON public.polls FOR SELECT 
    USING (is_active = true);

CREATE POLICY "Authors can manage polls" 
    ON public.polls FOR ALL 
    USING (auth.uid() IN (SELECT author_id FROM public.books WHERE id = book_id));

-- Poll votes policies
CREATE POLICY "Users can vote" 
    ON public.poll_votes FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read votes" 
    ON public.poll_votes FOR SELECT 
    USING (true);

-- Subscriptions policies
CREATE POLICY "Users can read their subscriptions" 
    ON public.subscriptions FOR SELECT 
    USING (auth.uid() = user_id);