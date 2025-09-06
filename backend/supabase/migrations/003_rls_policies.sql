-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.launch_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view their own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Subscription Plans Policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view subscription plans" ON public.subscription_plans
    FOR SELECT USING (auth.role() = 'authenticated');

-- User Subscriptions Policies
CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON public.user_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" ON public.user_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can manage all subscriptions
CREATE POLICY "Admins can manage all subscriptions" ON public.user_subscriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Ideas Policies
CREATE POLICY "Users can view their own ideas" ON public.ideas
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public ideas" ON public.ideas
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create ideas" ON public.ideas
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ideas" ON public.ideas
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ideas" ON public.ideas
    FOR DELETE USING (auth.uid() = user_id);

-- Admins and moderators can view all ideas
CREATE POLICY "Admins and moderators can view all ideas" ON public.ideas
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

-- Idea Validations Policies
CREATE POLICY "Users can view validations for ideas they own" ON public.idea_validations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.ideas 
            WHERE id = idea_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view validations for public ideas" ON public.idea_validations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.ideas 
            WHERE id = idea_id AND is_public = true
        )
    );

CREATE POLICY "Users can create validations for public ideas" ON public.idea_validations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.ideas 
            WHERE id = idea_id AND is_public = true
        ) AND auth.uid() = validator_id
    );

CREATE POLICY "Users can update their own validations" ON public.idea_validations
    FOR UPDATE USING (auth.uid() = validator_id);

-- Roadmaps Policies
CREATE POLICY "Users can view their own roadmaps" ON public.roadmaps
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create roadmaps" ON public.roadmaps
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own roadmaps" ON public.roadmaps
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own roadmaps" ON public.roadmaps
    FOR DELETE USING (auth.uid() = user_id);

-- Roadmap Tasks Policies
CREATE POLICY "Users can view tasks for their own roadmaps" ON public.roadmap_tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.roadmaps 
            WHERE id = roadmap_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create tasks for their own roadmaps" ON public.roadmap_tasks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.roadmaps 
            WHERE id = roadmap_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update tasks for their own roadmaps" ON public.roadmap_tasks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.roadmaps 
            WHERE id = roadmap_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete tasks for their own roadmaps" ON public.roadmap_tasks
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.roadmaps 
            WHERE id = roadmap_id AND user_id = auth.uid()
        )
    );

-- Community Threads Policies
CREATE POLICY "Users can view all threads" ON public.community_threads
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create threads" ON public.community_threads
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own threads" ON public.community_threads
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own threads" ON public.community_threads
    FOR DELETE USING (auth.uid() = author_id);

-- Moderators and admins can manage all threads
CREATE POLICY "Moderators and admins can manage all threads" ON public.community_threads
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

-- Community Messages Policies
CREATE POLICY "Users can view messages in threads" ON public.community_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.community_threads 
            WHERE id = thread_id
        )
    );

CREATE POLICY "Users can create messages" ON public.community_messages
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own messages" ON public.community_messages
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own messages" ON public.community_messages
    FOR DELETE USING (auth.uid() = author_id);

-- Moderators and admins can manage all messages
CREATE POLICY "Moderators and admins can manage all messages" ON public.community_messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

-- Notifications Policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Launch Pages Policies
CREATE POLICY "Users can view their own launch pages" ON public.launch_pages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view published launch pages" ON public.launch_pages
    FOR SELECT USING (is_published = true);

CREATE POLICY "Users can create launch pages" ON public.launch_pages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own launch pages" ON public.launch_pages
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own launch pages" ON public.launch_pages
    FOR DELETE USING (auth.uid() = user_id);

-- Admin Logs Policies (admin only)
CREATE POLICY "Admins can view admin logs" ON public.admin_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can create admin logs" ON public.admin_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Moderation Actions Policies (moderators and admins only)
CREATE POLICY "Moderators and admins can view moderation actions" ON public.moderation_actions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "Moderators and admins can create moderation actions" ON public.moderation_actions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "Moderators and admins can update moderation actions" ON public.moderation_actions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    ); 