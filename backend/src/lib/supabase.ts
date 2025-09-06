import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Database types
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          company: string | null
          website: string | null
          location: string | null
          timezone: string
          preferences: any
          role: 'user' | 'moderator' | 'admin'
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          website?: string | null
          location?: string | null
          timezone?: string
          preferences?: any
          role?: 'user' | 'moderator' | 'admin'
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          website?: string | null
          location?: string | null
          timezone?: string
          preferences?: any
          role?: 'user' | 'moderator' | 'admin'
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      subscription_plans: {
        Row: {
          id: string
          name: string
          description: string | null
          price_monthly: number | null
          price_yearly: number | null
          features: any
          max_ideas: number
          max_roadmaps: number
          max_collaborators: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price_monthly?: number | null
          price_yearly?: number | null
          features?: any
          max_ideas?: number
          max_roadmaps?: number
          max_collaborators?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price_monthly?: number | null
          price_yearly?: number | null
          features?: any
          max_ideas?: number
          max_roadmaps?: number
          max_collaborators?: number
          is_active?: boolean
          created_at?: string
        }
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string | null
          status: 'active' | 'cancelled' | 'past_due' | 'unpaid'
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id?: string | null
          status?: 'active' | 'cancelled' | 'past_due' | 'unpaid'
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string | null
          status?: 'active' | 'cancelled' | 'past_due' | 'unpaid'
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ideas: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          problem_statement: string | null
          solution_summary: string | null
          target_market: string | null
          competitive_analysis: any
          business_model: string | null
          revenue_streams: any
          cost_structure: any
          key_metrics: any
          status: 'draft' | 'active' | 'archived' | 'completed'
          score: number
          validation_count: number
          is_public: boolean
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          problem_statement?: string | null
          solution_summary?: string | null
          target_market?: string | null
          competitive_analysis?: any
          business_model?: string | null
          revenue_streams?: any
          cost_structure?: any
          key_metrics?: any
          status?: 'draft' | 'active' | 'archived' | 'completed'
          score?: number
          validation_count?: number
          is_public?: boolean
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          problem_statement?: string | null
          solution_summary?: string | null
          target_market?: string | null
          competitive_analysis?: any
          business_model?: string | null
          revenue_streams?: any
          cost_structure?: any
          key_metrics?: any
          status?: 'draft' | 'active' | 'archived' | 'completed'
          score?: number
          validation_count?: number
          is_public?: boolean
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      idea_validations: {
        Row: {
          id: string
          idea_id: string
          validator_id: string
          market_fit_score: number
          feasibility_score: number
          innovation_score: number
          scalability_score: number
          overall_score: number
          feedback: string | null
          is_anonymous: boolean
          created_at: string
        }
        Insert: {
          id?: string
          idea_id: string
          validator_id: string
          market_fit_score: number
          feasibility_score: number
          innovation_score: number
          scalability_score: number
          overall_score: number
          feedback?: string | null
          is_anonymous?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          idea_id?: string
          validator_id?: string
          market_fit_score?: number
          feasibility_score?: number
          innovation_score?: number
          scalability_score?: number
          overall_score?: number
          feedback?: string | null
          is_anonymous?: boolean
          created_at?: string
        }
      }
      roadmaps: {
        Row: {
          id: string
          idea_id: string
          user_id: string
          title: string
          description: string | null
          estimated_duration_days: number | null
          budget_estimate: number | null
          priority_level: number
          is_template: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          idea_id: string
          user_id: string
          title: string
          description?: string | null
          estimated_duration_days?: number | null
          budget_estimate?: number | null
          priority_level?: number
          is_template?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          idea_id?: string
          user_id?: string
          title?: string
          description?: string | null
          estimated_duration_days?: number | null
          budget_estimate?: number | null
          priority_level?: number
          is_template?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      roadmap_tasks: {
        Row: {
          id: string
          roadmap_id: string
          title: string
          description: string | null
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          priority: number
          estimated_days: number | null
          actual_days: number | null
          dependencies: string[] | null
          assignee_id: string | null
          due_date: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          roadmap_id: string
          title: string
          description?: string | null
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          priority?: number
          estimated_days?: number | null
          actual_days?: number | null
          dependencies?: string[] | null
          assignee_id?: string | null
          due_date?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          roadmap_id?: string
          title?: string
          description?: string | null
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          priority?: number
          estimated_days?: number | null
          actual_days?: number | null
          dependencies?: string[] | null
          assignee_id?: string | null
          due_date?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      community_threads: {
        Row: {
          id: string
          title: string
          content: string
          author_id: string
          idea_id: string | null
          is_pinned: boolean
          is_locked: boolean
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          author_id: string
          idea_id?: string | null
          is_pinned?: boolean
          is_locked?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          author_id?: string
          idea_id?: string | null
          is_pinned?: boolean
          is_locked?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      community_messages: {
        Row: {
          id: string
          thread_id: string
          author_id: string
          content: string
          parent_message_id: string | null
          is_edited: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          thread_id: string
          author_id: string
          content: string
          parent_message_id?: string | null
          is_edited?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          thread_id?: string
          author_id?: string
          content?: string
          parent_message_id?: string | null
          is_edited?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'idea_comment' | 'task_update' | 'subscription' | 'system'
          title: string
          message: string
          data: any
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'idea_comment' | 'task_update' | 'subscription' | 'system'
          title: string
          message: string
          data?: any
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'idea_comment' | 'task_update' | 'subscription' | 'system'
          title?: string
          message?: string
          data?: any
          is_read?: boolean
          created_at?: string
        }
      }
      launch_pages: {
        Row: {
          id: string
          idea_id: string
          user_id: string
          slug: string
          title: string
          subtitle: string | null
          hero_image_url: string | null
          description: string | null
          features: any
          pricing: any
          call_to_action: string | null
          custom_css: string | null
          is_published: boolean
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          idea_id: string
          user_id: string
          slug?: string
          title: string
          subtitle?: string | null
          hero_image_url?: string | null
          description?: string | null
          features?: any
          pricing?: any
          call_to_action?: string | null
          custom_css?: string | null
          is_published?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          idea_id?: string
          user_id?: string
          slug?: string
          title?: string
          subtitle?: string | null
          hero_image_url?: string | null
          description?: string | null
          features?: any
          pricing?: any
          call_to_action?: string | null
          custom_css?: string | null
          is_published?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_subscription_status: {
        Args: {
          p_user_id: string
        }
        Returns: any
      }
    }
    Enums: {
      idea_status: 'draft' | 'active' | 'archived' | 'completed'
      task_status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
      subscription_status: 'active' | 'cancelled' | 'past_due' | 'unpaid'
      user_role: 'user' | 'moderator' | 'admin'
      notification_type: 'idea_comment' | 'task_update' | 'subscription' | 'system'
    }
  }
} 