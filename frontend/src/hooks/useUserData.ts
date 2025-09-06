/**
 * User Data Hook
 * 
 * Purpose: React hook for managing user data in Account B
 * Functionality: CRUD operations for user ideas, profile management
 */

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { toast } from 'sonner'

// Account B client (full CRUD)
const supabaseB = createClient(
  import.meta.env.VITE_SUPABASE_B_URL,
  import.meta.env.VITE_SUPABASE_B_ANON_KEY
)

export interface UserIdea {
  id: string
  user_id: string
  title: string
  description: string
  category: string
  tags: string[]
  status: 'draft' | 'published' | 'archived'
  similar_ideas: string[]
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  email: string
  full_name: string
  subscription_tier: 'free' | 'pro' | 'premium'
  created_at: string
}

export const useUserData = () => {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [ideas, setIdeas] = useState<UserIdea[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize user session
  useEffect(() => {
    // Get initial session
    supabaseB.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
        fetchUserIdeas(session.user.id)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabaseB.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchUserProfile(session.user.id)
          fetchUserIdeas(session.user.id)
        } else {
          setProfile(null)
          setIdeas([])
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Fetch user profile
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabaseB
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      setProfile(data)
    } catch (err) {
      console.error('Failed to fetch user profile:', err)
    }
  }

  // Fetch user ideas
  const fetchUserIdeas = async (userId: string, status?: string) => {
    setLoading(true)
    setError(null)

    try {
      let query = supabaseB
        .from('user_ideas')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query

      if (error) throw error

      setIdeas(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ideas')
      setIdeas([])
    } finally {
      setLoading(false)
    }
  }

  // Create new idea
  const createIdea = async (ideaData: Partial<UserIdea>) => {
    if (!user) {
      toast.error('Please sign in to create ideas')
      return null
    }

    setLoading(true)

    try {
      const { data, error } = await supabaseB
        .from('user_ideas')
        .insert({
          user_id: user.id,
          title: ideaData.title,
          description: ideaData.description,
          category: ideaData.category,
          tags: ideaData.tags || [],
          status: ideaData.status || 'draft'
        })
        .select()
        .single()

      if (error) throw error

      setIdeas(prev => [data, ...prev])
      toast.success('Idea created successfully!')
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create idea'
      setError(message)
      toast.error(message)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Update idea
  const updateIdea = async (ideaId: string, updates: Partial<UserIdea>) => {
    if (!user) return null

    setLoading(true)

    try {
      const { data, error } = await supabaseB
        .from('user_ideas')
        .update(updates)
        .eq('id', ideaId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      setIdeas(prev => prev.map(idea => 
        idea.id === ideaId ? data : idea
      ))
      toast.success('Idea updated successfully!')
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update idea'
      setError(message)
      toast.error(message)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Delete idea
  const deleteIdea = async (ideaId: string) => {
    if (!user) return false

    try {
      const { error } = await supabaseB
        .from('user_ideas')
        .delete()
        .eq('id', ideaId)
        .eq('user_id', user.id)

      if (error) throw error

      setIdeas(prev => prev.filter(idea => idea.id !== ideaId))
      toast.success('Idea deleted successfully!')
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete idea'
      toast.error(message)
      return false
    }
  }

  // Authentication methods
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabaseB.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      toast.error(error.message)
      return { data: null, error }
    }
    
    toast.success('Signed in successfully!')
    return { data, error: null }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabaseB.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    })
    
    if (error) {
      toast.error(error.message)
      return { data: null, error }
    }
    
    toast.success('Account created successfully!')
    return { data, error: null }
  }

  const signOut = async () => {
    const { error } = await supabaseB.auth.signOut()
    
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Signed out successfully!')
    }
    
    return { error }
  }

  return {
    // State
    user,
    profile,
    ideas,
    loading,
    error,
    
    // Ideas methods
    createIdea,
    updateIdea,
    deleteIdea,
    refetchIdeas: () => user && fetchUserIdeas(user.id),
    
    // Auth methods
    signIn,
    signUp,
    signOut
  }
}
