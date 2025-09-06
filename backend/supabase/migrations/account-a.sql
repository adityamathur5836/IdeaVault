-- Account A: Read-only ideas pool database schema
-- Purpose: Store curated ideas with vector embeddings for similarity search

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Ideas pool table (curated ideas for similarity search)
CREATE TABLE ideas_pool (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    tags JSONB DEFAULT '[]'::jsonb,
    source TEXT, -- e.g., "Product Hunt", "Manual", "Import"
    popularity_score INTEGER DEFAULT 0,
    embedding vector(384), -- OpenAI text-embedding-3-small
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX ideas_pool_category_idx ON ideas_pool(category);
CREATE INDEX ideas_pool_popularity_idx ON ideas_pool(popularity_score DESC);
CREATE INDEX ideas_pool_text_search_idx ON ideas_pool USING gin(to_tsvector('english', title || ' ' || description));

-- Vector similarity search index (pgvector)
CREATE INDEX ideas_pool_embedding_idx ON ideas_pool 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- Function: Vector similarity search with optional category filter
CREATE OR REPLACE FUNCTION match_similar_ideas(
  query_embedding vector(384),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  category_filter text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  category text,
  tags jsonb,
  source text,
  popularity_score int,
  embedding vector(384),
  created_at timestamptz,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.description,
    p.category,
    p.tags,
    p.source,
    p.popularity_score,
    p.embedding,
    p.created_at,
    1 - (p.embedding <=> query_embedding) AS similarity
  FROM ideas_pool p
  WHERE p.embedding IS NOT NULL
    AND 1 - (p.embedding <=> query_embedding) > match_threshold
    AND (category_filter IS NULL OR p.category = category_filter)
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function: Get random ideas for inspiration
CREATE OR REPLACE FUNCTION get_random_ideas(idea_limit int DEFAULT 5)
RETURNS SETOF ideas_pool
LANGUAGE sql
AS $$
  SELECT * FROM ideas_pool 
  WHERE embedding IS NOT NULL
  ORDER BY RANDOM() 
  LIMIT idea_limit;
$$;

-- Function: Get ideas without embeddings (for batch processing)
CREATE OR REPLACE FUNCTION get_ideas_without_embeddings(batch_size int DEFAULT 100)
RETURNS SETOF ideas_pool
LANGUAGE sql
AS $$
  SELECT * FROM ideas_pool 
  WHERE embedding IS NULL
  ORDER BY created_at DESC
  LIMIT batch_size;
$$;

-- Sample data (remove in production)
INSERT INTO ideas_pool (title, description, category, tags, source, popularity_score) VALUES
('AI-Powered Code Review', 'Automated code review tool using machine learning to detect bugs and suggest improvements', 'Technology', '["AI", "Development", "Code Quality"]', 'Manual', 850),
('Sustainable Food Delivery', 'Zero-waste food delivery service using reusable containers and electric vehicles', 'Sustainability', '["Food", "Environment", "Delivery"]', 'Manual', 720),
('Virtual Reality Fitness', 'Immersive VR fitness platform with gamified workouts and social features', 'Health & Fitness', '["VR", "Fitness", "Gaming"]', 'Manual', 650),
('Smart Plant Care', 'IoT sensors and app for automated plant care with AI-driven recommendations', 'IoT', '["Plants", "IoT", "Automation"]', 'Manual', 580),
('Blockchain Voting', 'Secure, transparent voting system using blockchain technology', 'Blockchain', '["Voting", "Security", "Democracy"]', 'Manual', 920);