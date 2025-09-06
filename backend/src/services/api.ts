import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase'

type Tables = Database['public']['Tables']
type Ideas = Tables['ideas']['Row']
type IdeasInsert = Tables['ideas']['Insert']
type IdeasUpdate = Tables['ideas']['Update']
type Roadmaps = Tables['roadmaps']['Row']
type RoadmapsInsert = Tables['roadmaps']['Insert']
type RoadmapsUpdate = Tables['roadmaps']['Update']
type Tasks = Tables['roadmap_tasks']['Row']
type TasksInsert = Tables['roadmap_tasks']['Insert']
type TasksUpdate = Tables['roadmap_tasks']['Update']
type UserProfile = Tables['user_profiles']['Row']
type UserProfileUpdate = Tables['user_profiles']['Update']
type SubscriptionPlan = Tables['subscription_plans']['Row']
type UserSubscription = Tables['user_subscriptions']['Row']
type IdeaValidation = Tables['idea_validations']['Row']
type IdeaValidationInsert = Tables['idea_validations']['Insert']
type CommunityThread = Tables['community_threads']['Row']
type CommunityMessage = Tables['community_messages']['Row']
type Notification = Tables['notifications']['Row']
type LaunchPage = Tables['launch_pages']['Row']

// Auth API
export const authAPI = {
  signUp: async (email: string, password: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })
    return { data, error }
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email)
    return { data, error }
  },

  updatePassword: async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password
    })
    return { data, error }
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  }
}

// User Profile API
export const userAPI = {
  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  updateProfile: async (userId: string, updates: UserProfileUpdate) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  },

  getSubscriptionStatus: async (userId: string) => {
    const { data, error } = await supabase
      .rpc('get_user_subscription_status', { p_user_id: userId })
    return { data, error }
  }
}

// Ideas API
export const ideasAPI = {
  getIdeas: async (userId?: string, status?: string, isPublic?: boolean) => {
    let query = supabase
      .from('ideas')
      .select(`
        *,
        user_profiles!ideas_user_id_fkey (
          id,
          full_name,
          avatar_url
        ),
        idea_validations (
          id,
          overall_score,
          created_at
        )
      `)
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (isPublic !== undefined) {
      query = query.eq('is_public', isPublic)
    }

    const { data, error } = await query
    return { data, error }
  },

  getIdea: async (ideaId: string) => {
    const { data, error } = await supabase
      .from('ideas')
      .select(`
        *,
        user_profiles!ideas_user_id_fkey (
          id,
          full_name,
          avatar_url,
          company
        ),
        idea_validations (
          id,
          market_fit_score,
          feasibility_score,
          innovation_score,
          scalability_score,
          overall_score,
          feedback,
          is_anonymous,
          created_at,
          user_profiles!idea_validations_validator_id_fkey (
            id,
            full_name,
            avatar_url
          )
        )
      `)
      .eq('id', ideaId)
      .single()
    return { data, error }
  },

  createIdea: async (idea: IdeasInsert) => {
    const { data, error } = await supabase
      .from('ideas')
      .insert(idea)
      .select()
      .single()
    return { data, error }
  },

  updateIdea: async (ideaId: string, updates: IdeasUpdate) => {
    const { data, error } = await supabase
      .from('ideas')
      .update(updates)
      .eq('id', ideaId)
      .select()
      .single()
    return { data, error }
  },

  deleteIdea: async (ideaId: string) => {
    const { error } = await supabase
      .from('ideas')
      .delete()
      .eq('id', ideaId)
    return { error }
  },

  validateIdea: async (validation: IdeaValidationInsert) => {
    const { data, error } = await supabase
      .from('idea_validations')
      .insert(validation)
      .select()
      .single()
    return { data, error }
  },

  // AI Idea Generation
  generateIdea: async (params: {
    industry?: string
    problem_area?: string
    target_audience?: string
    budget_range?: string
    timeframe?: string
    user_id: string
  }) => {
    const { data, error } = await supabase.functions.invoke('ai-idea-generator', {
      body: params
    })
    return { data, error }
  },

  // AI Idea Grading
  gradeIdea: async (params: {
    idea_id: string
    validator_id: string
    market_fit_score: number
    feasibility_score: number
    innovation_score: number
    scalability_score: number
    overall_score: number
    feedback: string
    is_anonymous: boolean
  }) => {
    const { data, error } = await supabase.functions.invoke('idea-grading', {
      body: params
    })
    return { data, error }
  }
}

// Roadmaps API
export const roadmapsAPI = {
  getRoadmaps: async (userId?: string, ideaId?: string) => {
    let query = supabase
      .from('roadmaps')
      .select(`
        *,
        ideas!roadmaps_idea_id_fkey (
          id,
          title,
          description
        ),
        roadmap_tasks (
          id,
          title,
          status,
          priority,
          due_date
        )
      `)
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }
    if (ideaId) {
      query = query.eq('idea_id', ideaId)
    }

    const { data, error } = await query
    return { data, error }
  },

  getRoadmap: async (roadmapId: string) => {
    const { data, error } = await supabase
      .from('roadmaps')
      .select(`
        *,
        ideas!roadmaps_idea_id_fkey (
          id,
          title,
          description
        ),
        roadmap_tasks (
          id,
          title,
          description,
          status,
          priority,
          estimated_days,
          actual_days,
          dependencies,
          assignee_id,
          due_date,
          completed_at,
          created_at,
          updated_at,
          user_profiles!roadmap_tasks_assignee_id_fkey (
            id,
            full_name,
            avatar_url
          )
        )
      `)
      .eq('id', roadmapId)
      .single()
    return { data, error }
  },

  createRoadmap: async (roadmap: RoadmapsInsert) => {
    const { data, error } = await supabase
      .from('roadmaps')
      .insert(roadmap)
      .select()
      .single()
    return { data, error }
  },

  updateRoadmap: async (roadmapId: string, updates: RoadmapsUpdate) => {
    const { data, error } = await supabase
      .from('roadmaps')
      .update(updates)
      .eq('id', roadmapId)
      .select()
      .single()
    return { data, error }
  },

  deleteRoadmap: async (roadmapId: string) => {
    const { error } = await supabase
      .from('roadmaps')
      .delete()
      .eq('id', roadmapId)
    return { error }
  }
}

// Tasks API
export const tasksAPI = {
  getTasks: async (roadmapId: string) => {
    const { data, error } = await supabase
      .from('roadmap_tasks')
      .select(`
        *,
        user_profiles!roadmap_tasks_assignee_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('roadmap_id', roadmapId)
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true })
    return { data, error }
  },

  getTask: async (taskId: string) => {
    const { data, error } = await supabase
      .from('roadmap_tasks')
      .select(`
        *,
        user_profiles!roadmap_tasks_assignee_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('id', taskId)
      .single()
    return { data, error }
  },

  createTask: async (task: TasksInsert) => {
    const { data, error } = await supabase
      .from('roadmap_tasks')
      .insert(task)
      .select()
      .single()
    return { data, error }
  },

  updateTask: async (taskId: string, updates: TasksUpdate) => {
    const { data, error } = await supabase
      .from('roadmap_tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single()
    return { data, error }
  },

  deleteTask: async (taskId: string) => {
    const { error } = await supabase
      .from('roadmap_tasks')
      .delete()
      .eq('id', taskId)
    return { error }
  }
}

// Subscription API
export const subscriptionAPI = {
  getPlans: async () => {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true })
    return { data, error }
  },

  getUserSubscription: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans!user_subscriptions_plan_id_fkey (
          id,
          name,
          description,
          price_monthly,
          price_yearly,
          features,
          max_ideas,
          max_roadmaps,
          max_collaborators
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()
    return { data, error }
  },

  createSubscription: async (subscription: {
    user_id: string
    plan_id: string
    stripe_customer_id?: string
    stripe_subscription_id?: string
  }) => {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert(subscription)
      .select()
      .single()
    return { data, error }
  },

  updateSubscription: async (subscriptionId: string, updates: {
    status?: string
    current_period_start?: string
    current_period_end?: string
    cancel_at_period_end?: boolean
  }) => {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .update(updates)
      .eq('id', subscriptionId)
      .select()
      .single()
    return { data, error }
  }
}

// Community API
export const communityAPI = {
  getThreads: async (ideaId?: string) => {
    let query = supabase
      .from('community_threads')
      .select(`
        *,
        user_profiles!community_threads_author_id_fkey (
          id,
          full_name,
          avatar_url
        ),
        ideas!community_threads_idea_id_fkey (
          id,
          title
        ),
        community_messages (
          id
        )
      `)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })

    if (ideaId) {
      query = query.eq('idea_id', ideaId)
    }

    const { data, error } = await query
    return { data, error }
  },

  getThread: async (threadId: string) => {
    const { data, error } = await supabase
      .from('community_threads')
      .select(`
        *,
        user_profiles!community_threads_author_id_fkey (
          id,
          full_name,
          avatar_url
        ),
        ideas!community_threads_idea_id_fkey (
          id,
          title
        )
      `)
      .eq('id', threadId)
      .single()
    return { data, error }
  },

  createThread: async (thread: {
    title: string
    content: string
    author_id: string
    idea_id?: string
  }) => {
    const { data, error } = await supabase
      .from('community_threads')
      .insert(thread)
      .select()
      .single()
    return { data, error }
  },

  getMessages: async (threadId: string) => {
    const { data, error } = await supabase
      .from('community_messages')
      .select(`
        *,
        user_profiles!community_messages_author_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })
    return { data, error }
  },

  createMessage: async (message: {
    thread_id: string
    author_id: string
    content: string
    parent_message_id?: string
  }) => {
    const { data, error } = await supabase
      .from('community_messages')
      .insert(message)
      .select()
      .single()
    return { data, error }
  }
}

// Notifications API
export const notificationsAPI = {
  getNotifications: async (userId: string, isRead?: boolean) => {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (isRead !== undefined) {
      query = query.eq('is_read', isRead)
    }

    const { data, error } = await query
    return { data, error }
  },

  markAsRead: async (notificationId: string) => {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single()
    return { data, error }
  },

  markAllAsRead: async (userId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
    return { error }
  }
}

// Launch Pages API
export const launchPagesAPI = {
  getLaunchPages: async (userId?: string, isPublished?: boolean) => {
    let query = supabase
      .from('launch_pages')
      .select(`
        *,
        ideas!launch_pages_idea_id_fkey (
          id,
          title,
          description
        )
      `)
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }
    if (isPublished !== undefined) {
      query = query.eq('is_published', isPublished)
    }

    const { data, error } = await query
    return { data, error }
  },

  getLaunchPage: async (slug: string) => {
    const { data, error } = await supabase
      .from('launch_pages')
      .select(`
        *,
        ideas!launch_pages_idea_id_fkey (
          id,
          title,
          description,
          problem_statement,
          solution_summary,
          target_market
        )
      `)
      .eq('slug', slug)
      .eq('is_published', true)
      .single()
    return { data, error }
  },

  createLaunchPage: async (launchPage: {
    idea_id: string
    user_id: string
    title: string
    subtitle?: string
    description?: string
    features?: any
    pricing?: any
    call_to_action?: string
  }) => {
    const { data, error } = await supabase
      .from('launch_pages')
      .insert(launchPage)
      .select()
      .single()
    return { data, error }
  },

  updateLaunchPage: async (launchPageId: string, updates: {
    title?: string
    subtitle?: string
    description?: string
    features?: any
    pricing?: any
    call_to_action?: string
    is_published?: boolean
  }) => {
    const { data, error } = await supabase
      .from('launch_pages')
      .update(updates)
      .eq('id', launchPageId)
      .select()
      .single()
    return { data, error }
  },

  incrementViewCount: async (launchPageId: string) => {
    const { data, error } = await supabase
      .from('launch_pages')
      .update({ view_count: supabase.sql`view_count + 1` })
      .eq('id', launchPageId)
      .select()
      .single()
    return { data, error }
  }
}

// Real-time subscriptions
export const realtimeAPI = {
  subscribeToIdeas: (userId: string, callback: (payload: any) => void) => {
    return supabase
      .channel('ideas')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'ideas',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe()
  },

  subscribeToNotifications: (userId: string, callback: (payload: any) => void) => {
    return supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe()
  },

  subscribeToCommunityMessages: (threadId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`thread-${threadId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'community_messages',
        filter: `thread_id=eq.${threadId}`
      }, callback)
      .subscribe()
  }
} 