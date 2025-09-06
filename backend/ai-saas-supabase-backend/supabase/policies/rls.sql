-- Row-Level Security Policies for AI SaaS Platform

-- Enable row-level security for all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_page_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_controls ENABLE ROW LEVEL SECURITY;

-- Policy for users to access their own data
CREATE POLICY "Users can view their own profile"
ON users
FOR SELECT
USING (auth.uid() = id);

-- Policy for users to update their own profile
CREATE POLICY "Users can update their own profile"
ON users
FOR UPDATE
USING (auth.uid() = id);

-- Policy for users to create ideas
CREATE POLICY "Users can create ideas"
ON ideas
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Policy for users to view their own ideas
CREATE POLICY "Users can view their own ideas"
ON ideas
FOR SELECT
USING (auth.uid() = user_id);

-- Policy for users to update their own ideas
CREATE POLICY "Users can update their own ideas"
ON ideas
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy for users to delete their own ideas
CREATE POLICY "Users can delete their own ideas"
ON ideas
FOR DELETE
USING (auth.uid() = user_id);

-- Policy for admins to access all data
CREATE POLICY "Admins can access all users"
ON users
FOR SELECT
USING (auth.role() = 'admin');

CREATE POLICY "Admins can access all ideas"
ON ideas
FOR SELECT
USING (auth.role() = 'admin');

-- Policy for moderators to view community features
CREATE POLICY "Moderators can view community features"
ON community_features
FOR SELECT
USING (auth.role() = 'moderator');

-- Policy for billing access
CREATE POLICY "Users can view their own billing info"
ON billing
FOR SELECT
USING (auth.uid() = user_id);

-- Policy for admins to manage billing
CREATE POLICY "Admins can manage billing"
ON billing
FOR ALL
USING (auth.role() = 'admin');

-- Policy for launch page data access
CREATE POLICY "Users can view their own launch page data"
ON launch_page_data
FOR SELECT
USING (auth.uid() = user_id);

-- Policy for admin controls access
CREATE POLICY "Admins can access admin controls"
ON admin_controls
FOR SELECT
USING (auth.role() = 'admin');