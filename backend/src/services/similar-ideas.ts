/**
 * Similar Ideas Service
 * 
 * Purpose: Main service for finding similar ideas using ML vector search
 * Features: Embedding generation, similarity search, caching, ranking
 */

import { generateEmbedding, cosineSimilarity } from '../config/openai'
import { supabaseA, IdeaPoolRecord } from '../config/supabase-a'
import { supabaseB, supabaseBService, UserIdea } from '../config/supabase-b'

export interface SimilarIdea extends IdeaPoolRecord {
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

/**
 * Find similar ideas for a user's idea using vector search
 */
export async function findSimilarIdeasForUserIdea(
  userIdeaId: string,
  options: {
    threshold?: number
    limit?: number
    forceRefresh?: boolean
  } = {}
): Promise<SimilarIdeasResult> {
  const startTime = Date.now()
  const { threshold = 0.7, limit = 8, forceRefresh = false } = options

  try {
    // Get user idea
    const { data: userIdea, error: userIdeaError } = await supabaseB
      .from('user_ideas')
      .select('*')
      .eq('id', userIdeaId)
      .single()

    if (userIdeaError) throw userIdeaError

    // Check if we have cached similar ideas and don't need refresh
    if (!forceRefresh && userIdea.similar_ideas && userIdea.similar_ideas.length > 0) {
      const cachedResult = await getCachedSimilarIdeas(userIdea.similar_ideas)
      return {
        similarIdeas: cachedResult,
        searchMetrics: {
          queryText: userIdea.title + ' ' + userIdea.description,
          searchTime: Date.now() - startTime,
          totalFound: cachedResult.length,
          averageSimilarity: cachedResult.reduce((sum, idea) => sum + idea.similarity, 0) / cachedResult.length || 0
        }
      }
    }

    // Generate embedding for user idea if not exists
    let userEmbedding = userIdea.embedding
    if (!userEmbedding) {
      const ideaText = `${userIdea.title} ${userIdea.description}`
      userEmbedding = await generateEmbedding(ideaText)
      
      // Store embedding for future use
      await supabaseB
        .from('user_ideas')
        .update({ embedding: userEmbedding })
        .eq('id', userIdeaId)
    }

    // Find similar ideas using vector search
    const result = await findSimilarIdeasByEmbedding(
      userEmbedding,
      `${userIdea.title} ${userIdea.description}`,
      { threshold, limit }
    )

    // Cache the similar idea IDs
    const similarIdeaIds = result.similarIdeas.map(idea => idea.id)
    await supabaseB
      .from('user_ideas')
      .update({ similar_ideas: similarIdeaIds })
      .eq('id', userIdeaId)

    return result
  } catch (error) {
    console.error('Error finding similar ideas for user idea:', error)
    throw new Error('Failed to find similar ideas')
  }
}

/**
 * Find similar ideas for arbitrary text
 */
export async function findSimilarIdeasForText(
  queryText: string,
  options: {
    threshold?: number
    limit?: number
    category?: string
  } = {}
): Promise<SimilarIdeasResult> {
  const { threshold = 0.7, limit = 8, category } = options

  try {
    // Generate embedding for query text
    const queryEmbedding = await generateEmbedding(queryText)

    // Find similar ideas
    return await findSimilarIdeasByEmbedding(
      queryEmbedding,
      queryText,
      { threshold, limit, category }
    )
  } catch (error) {
    console.error('Error finding similar ideas for text:', error)
    throw new Error('Failed to find similar ideas')
  }
}

/**
 * Core vector search function
 */
async function findSimilarIdeasByEmbedding(
  queryEmbedding: number[],
  queryText: string,
  options: {
    threshold?: number
    limit?: number
    category?: string
  } = {}
): Promise<SimilarIdeasResult> {
  const startTime = Date.now()
  const { threshold = 0.7, limit = 8, category } = options

  try {
    // Get all ideas with embeddings
    let query = supabaseA
      .from('ideas_pool')
      .select('*')
      .not('embedding', 'is', null)

    if (category) {
      query = query.eq('category', category)
    }

    const { data: ideas, error } = await query

    if (error) throw error

    if (!ideas || ideas.length === 0) {
      return {
        similarIdeas: [],
        searchMetrics: {
          queryText,
          searchTime: Date.now() - startTime,
          totalFound: 0,
          averageSimilarity: 0
        }
      }
    }

    // Calculate similarities
    const similarIdeas: SimilarIdea[] = ideas
      .map(idea => ({
        ...idea,
        similarity: cosineSimilarity(queryEmbedding, idea.embedding)
      }))
      .filter(idea => idea.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)

    const searchMetrics = {
      queryText,
      searchTime: Date.now() - startTime,
      totalFound: similarIdeas.length,
      averageSimilarity: similarIdeas.reduce((sum, idea) => sum + idea.similarity, 0) / similarIdeas.length || 0
    }

    return { similarIdeas, searchMetrics }
  } catch (error) {
    console.error('Error in vector search:', error)
    throw new Error('Vector search failed')
  }
}

/**
 * Get cached similar ideas by IDs
 */
async function getCachedSimilarIdeas(ideaIds: string[]): Promise<SimilarIdea[]> {
  try {
    const { data: ideas, error } = await supabaseA
      .from('ideas_pool')
      .select('*')
      .in('id', ideaIds)

    if (error) throw error

    return (ideas || []).map(idea => ({
      ...idea,
      similarity: 0.8 // Estimated similarity for cached results
    }))
  } catch (error) {
    console.error('Error getting cached similar ideas:', error)
    return []
  }
}

/**
 * Batch process embeddings for multiple user ideas
 */
export async function batchProcessUserIdeaEmbeddings(userId: string): Promise<void> {
  try {
    // Get user ideas without embeddings
    const { data: userIdeas, error } = await supabaseB
      .from('user_ideas')
      .select('*')
      .eq('user_id', userId)
      .is('embedding', null)

    if (error) throw error
    if (!userIdeas || userIdeas.length === 0) return

    // Generate embeddings for all ideas
    const updates = await Promise.all(
      userIdeas.map(async (idea) => {
        const ideaText = `${idea.title} ${idea.description}`
        const embedding = await generateEmbedding(ideaText)
        return { id: idea.id, embedding }
      })
    )

    // Update all embeddings
    await Promise.all(
      updates.map(update =>
        supabaseB
          .from('user_ideas')
          .update({ embedding: update.embedding })
          .eq('id', update.id)
      )
    )

    console.log(`Generated embeddings for ${updates.length} user ideas`)
  } catch (error) {
    console.error('Error batch processing embeddings:', error)
    throw new Error('Failed to batch process embeddings')
  }
}

/**
 * Refresh similar ideas for all user ideas
 */
export async function refreshAllSimilarIdeas(userId: string): Promise<void> {
  try {
    const { data: userIdeas, error } = await supabaseB
      .from('user_ideas')
      .select('id')
      .eq('user_id', userId)

    if (error) throw error
    if (!userIdeas) return

    // Process each idea
    await Promise.all(
      userIdeas.map(idea =>
        findSimilarIdeasForUserIdea(idea.id, { forceRefresh: true })
      )
    )

    console.log(`Refreshed similar ideas for ${userIdeas.length} user ideas`)
  } catch (error) {
    console.error('Error refreshing all similar ideas:', error)
    throw new Error('Failed to refresh similar ideas')
  }
}
