/**
 * Similar Ideas Hook
 *
 * Purpose: React hook for ML-powered similar ideas functionality
 * Functionality: Vector search, cached results, real-time updates
 */

import { useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { toast } from 'sonner'

// Account B client for edge functions
const supabaseB = createClient(
  import.meta.env.VITE_SUPABASE_B_URL,
  import.meta.env.VITE_SUPABASE_B_ANON_KEY
)

// Account A client for direct reads
const supabaseA = createClient(
  import.meta.env.VITE_SUPABASE_A_URL,
  import.meta.env.VITE_SUPABASE_A_ANON_KEY
)

export interface SimilarIdea {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  source: string
  popularity_score: number
  similarity: number
}

export interface SimilarIdeasResult {
  similarIdeas: SimilarIdea[]
  searchMetrics: {
    queryText: string
    searchTime: number
    totalFound: number
    averageSimilarity: number
  }
}

export const useSimilarIdeas = () => {
  const [similarIdeas, setSimilarIdeas] = useState<SimilarIdea[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchMetrics, setSearchMetrics] = useState<SimilarIdeasResult['searchMetrics'] | null>(null)

  /**
   * Find similar ideas for a user's idea using ML vector search
   */
  const findSimilarIdeasForUserIdea = useCallback(async (
    userIdeaId: string,
    options: {
      threshold?: number
      limit?: number
      forceRefresh?: boolean
    } = {}
  ) => {
    setLoading(true)
    setError(null)

    try {
      const { threshold = 0.7, limit = 8, forceRefresh = false } = options

      const { data, error } = await supabaseB.functions.invoke('similar-ideas', {
        body: {
          userIdeaId,
          threshold,
          limit,
          forceRefresh
        }
      })

      if (error) throw error

      if (data.success) {
        setSimilarIdeas(data.similarIdeas)
        setSearchMetrics(data.searchMetrics)

        if (data.similarIdeas.length === 0) {
          toast.info('No similar ideas found. Try adjusting your idea description.')
        }
      } else {
        throw new Error(data.error || 'Failed to find similar ideas')
      }

      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to find similar ideas'
      setError(message)
      toast.error(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Find similar ideas for arbitrary text (not tied to user idea)
   */
  const findSimilarIdeasForText = useCallback(async (
    queryText: string,
    options: {
      threshold?: number
      limit?: number
      category?: string
    } = {}
  ) => {
    setLoading(true)
    setError(null)

    try {
      const { threshold = 0.7, limit = 8, category } = options

      const { data, error } = await supabaseB.functions.invoke('similar-ideas', {
        body: {
          queryText,
          threshold,
          limit,
          category
        }
      })

      if (error) throw error

      if (data.success) {
        setSimilarIdeas(data.similarIdeas)
        setSearchMetrics(data.searchMetrics)
      } else {
        throw new Error(data.error || 'Failed to find similar ideas')
      }

      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to find similar ideas'
      setError(message)
      toast.error(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Get cached similar ideas for a user idea (faster, no ML processing)
   */
  const getCachedSimilarIdeas = useCallback(async (userIdeaId: string) => {
    setLoading(true)
    setError(null)

    try {
      const { data: userIdea, error: userIdeaError } = await supabaseA
        .from('user_ideas')
        .select('similar_ideas')
        .eq('id', userIdeaId)
        .single()

      if (userIdeaError) throw userIdeaError

      if (!userIdea.similar_ideas || userIdea.similar_ideas.length === 0) {
        toast.info('No cached similar ideas available. Try running a fresh search.')
        setSimilarIdeas([])
        setSearchMetrics(null)
      } else {
        setSimilarIdeas(userIdea.similar_ideas)
        setSearchMetrics({
          queryText: 'Cached results',
          searchTime: 0,
          totalFound: userIdea.similar_ideas.length,
          averageSimilarity:
            userIdea.similar_ideas.reduce((sum: number, idea: SimilarIdea) => sum + idea.similarity, 0) /
            userIdea.similar_ideas.length,
        })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load cached similar ideas'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Clear similar ideas state
   */
  const clearSimilarIdeas = useCallback(() => {
    setSimilarIdeas([])
    setSearchMetrics(null)
    setError(null)
  }, [])

  return {
    similarIdeas,
    loading,
    error,
    searchMetrics,
    findSimilarIdeasForUserIdea,
    findSimilarIdeasForText,
    getCachedSimilarIdeas,
    clearSimilarIdeas,
  }
}
