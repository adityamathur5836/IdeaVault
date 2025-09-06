-- Account B: Full CRUD user data database schema
-- Purpose: Store user authentication, ideas, progress, and community features

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- User profiles table (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User ideas table (user-generated ideas)
CREATE TABLE user_ideas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    embedding vector(384), -- Optional embedding for user ideas
    similar_ideas JSONB DEFAULT '[]'::jsonb, -- Array of similar idea IDs from Account A
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX user_ideas_user_id_idx ON user_ideas(user_id);
CREATE INDEX user_ideas_status_idx ON user_ideas(status);
CREATE INDEX user_ideas_category_idx ON user_ideas(category);
CREATE INDEX user_ideas_created_at_idx ON user_ideas(created_at DESC);

-- Optional: Vector index for user ideas (if we want to find similar user ideas)
CREATE INDEX user_ideas_embedding_idx ON user_ideas 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 50);

-- Row Level Security (RLS) policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ideas ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles 
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles 
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles 
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for user_ideas
CREATE POLICY "Users can view own ideas" ON user_ideas 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ideas" ON user_ideas 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ideas" ON user_ideas 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ideas" ON user_ideas 
    FOR DELETE USING (auth.uid() = user_id);

-- Function: Get user subscription limits
CREATE OR REPLACE FUNCTION get_user_subscription_limits(user_id_param UUID)
RETURNS TABLE (
    max_ideas INTEGER,
    current_ideas INTEGER,
    can_create_more BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_tier TEXT;
    max_limit INTEGER;
    current_count INTEGER;
BEGIN
    -- Get user's subscription tier
    SELECT subscription_tier INTO user_tier
    FROM user_profiles
    WHERE id = user_id_param;
    
    -- Set limits based on tier
    max_limit := CASE 
        WHEN user_tier = 'premium' THEN 1000
        WHEN user_tier = 'pro' THEN 100
        ELSE 10 -- free tier
    END;
    
    -- Count current ideas
    SELECT COUNT(*)::INTEGER INTO current_count
    FROM user_ideas
    WHERE user_id = user_id_param AND status != 'archived';
    
    RETURN QUERY SELECT 
        max_limit,
        current_count,
        current_count < max_limit;
END;
$$;

-- Function: Auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers: Auto-update updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_ideas_updated_at
    BEFORE UPDATE ON user_ideas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();