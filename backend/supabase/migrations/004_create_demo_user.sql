-- Create a demo auth user for testing purposes
-- This creates a user in the auth.users table that can be referenced by user_profiles

-- Insert into auth.users (this is the Supabase auth table)
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'demo@ideavault.com',
    crypt('demo123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Demo User", "company": "IdeaVault"}',
    false,
    '',
    '',
    '',
    ''
);

-- Create the corresponding user profile
INSERT INTO public.user_profiles (
    id,
    email,
    full_name,
    bio,
    company,
    role,
    is_verified
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'demo@ideavault.com',
    'Demo User',
    'Entrepreneur and startup enthusiast',
    'IdeaVault',
    'user',
    true
);

-- Create a subscription for the demo user (Professional plan)
INSERT INTO public.user_subscriptions (
    user_id,
    plan_id,
    status,
    current_period_start,
    current_period_end,
    cancel_at_period_end,
    stripe_customer_id,
    stripe_subscription_id
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    (SELECT id FROM public.subscription_plans WHERE name = 'Professional' LIMIT 1),
    'active',
    NOW(),
    NOW() + INTERVAL '1 year',
    false,
    'cus_demo_user',
    'sub_demo_user'
); 