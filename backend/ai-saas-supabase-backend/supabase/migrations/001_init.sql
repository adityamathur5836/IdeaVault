-- Enable required extensions FIRST
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Update users table to work with Supabase Auth
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email VARCHAR(255),
    full_name VARCHAR(255),
    avatar_url TEXT,
    company VARCHAR(255),
    bio TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ideas table for user-generated ideas (Account B)
CREATE TABLE user_ideas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    problem_statement TEXT,
    solution_summary TEXT,
    target_market TEXT,
    business_model TEXT,
    revenue_streams TEXT[],
    cost_structure TEXT[],
    key_metrics TEXT[],
    tags TEXT[],
    status VARCHAR(50) DEFAULT 'draft',
    score INTEGER,
    generated_data JSONB DEFAULT '{}',
    validations JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ideas pool table (will be synced to Account A)
CREATE TABLE ideas_pool (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    problem_statement TEXT,
    solution_summary TEXT,
    target_market TEXT,
    business_model TEXT,
    revenue_streams TEXT[],
    cost_structure TEXT[],
    key_metrics TEXT[],
    tags TEXT[],
    difficulty VARCHAR(20) CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    market_size VARCHAR(50),
    time_to_market VARCHAR(50),
    initial_investment VARCHAR(50),
    popularity_score INTEGER DEFAULT 0,
    created_by UUID,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Roadmaps/Tasks table (updated)
CREATE TABLE roadmaps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    idea_id UUID REFERENCES user_ideas(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roadmap_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    roadmap_id UUID REFERENCES roadmaps(id) ON DELETE CASCADE,
    idea_id UUID REFERENCES user_ideas(id) ON DELETE CASCADE,
    task TEXT NOT NULL,
    description TEXT,
    milestone VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    priority INTEGER DEFAULT 1,
    estimated_hours INTEGER,
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Validations table (updated)
CREATE TABLE idea_validations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    idea_id UUID REFERENCES user_ideas(id) ON DELETE CASCADE,
    validator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    validation_type VARCHAR(50) NOT NULL,
    score INTEGER CHECK (score >= 1 AND score <= 10),
    feedback TEXT,
    validation_data JSONB DEFAULT '{}',
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Community tables (updated)
CREATE TABLE community_threads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE community_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    thread_id UUID REFERENCES community_threads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    parent_message_id UUID REFERENCES community_messages(id),
    is_edited BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table (updated)
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subscription plans
CREATE TABLE subscription_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2),
    price_yearly DECIMAL(10,2),
    features TEXT[],
    max_ideas INTEGER DEFAULT 10,
    max_roadmaps INTEGER DEFAULT 5,
    max_validations INTEGER DEFAULT 20,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User subscriptions
CREATE TABLE user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES subscription_plans(id),
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Launch pages
CREATE TABLE launch_pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    idea_id UUID REFERENCES user_ideas(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(500),
    description TEXT,
    features TEXT[],
    pricing JSONB,
    custom_data JSONB DEFAULT '{}',
    is_published BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Admin and moderation tables (updated)
CREATE TABLE admin_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES auth.users(id),
    action VARCHAR(255) NOT NULL,
    target_type VARCHAR(100),
    target_id UUID,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE moderation_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    moderator_id UUID REFERENCES auth.users(id),
    action VARCHAR(255) NOT NULL,
    target_type VARCHAR(100),
    target_id UUID,
    reason TEXT,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_user_ideas_user_id ON user_ideas(user_id);
CREATE INDEX idx_user_ideas_category ON user_ideas(category);
CREATE INDEX idx_user_ideas_status ON user_ideas(status);

CREATE INDEX idx_ideas_pool_category ON ideas_pool(category);
CREATE INDEX idx_ideas_pool_popularity ON ideas_pool(popularity_score DESC);
CREATE INDEX idx_ideas_pool_featured ON ideas_pool(is_featured);

CREATE INDEX idx_roadmap_tasks_roadmap_id ON roadmap_tasks(roadmap_id);
CREATE INDEX idx_roadmap_tasks_status ON roadmap_tasks(status);
CREATE INDEX idx_roadmap_tasks_due_date ON roadmap_tasks(due_date);

CREATE INDEX idx_idea_validations_idea_id ON idea_validations(idea_id);
CREATE INDEX idx_idea_validations_validator_id ON idea_validations(validator_id);

CREATE INDEX idx_community_messages_thread_id ON community_messages(thread_id);
CREATE INDEX idx_community_messages_user_id ON community_messages(user_id);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_pages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- User profiles: users can only access their own profile
CREATE POLICY "Users can view and update own profile" ON user_profiles
    FOR ALL USING (auth.uid() = id);

-- User ideas: users can only access their own ideas
CREATE POLICY "Users can manage their own ideas" ON user_ideas
    FOR ALL USING (auth.uid() = user_id);

-- Ideas pool: read-only for all authenticated users
CREATE POLICY "Anyone can read ideas pool" ON ideas_pool
    FOR SELECT USING (true);

-- Roadmaps: users can only access their own roadmaps
CREATE POLICY "Users can manage their own roadmaps" ON roadmaps
    FOR ALL USING (auth.uid() = user_id);

-- Roadmap tasks: users can only access tasks for their roadmaps
CREATE POLICY "Users can manage their own roadmap tasks" ON roadmap_tasks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM roadmaps 
            WHERE roadmaps.id = roadmap_tasks.roadmap_id 
            AND roadmaps.user_id = auth.uid()
        )
    );

-- Idea validations: users can validate others' ideas and see validations for their ideas
CREATE POLICY "Users can create validations" ON idea_validations
    FOR INSERT WITH CHECK (auth.uid() = validator_id);

CREATE POLICY "Users can view validations for their ideas" ON idea_validations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_ideas 
            WHERE user_ideas.id = idea_validations.idea_id 
            AND user_ideas.user_id = auth.uid()
        )
        OR auth.uid() = validator_id
    );

-- Community: authenticated users can participate
CREATE POLICY "Authenticated users can read community threads" ON community_threads
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create threads" ON community_threads
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own threads" ON community_threads
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Authenticated users can read messages" ON community_messages
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create messages" ON community_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages" ON community_messages
    FOR UPDATE USING (auth.uid() = user_id);

-- Notifications: users can only see their own notifications
CREATE POLICY "Users can manage their own notifications" ON notifications
    FOR ALL USING (auth.uid() = user_id);

-- Subscription plans: readable by all authenticated users
CREATE POLICY "Anyone can read subscription plans" ON subscription_plans
    FOR SELECT USING (auth.role() = 'authenticated');

-- User subscriptions: users can only see their own subscriptions
CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Launch pages: public read access, users can manage their own
CREATE POLICY "Anyone can read published launch pages" ON launch_pages
    FOR SELECT USING (is_published = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own launch pages" ON launch_pages
    FOR ALL USING (auth.uid() = user_id);
