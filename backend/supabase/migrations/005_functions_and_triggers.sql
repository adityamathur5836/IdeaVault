-- Function to calculate idea score based on validations
CREATE OR REPLACE FUNCTION calculate_idea_score(idea_uuid UUID)
RETURNS DECIMAL(3,2) AS $$
DECLARE
    avg_score DECIMAL(3,2);
BEGIN
    SELECT AVG(overall_score) INTO avg_score
    FROM public.idea_validations
    WHERE idea_id = idea_uuid;
    
    RETURN COALESCE(avg_score, 0.00);
END;
$$ LANGUAGE plpgsql;

-- Function to update idea score when validation is added/updated
CREATE OR REPLACE FUNCTION update_idea_score()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.ideas 
    SET 
        score = calculate_idea_score(NEW.idea_id),
        validation_count = (
            SELECT COUNT(*) 
            FROM public.idea_validations 
            WHERE idea_id = NEW.idea_id
        )
    WHERE id = NEW.idea_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update idea score on validation changes
CREATE TRIGGER trigger_update_idea_score
    AFTER INSERT OR UPDATE OR DELETE ON public.idea_validations
    FOR EACH ROW
    EXECUTE FUNCTION update_idea_score();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type notification_type,
    p_title TEXT,
    p_message TEXT,
    p_data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (p_user_id, p_type, p_title, p_message, p_data)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle idea validation notifications
CREATE OR REPLACE FUNCTION handle_idea_validation_notification()
RETURNS TRIGGER AS $$
DECLARE
    idea_title TEXT;
    idea_owner_id UUID;
BEGIN
    -- Get idea details
    SELECT title, user_id INTO idea_title, idea_owner_id
    FROM public.ideas
    WHERE id = NEW.idea_id;
    
    -- Create notification for idea owner
    PERFORM create_notification(
        idea_owner_id,
        'idea_comment',
        'New Idea Validation',
        'Your idea "' || idea_title || '" received a new validation with score ' || NEW.overall_score || '/10',
        jsonb_build_object('idea_id', NEW.idea_id, 'validation_id', NEW.id)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for idea validation notifications
CREATE TRIGGER trigger_idea_validation_notification
    AFTER INSERT ON public.idea_validations
    FOR EACH ROW
    EXECUTE FUNCTION handle_idea_validation_notification();

-- Function to handle task assignment notifications
CREATE OR REPLACE FUNCTION handle_task_assignment_notification()
RETURNS TRIGGER AS $$
DECLARE
    task_title TEXT;
    roadmap_title TEXT;
BEGIN
    -- Only trigger if assignee changed
    IF OLD.assignee_id IS DISTINCT FROM NEW.assignee_id AND NEW.assignee_id IS NOT NULL THEN
        -- Get task and roadmap details
        SELECT rt.title, r.title INTO task_title, roadmap_title
        FROM public.roadmap_tasks rt
        JOIN public.roadmaps r ON rt.roadmap_id = r.id
        WHERE rt.id = NEW.id;
        
        -- Create notification for assignee
        PERFORM create_notification(
            NEW.assignee_id,
            'task_update',
            'Task Assigned',
            'You have been assigned to task "' || task_title || '" in roadmap "' || roadmap_title || '"',
            jsonb_build_object('task_id', NEW.id, 'roadmap_id', NEW.roadmap_id)
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for task assignment notifications
CREATE TRIGGER trigger_task_assignment_notification
    AFTER UPDATE ON public.roadmap_tasks
    FOR EACH ROW
    EXECUTE FUNCTION handle_task_assignment_notification();

-- Function to handle subscription status changes
CREATE OR REPLACE FUNCTION handle_subscription_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Create notification for subscription status change
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        PERFORM create_notification(
            NEW.user_id,
            'subscription',
            'Subscription Status Updated',
            'Your subscription status has changed to: ' || NEW.status,
            jsonb_build_object('subscription_id', NEW.id, 'status', NEW.status)
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for subscription status changes
CREATE TRIGGER trigger_subscription_status_change
    AFTER UPDATE ON public.user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION handle_subscription_status_change();

-- Function to check subscription limits
CREATE OR REPLACE FUNCTION check_subscription_limits()
RETURNS TRIGGER AS $$
DECLARE
    user_plan RECORD;
    current_ideas_count INTEGER;
    current_roadmaps_count INTEGER;
BEGIN
    -- Get user's current subscription
    SELECT sp.* INTO user_plan
    FROM public.user_subscriptions us
    JOIN public.subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = NEW.user_id AND us.status = 'active'
    LIMIT 1;
    
    -- If no active subscription, use free tier limits
    IF user_plan IS NULL THEN
        user_plan.max_ideas := 3;
        user_plan.max_roadmaps := 1;
    END IF;
    
    -- Check ideas limit
    IF TG_TABLE_NAME = 'ideas' THEN
        SELECT COUNT(*) INTO current_ideas_count
        FROM public.ideas
        WHERE user_id = NEW.user_id AND status != 'archived';
        
        IF current_ideas_count >= user_plan.max_ideas THEN
            RAISE EXCEPTION 'Idea limit exceeded. Upgrade your subscription to create more ideas.';
        END IF;
    END IF;
    
    -- Check roadmaps limit
    IF TG_TABLE_NAME = 'roadmaps' THEN
        SELECT COUNT(*) INTO current_roadmaps_count
        FROM public.roadmaps
        WHERE user_id = NEW.user_id;
        
        IF current_roadmaps_count >= user_plan.max_roadmaps THEN
            RAISE EXCEPTION 'Roadmap limit exceeded. Upgrade your subscription to create more roadmaps.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for subscription limit checks
CREATE TRIGGER trigger_check_idea_limits
    BEFORE INSERT ON public.ideas
    FOR EACH ROW
    EXECUTE FUNCTION check_subscription_limits();

CREATE TRIGGER trigger_check_roadmap_limits
    BEFORE INSERT ON public.roadmaps
    FOR EACH ROW
    EXECUTE FUNCTION check_subscription_limits();

-- Function to generate unique launch page slug
CREATE OR REPLACE FUNCTION generate_unique_slug(p_title TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 1;
BEGIN
    -- Convert title to slug
    base_slug := lower(regexp_replace(p_title, '[^a-zA-Z0-9\s-]', '', 'g'));
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := trim(both '-' from base_slug);
    
    final_slug := base_slug;
    
    -- Check if slug exists and append number if needed
    WHILE EXISTS (SELECT 1 FROM public.launch_pages WHERE slug = final_slug) LOOP
        final_slug := base_slug || '-' || counter;
        counter := counter + 1;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-generate slug for launch pages
CREATE OR REPLACE FUNCTION auto_generate_launch_page_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_unique_slug(NEW.title);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-generating launch page slugs
CREATE TRIGGER trigger_auto_generate_launch_page_slug
    BEFORE INSERT ON public.launch_pages
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_launch_page_slug();

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
    p_action TEXT,
    p_target_type TEXT DEFAULT NULL,
    p_target_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.admin_logs (admin_id, action, target_type, target_id, details, ip_address, user_agent)
    VALUES (
        auth.uid(),
        p_action,
        p_target_type,
        p_target_id,
        p_details,
        inet_client_addr(),
        current_setting('request.headers', true)::json->>'user-agent'
    )
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user subscription status
CREATE OR REPLACE FUNCTION get_user_subscription_status(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    subscription_data JSONB;
BEGIN
    SELECT jsonb_build_object(
        'status', us.status,
        'plan_name', sp.name,
        'plan_features', sp.features,
        'max_ideas', sp.max_ideas,
        'max_roadmaps', sp.max_roadmaps,
        'current_period_end', us.current_period_end,
        'cancel_at_period_end', us.cancel_at_period_end
    ) INTO subscription_data
    FROM public.user_subscriptions us
    JOIN public.subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = p_user_id AND us.status = 'active'
    LIMIT 1;
    
    RETURN COALESCE(subscription_data, '{"status": "free", "plan_name": "Free", "max_ideas": 3, "max_roadmaps": 1}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 