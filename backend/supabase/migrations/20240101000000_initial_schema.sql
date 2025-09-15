-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    company TEXT,
    website TEXT,
    location TEXT,
    timezone TEXT DEFAULT 'UTC',
    preferences JSONB DEFAULT '{}',
    role TEXT DEFAULT 'user',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ideas table
CREATE TABLE public.ideas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    problem_statement TEXT,
    solution_summary TEXT,
    target_market TEXT,
    business_model TEXT,
    status TEXT DEFAULT 'draft',
    score DECIMAL(3,2) DEFAULT 0.00,
    is_public BOOLEAN DEFAULT FALSE,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.user_profiles 
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles 
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage their own ideas" ON public.ideas
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view public ideas" ON public.ideas
    FOR SELECT USING (is_public = true OR auth.uid() = user_id);