/**
 * Ideas Pool Hook
 * 
 * Purpose: React hook for accessing the global ideas pool (Account A)
 * Functionality: Browse, search, filter ideas from the curated pool
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { toast } from 'sonner'

// Account A client for ideas pool
const supabaseA = createClient(
  import.meta.env.VITE_SUPABASE_A_URL,
  import.meta.env.VITE_SUPABASE_A_ANON_KEY
)

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
  created_at: string
  updated_at: string
}

export interface IdeasFilter {
  category?: string
  tags?: string[]
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  minPopularity?: number
  query?: string
}

export interface IdeasResult {
  ideas: IdeaPoolRecord[]
  total: number
  hasMore: boolean
}

export const useIdeasPool = () => {
  const [ideas, setIdeas] = useState<IdeaPoolRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  // Fetch ideas with filters and pagination
  const fetchIdeas = useCallback(async (
    filters: IdeasFilter = {},
    options: { page?: number; limit?: number; append?: boolean } = {}
  ) => {
    setLoading(true)
    setError(null)

    try {
      const { page = 1, limit = 20, append = false } = options
      const offset = (page - 1) * limit

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

      if (filters.query) {
        query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`)
      }

      // Apply pagination and ordering
      const { data, error, count } = await query
        .order('popularity_score', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      const newIdeas = data || []
      setIdeas(prev => append ? [...prev, ...newIdeas] : newIdeas)
      setTotal(count || 0)
      setHasMore((count || 0) > offset + newIdeas.length)

      return {
        ideas: newIdeas,
        total: count || 0,
        hasMore: (count || 0) > offset + newIdeas.length
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch ideas'
      setError(message)
      toast.error(message)
      return { ideas: [], total: 0, hasMore: false }
    } finally {
      setLoading(false)
    }
  }, [])

  // Load more ideas (pagination)
  const loadMore = useCallback(async (filters: IdeasFilter = {}) => {
    const currentPage = Math.floor(ideas.length / 20) + 1
    return await fetchIdeas(filters, { page: currentPage + 1, append: true })
  }, [ideas.length, fetchIdeas])

  // Get trending ideas
  const getTrendingIdeas = useCallback(async (limit: number = 10) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabaseA
        .from('ideas_pool')
        .select('*')
        .order('popularity_score', { ascending: false })
        .limit(limit)

      if (error) throw error

      setIdeas(data || [])
      return data || []
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch trending ideas'
      setError(message)
      toast.error(message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Get random ideas for inspiration
  const getRandomIdeas = useCallback(async (count: number = 5) => {
    setLoading(true)
    setError(null)

    try {
      // Get total count first
      const { count: totalCount } = await supabaseA
        .from('ideas_pool')
        .select('*', { count: 'exact', head: true })

      if (!totalCount || totalCount === 0) {
        setIdeas([])
        return []
      }

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
      const randomIdeas = results
        .filter((result): result is PromiseFulfilledResult<any> => 
          result.status === 'fulfilled' && result.value.data
        )
        .map(result => result.value.data)

      setIdeas(randomIdeas)
      return randomIdeas
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch random ideas'
      setError(message)
      toast.error(message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Get idea by ID
  const getIdeaById = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabaseA
        .from('ideas_pool')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch idea'
      toast.error(message)
      return null
    }
  }, [])

  // Fetch available categories
  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabaseA
        .from('ideas_pool')
        .select('category')
        .not('category', 'is', null)

      if (error) throw error

      const uniqueCategories = [...new Set(data?.map(item => item.category) || [])]
      setCategories(uniqueCategories.sort())
      return uniqueCategories
    } catch (err) {
      console.error('Failed to fetch categories:', err)
      return []
    }
  }, [])

  // Fetch available tags
  const fetchTags = useCallback(async () => {
    try {
      const { data, error } = await supabaseA
        .from('ideas_pool')
        .select('tags')
        .not('tags', 'is', null)

      if (error) throw error

      const allTags = data?.flatMap(item => item.tags || []) || []
      const uniqueTags = [...new Set(allTags)]
      setTags(uniqueTags.sort())
      return uniqueTags
    } catch (err) {
      console.error('Failed to fetch tags:', err)
      return []
    }
  }, [])

  // Initialize categories and tags on mount
  useEffect(() => {
    fetchCategories()
    fetchTags()
  }, [fetchCategories, fetchTags])

  // Clear current ideas
  const clearIdeas = useCallback(() => {
    setIdeas([])
    setTotal(0)
    setHasMore(false)
    setError(null)
  }, [])

  return {
    // State
    ideas,
    loading,
    error,
    categories,
    tags,
    total,
    hasMore,

    // Methods
    fetchIdeas,
    loadMore,
    getTrendingIdeas,
    getRandomIdeas,
    getIdeaById,
    fetchCategories,
    fetchTags,
    clearIdeas,

    // Utilities
    refetch: () => fetchIdeas(),
    refresh: () => {
      clearIdeas()
      fetchCategories()
      fetchTags()
    }
  }
}
