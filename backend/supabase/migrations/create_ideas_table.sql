CREATE TABLE IF NOT EXISTS ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  problem_statement TEXT,
  solution_summary TEXT,
  target_market TEXT,
  business_model TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft',
  score NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own ideas" ON ideas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ideas" ON ideas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ideas" ON ideas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ideas" ON ideas
  FOR DELETE USING (auth.uid() = user_id);