-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Authors table
CREATE TABLE IF NOT EXISTS public.authors (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    display_name TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    donation_platforms JSONB DEFAULT '{}'::jsonb,
    subscription_revenue_split INTEGER DEFAULT 70,
    total_reads INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Books table
CREATE TABLE IF NOT EXISTS public.books (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_id UUID REFERENCES public.authors(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    cover_url TEXT,
    genre TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    status TEXT CHECK (status IN ('draft', 'published', 'complete')) DEFAULT 'draft',
    is_subscription_only BOOLEAN DEFAULT FALSE,
    donation_enabled BOOLEAN DEFAULT TRUE,
    total_chapters INTEGER DEFAULT 0,
    total_reads INTEGER DEFAULT 0,
    total_sparks INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chapters table
CREATE TABLE IF NOT EXISTS public.chapters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    chapter_number INTEGER NOT NULL,
    word_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Sparks balance
CREATE TABLE IF NOT EXISTS public.user_sparks (
    user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
    balance INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sparks transactions
CREATE TABLE IF NOT EXISTS public.sparks_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    from_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    to_author_id UUID REFERENCES public.authors(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
    amount INTEGER NOT NULL,
    type TEXT CHECK (type IN ('tip', 'subscription', 'purchase')) NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Polls
CREATE TABLE IF NOT EXISTS public.polls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    description TEXT,
    options JSONB NOT NULL,
    total_votes INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ends_at TIMESTAMP WITH TIME ZONE
);

-- Poll votes
CREATE TABLE IF NOT EXISTS public.poll_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    option_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(poll_id, user_id)
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan TEXT CHECK (plan IN ('free', 'spark', 'spark-pro')) NOT NULL,
    status TEXT CHECK (status IN ('active', 'cancelled', 'expired')) DEFAULT 'active',
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN DEFAULT TRUE,
    stripe_subscription_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);