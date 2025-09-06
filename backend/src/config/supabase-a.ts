/**
 * Supabase Account A Configuration
 * 
 * Purpose: Read-only access to the global ideas pool
 * Contains: Curated business ideas, market data, trends, embeddings
 * Access: Read-only operations for idea discovery
 */

import { createClient } from '@supabase/supabase-js'

// Account A credentials - read-only access
const SUPABASE_A_URL = process.env.SUPABASE_A_URL!
const SUPABASE_A_ANON_KEY = process.env.SUPABASE_A_ANON_KEY!

if (!SUPABASE_A_URL || !SUPABASE_A_ANON_KEY) {
  throw new Error('Missing Supabase Account A credentials')
}

// Read-only client for ideas pool
export const supabaseA = createClient(SUPABASE_A_URL, SUPABASE_A_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Database schema types for Account A
export interface IdeaPoolRecord {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  source: string
  popularity_score: number
  market_size?: string
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  embedding: number[] // pgvector embedding
  created_at: string
  updated_at: string
}

export interface MarketTrend {
  id: string
  trend_name: string
  description: string
  growth_rate: number
  market_size: string
  related_categories: string[]
  created_at: string
}

// Helper functions for Account A operations
export const ideasPoolAPI = {
  // Get all ideas with optional filtering
  getIdeas: async (filters?: {
    category?: string
    tags?: string[]
    limit?: number
    offset?: number
  }) => {
    let query = supabaseA
      .from('ideas_pool')
      .select('*')
      .order('popularity_score', { ascending: false })

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    return await query
  },

  // Get idea by ID
  getIdeaById: async (id: string) => {
    return await supabaseA
      .from('ideas_pool')
      .select('*')
      .eq('id', id)
      .single()
  },

  // Get ideas by IDs (for similar ideas)
  getIdeasByIds: async (ids: string[]) => {
    return await supabaseA
      .from('ideas_pool')
      .select('*')
      .in('id', ids)
  },

  // Get market trends
  getMarketTrends: async () => {
    return await supabaseA
      .from('market_trends')
      .select('*')
      .order('growth_rate', { ascending: false })
  }
}
