-- Create a test user for development purposes
-- Run this script in Supabase SQL Editor or via psql

-- Create auth user
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
) ON CONFLICT (id) DO NOTHING;

-- Create user profile
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
) ON CONFLICT (id) DO NOTHING;

-- Output success message
SELECT 'Demo user created successfully!' as message; 