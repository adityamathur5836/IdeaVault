/**
 * Ideas Reader Module
 * 
 * Purpose: Read and process ideas from Account A (ideas pool)
 * Features: Filtering, searching, caching, batch operations
 */

import { supabaseA, ideasPoolAPI, IdeaPoolRecord } from '../config/supabase-a'

export interface IdeasFilter {
  category?: string
  tags?: string[]
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  minPopularity?: number
  limit?: number
  offset?: number
}

export interface IdeasSearchResult {
  ideas: IdeaPoolRecord[]
  total: number
  hasMore: boolean
}

/**
 * Get filtered ideas from the pool
 */
export async function getFilteredIdeas(filters: IdeasFilter = {}): Promise<IdeasSearchResult> {
  try {
    let query = supabaseA
      .from('ideas_pool')
      .select('*', { count: 'exact' })

    // Apply filters
    if (filters.category) {
      query = query.eq('category', filters.category)
    }
    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags)
    }
    if (filters.difficulty) {
      query = query.eq('difficulty_level', filters.difficulty)
    }
    if (filters.minPopularity) {
      query = query.gte('popularity_score', filters.minPopularity)
    }

    const { data: ideas, error, count } = await query
      .order('popularity_score', { ascending: false })
      .range(filters.offset || 0, (filters.offset || 0) + (filters.limit || 20) - 1)

    if (error) throw error

    return {
      ideas: ideas || [],
      total: count || 0,
      hasMore: (count || 0) > (filters.offset || 0) + (ideas?.length || 0)
    }
  } catch (error) {
    console.error('Error fetching filtered ideas:', error)
    throw new Error('Failed to fetch ideas')
  }
}

/**
 * Search ideas by text query
 */
export async function searchIdeas(query: string, filters: IdeasFilter = {}): Promise<IdeasSearchResult> {
  try {
    let queryBuilder = supabaseA
      .from('ideas_pool')
      .select('*', { count: 'exact' })
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)

    // Apply filters
    if (filters.category) {
      queryBuilder = queryBuilder.eq('category', filters.category)
    }
    if (filters.tags && filters.tags.length > 0) {
      queryBuilder = queryBuilder.overlaps('tags', filters.tags)
    }

    const { data: ideas, error, count } = await queryBuilder
      .order('popularity_score', { ascending: false })
      .range(filters.offset || 0, (filters.offset || 0) + (filters.limit || 20) - 1)

    if (error) throw error

    return {
      ideas: ideas || [],
      total: count || 0,
      hasMore: (count || 0) > (filters.offset || 0) + (ideas?.length || 0)
    }
  } catch (error) {
    console.error('Error searching ideas:', error)
    throw new Error('Failed to search ideas')
  }
}

/**
 * Get trending ideas based on popularity
 */
export async function getTrendingIdeas(limit: number = 10): Promise<IdeaPoolRecord[]> {
  try {
    const { data: ideas, error } = await supabaseA
      .from('ideas_pool')
      .select('*')
      .order('popularity_score', { ascending: false })
      .limit(limit)

    if (error) throw error
    return ideas || []
  } catch (error) {
    console.error('Error fetching trending ideas:', error)
    throw new Error('Failed to fetch trending ideas')
  }
}

/**
 * Get ideas by category
 */
export async function getIdeasByCategory(category: string, limit: number = 20): Promise<IdeaPoolRecord[]> {
  try {
    const { data: ideas, error } = await supabaseA
      .from('ideas_pool')
      .select('*')
      .eq('category', category)
      .order('popularity_score', { ascending: false })
      .limit(limit)

    if (error) throw error
    return ideas || []
  } catch (error) {
    console.error('Error fetching ideas by category:', error)
    throw new Error('Failed to fetch ideas by category')
  }
}

/**
 * Get random ideas for inspiration
 */
export async function getRandomIdeas(count: number = 5): Promise<IdeaPoolRecord[]> {
  try {
    // Get total count first
    const { count: totalCount } = await supabaseA
      .from('ideas_pool')
      .select('*', { count: 'exact', head: true })

    if (!totalCount || totalCount === 0) return []

    // Generate random offsets
    const randomOffsets = Array.from({ length: count }, () => 
      Math.floor(Math.random() * totalCount)
    )

    // Fetch ideas at random positions
    const promises = randomOffsets.map(offset =>
      supabaseA
        .from('ideas_pool')
        .select('*')
        .range(offset, offset)
        .single()
    )

    const results = await Promise.allSettled(promises)
    return results
      .filter((result): result is PromiseFulfilledResult<any> => 
        result.status === 'fulfilled' && result.value.data
      )
      .map(result => result.value.data)
  } catch (error) {
    console.error('Error fetching random ideas:', error)
    throw new Error('Failed to fetch random ideas')
  }
}

/**
 * Get all available categories
 */
export async function getCategories(): Promise<string[]> {
  try {
    const { data, error } = await supabaseA
      .from('ideas_pool')
      .select('category')
      .not('category', 'is', null)

    if (error) throw error

    const categories = [...new Set(data?.map(item => item.category) || [])]
    return categories.sort()
  } catch (error) {
    console.error('Error fetching categories:', error)
    throw new Error('Failed to fetch categories')
  }
}

/**
 * Get all available tags
 */
export async function getAllTags(): Promise<string[]> {
  try {
    const { data, error } = await supabaseA
      .from('ideas_pool')
      .select('tags')
      .not('tags', 'is', null)

    if (error) throw error

    const allTags = data?.flatMap(item => item.tags || []) || []
    const uniqueTags = [...new Set(allTags)]
    return uniqueTags.sort()
  } catch (error) {
    console.error('Error fetching tags:', error)
    throw new Error('Failed to fetch tags')
  }
}
