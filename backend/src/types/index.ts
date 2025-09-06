/**
 * TypeScript Type Definitions
 * 
 * Purpose: Centralized type definitions for the entire application
 * Contains: Database types, API types, utility types
 */

// Re-export types from config files
export type { IdeaPoolRecord, MarketTrend } from '../config/supabase-a'
export type { UserProfile, UserIdea } from '../config/supabase-b'

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Search and Filter Types
export interface SearchFilters {
  category?: string
  tags?: string[]
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  minPopularity?: number
  query?: string
}

export interface PaginationOptions {
  page?: number
  limit?: number
  offset?: number
}

// Vector Search Types
export interface VectorSearchOptions {
  threshold?: number
  limit?: number
  category?: string
  forceRefresh?: boolean
}

export interface SimilarityResult {
  id: string
  similarity: number
  data: any
}

export interface SearchMetrics {
  queryText: string
  searchTime: number
  totalFound: number
  averageSimilarity: number
  algorithm?: string
}

// AI/ML Types
export interface EmbeddingResult {
  text: string
  embedding: number[]
  model: string
  dimensions: number
}

export interface IdeaValidation {
  score: number
  feedback: string
  strengths: string[]
  weaknesses: string[]
  suggestions?: string[]
}

export interface IdeaGeneration {
  prompt: string
  generatedIdeas: string[]
  model: string
  temperature: number
}

// User Management Types
export interface UserSession {
  user: {
    id: string
    email: string
    user_metadata: {
      full_name?: string
    }
  }
  access_token: string
  refresh_token: string
}

export interface SubscriptionTier {
  name: 'free' | 'pro' | 'premium'
  features: string[]
  limits: {
    ideasPerMonth: number
    similarSearches: number
    aiValidations: number
  }
  price: number
}

// Community Types
export interface CommunityPost {
  id: string
  user_id: string
  title: string
  content: string
  category: string
  tags: string[]
  likes: number
  comments_count: number
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  content: string
  parent_id?: string
  likes: number
  created_at: string
}

// Analytics Types
export interface UserAnalytics {
  user_id: string
  total_ideas: number
  published_ideas: number
  total_searches: number
  avg_idea_score: number
  most_used_categories: string[]
  activity_streak: number
  last_active: string
}

export interface PlatformAnalytics {
  total_users: number
  total_ideas: number
  total_searches: number
  popular_categories: Array<{
    category: string
    count: number
  }>
  growth_metrics: {
    daily_active_users: number
    weekly_signups: number
    monthly_revenue: number
  }
}

// Error Types
export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: string
  userId?: string
}

export interface ValidationError {
  field: string
  message: string
  value?: any
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// Database Operation Types
export interface DatabaseOperation {
  table: string
  operation: 'insert' | 'update' | 'delete' | 'select'
  data?: any
  filters?: Record<string, any>
  timestamp: string
}

export interface BulkOperation<T> {
  items: T[]
  operation: 'insert' | 'update' | 'delete'
  batchSize?: number
}

// Event Types
export interface AppEvent {
  type: string
  payload: any
  userId?: string
  timestamp: string
  metadata?: Record<string, any>
}

export interface UserEvent extends AppEvent {
  userId: string
  sessionId?: string
}

// Configuration Types
export interface AppConfig {
  database: {
    accountA: {
      url: string
      anonKey: string
    }
    accountB: {
      url: string
      anonKey: string
      serviceKey: string
    }
  }
  ai: {
    openaiApiKey: string
    embeddingModel: string
    embeddingDimensions: number
  }
  features: {
    enableCommunity: boolean
    enableAnalytics: boolean
    enableSubscriptions: boolean
  }
}

// Constants
export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  free: {
    name: 'free',
    features: ['Basic idea storage', 'Limited similar searches'],
    limits: {
      ideasPerMonth: 10,
      similarSearches: 20,
      aiValidations: 5
    },
    price: 0
  },
  pro: {
    name: 'pro',
    features: ['Unlimited ideas', 'Advanced search', 'AI validation'],
    limits: {
      ideasPerMonth: -1,
      similarSearches: 200,
      aiValidations: 50
    },
    price: 9.99
  },
  premium: {
    name: 'premium',
    features: ['Everything in Pro', 'Community access', 'Priority support'],
    limits: {
      ideasPerMonth: -1,
      similarSearches: -1,
      aiValidations: -1
    },
    price: 19.99
  }
}

export const CATEGORIES = [
  'Technology',
  'E-commerce',
  'Healthcare',
  'Education',
  'Finance',
  'Entertainment',
  'Food & Beverage',
  'Travel',
  'Real Estate',
  'Sustainability',
  'Social Impact',
  'B2B Services',
  'Consumer Products',
  'Mobile Apps',
  'SaaS',
  'Marketplace',
  'AI/ML',
  'Blockchain',
  'IoT',
  'Other'
] as const

export type Category = typeof CATEGORIES[number]

export const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'] as const
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number]

export const IDEA_STATUSES = ['draft', 'published', 'archived'] as const
export type IdeaStatus = typeof IDEA_STATUSES[number]