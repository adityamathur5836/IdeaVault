/**
 * User Data Manager Module
 * 
 * Purpose: Full CRUD operations on Account B for user data
 * Functionality: Manage user ideas, profiles, progress, validation
 */

import { supabaseB, supabaseBService, type UserProfile, type UserIdea } from '../config/supabase-b'

export class UserDataManager {
  /**
   * Create a new user idea
   * @param userId - User ID
   * @param ideaData - Idea data to create
   * @returns Promise<UserIdea>
   */
  async createUserIdea(userId: string, ideaData: Partial<UserIdea>): Promise<UserIdea> {
    try {
      const { data, error } = await supabaseB
        .from('user_ideas')
        .insert({
          user_id: userId,
          title: ideaData.title,
          description: ideaData.description,
          category: ideaData.category,
          tags: ideaData.tags || [],
          status: ideaData.status || 'draft',
          embedding: ideaData.embedding,
          similar_ideas: ideaData.similar_ideas || []
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create user idea: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error in createUserIdea:', error)
      throw error
    }
  }

  /**
   * Get user's ideas with optional filtering
   * @param userId - User ID
   * @param status - Optional status filter
   * @param limit - Maximum results
   * @returns Promise<UserIdea[]>
   */
  async getUserIdeas(userId: string, status?: string, limit: number = 50): Promise<UserIdea[]> {
    try {
      let query = supabaseB
        .from('user_ideas')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query

      if (error) {
        throw new Error(`Failed to fetch user ideas: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Error in getUserIdeas:', error)
      throw error
    }
  }

  /**
   * Update a user idea
   * @param ideaId - Idea ID to update
   * @param userId - User ID (for security)
   * @param updates - Fields to update
   * @returns Promise<UserIdea>
   */
  async updateUserIdea(ideaId: string, userId: string, updates: Partial<UserIdea>): Promise<UserIdea> {
    try {
      const { data, error } = await supabaseB
        .from('user_ideas')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', ideaId)
        .eq('user_id', userId) // Security: ensure user owns the idea
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update user idea: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error in updateUserIdea:', error)
      throw error
    }
  }

  /**
   * Delete a user idea
   * @param ideaId - Idea ID to delete
   * @param userId - User ID (for security)
   * @returns Promise<boolean>
   */
  async deleteUserIdea(ideaId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabaseB
        .from('user_ideas')
        .delete()
        .eq('id', ideaId)
        .eq('user_id', userId) // Security: ensure user owns the idea

      if (error) {
        throw new Error(`Failed to delete user idea: ${error.message}`)
      }

      return true
    } catch (error) {
      console.error('Error in deleteUserIdea:', error)
      throw error
    }
  }

  /**
   * Get user profile
   * @param userId - User ID
   * @returns Promise<UserProfile | null>
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabaseB
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // Not found
        throw new Error(`Failed to fetch user profile: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error in getUserProfile:', error)
      throw error
    }
  }

  /**
   * Update user profile
   * @param userId - User ID
   * @param updates - Profile updates
   * @returns Promise<UserProfile>
   */
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const { data, error } = await supabaseB
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update user profile: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error in updateUserProfile:', error)
      throw error
    }
  }

  /**
   * Update similar ideas for a user idea (called after vector search)
   * @param ideaId - User idea ID
   * @param userId - User ID (for security)
   * @param similarIdeaIds - Array of similar idea IDs from Account A
   * @returns Promise<boolean>
   */
  async updateSimilarIdeas(ideaId: string, userId: string, similarIdeaIds: string[]): Promise<boolean> {
    try {
      const { error } = await supabaseB
        .from('user_ideas')
        .update({ 
          similar_ideas: similarIdeaIds,
          updated_at: new Date().toISOString()
        })
        .eq('id', ideaId)
        .eq('user_id', userId)

      if (error) {
        throw new Error(`Failed to update similar ideas: ${error.message}`)
      }

      return true
    } catch (error) {
      console.error('Error in updateSimilarIdeas:', error)
      throw error
    }
  }
}

// Export singleton instance
export const userDataManager = new UserDataManager()