/**
 * Supabase Account B Configuration
 * 
 * Purpose: Full CRUD access for user data and application state
 * Contains: User profiles, user ideas, analytics, subscriptions
 * Access: Full read/write operations for user management
 */

import { createClient } from '@supabase/supabase-js'

// Account B credentials - full CRUD access
const SUPABASE_B_URL = process.env.SUPABASE_B_URL!
const SUPABASE_B_ANON_KEY = process.env.SUPABASE_B_ANON_KEY!
const SUPABASE_B_SERVICE_KEY = process.env.SUPABASE_B_SERVICE_KEY!

if (!SUPABASE_B_URL || !SUPABASE_B_ANON_KEY) {
  throw new Error('Missing Supabase Account B credentials')
}

// Client for user operations (with RLS)
export const supabaseB = createClient(SUPABASE_B_URL, SUPABASE_B_ANON_KEY)

// Service client for admin operations (bypasses RLS)
export const supabaseBService = createClient(SUPABASE_B_URL, SUPABASE_B_SERVICE_KEY)

// Database schema types for Account B
export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  subscription_tier: 'free' | 'pro' | 'premium'
  subscription_status: 'active' | 'inactive' | 'cancelled'
  created_at: string
  updated_at: string
  last_login?: string
  preferences: {
    theme: 'light' | 'dark'
    notifications: boolean
    categories: string[]
  }
}

export interface UserIdea {
  id: string
  user_id: string
  title: string
  description: string
  category: string
  tags: string[]
  status: 'draft' | 'published' | 'archived'
  validation_score?: number
  validation_feedback?: string
  embedding?: number[]
  similar_ideas?: string[]
  created_at: string
  updated_at: string
}

export interface UserAnalytics {
  id: string
  user_id: string
  total_ideas: number
  published_ideas: number
  total_searches: number
  avg_idea_score: number
  most_used_categories: string[]
  activity_streak: number
  last_active: string
  created_at: string
  updated_at: string
}

// Helper functions for Account B operations
export const userDataAPI = {
  // User Profile Operations
  getUserProfile: async (userId: string) => {
    return await supabaseB
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
  },

  updateUserProfile: async (userId: string, updates: Partial<UserProfile>) => {
    return await supabaseB
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
  },

  // User Ideas Operations
  getUserIdeas: async (userId: string, filters?: {
    status?: string
    category?: string
    limit?: number
    offset?: number
  }) => {
    let query = supabaseB
      .from('user_ideas')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    return await query
  },

  createUserIdea: async (idea: Omit<UserIdea, 'id' | 'created_at' | 'updated_at'>) => {
    return await supabaseB
      .from('user_ideas')
      .insert(idea)
      .select()
      .single()
  },

  updateUserIdea: async (ideaId: string, updates: Partial<UserIdea>) => {
    return await supabaseB
      .from('user_ideas')
      .update(updates)
      .eq('id', ideaId)
  },

  deleteUserIdea: async (ideaId: string) => {
    return await supabaseB
      .from('user_ideas')
      .delete()
      .eq('id', ideaId)
  },

  // Analytics Operations
  getUserAnalytics: async (userId: string) => {
    return await supabaseB
      .from('user_analytics')
      .select('*')
      .eq('user_id', userId)
      .single()
  },

  updateUserAnalytics: async (userId: string, analytics: Partial<UserAnalytics>) => {
    return await supabaseB
      .from('user_analytics')
      .upsert({ user_id: userId, ...analytics })
  }
}
