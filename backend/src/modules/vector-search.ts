/**
 * Vector Search Module
 * 
 * Purpose: ML-powered semantic similarity search using embeddings
 * Functionality: Generate embeddings, perform vector similarity search
 * Database: Uses pgvector extension in Account A for vector operations
 */

import { supabaseA, type IdeaPoolRecord } from '../config/supabase-a'
import { generateEmbedding } from '../config/openai'

export interface SimilarityResult {
  idea: IdeaPoolRecord
  similarity: number
}

export interface VectorSearchOptions {
  threshold?: number    // Minimum similarity threshold (0-1)
  limit?: number       // Maximum results to return
  category?: string    // Optional category filter
}

export class VectorSearch {
  /**
   * Find similar ideas using vector similarity search
   * @param queryText - Text to find similar ideas for
   * @param options - Search options
   * @returns Promise<SimilarityResult[]>
   */
  async findSimilarIdeas(
    queryText: string, 
    options: VectorSearchOptions = {}
  ): Promise<SimilarityResult[]> {
    try {
      const {
        threshold = 0.7,
        limit = 10,
        category
      } = options

      // Step 1: Generate embedding for the query text
      console.log('🔍 Generating embedding for query:', queryText.slice(0, 100) + '...')
      const queryEmbedding = await generateEmbedding(queryText)

      // Step 2: Perform vector similarity search using pgvector
      console.log('🔍 Performing vector similarity search...')
      const { data, error } = await supabaseA.rpc('match_similar_ideas', {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: limit,
        category_filter: category || null
      })

      if (error) {
        throw new Error(`Vector search failed: ${error.message}`)
      }

      if (!data || data.length === 0) {
        console.log('⚠️ No similar ideas found, trying fallback text search...')
        return await this.fallbackTextSearch(queryText, { limit, category })
      }

      // Step 3: Format results
      const results: SimilarityResult[] = data.map((item: any) => ({
        idea: {
          id: item.id,
          title: item.title,
          description: item.description,
          category: item.category,
          tags: item.tags,
          source: item.source,
          popularity_score: item.popularity_score,
          embedding: item.embedding,
          created_at: item.created_at
        },
        similarity: item.similarity
      }))

      console.log(`✅ Found ${results.length} similar ideas`)
      return results

    } catch (error) {
      console.error('Error in findSimilarIdeas:', error)
      
      // Fallback to text search if vector search fails
      console.log('🔄 Falling back to text search...')
      return await this.fallbackTextSearch(queryText, options)
    }
  }

  /**
   * Fallback text-based search when vector search fails
   * @param queryText - Search query
   * @param options - Search options
   * @returns Promise<SimilarityResult[]>
   */
  private async fallbackTextSearch(
    queryText: string, 
    options: VectorSearchOptions = {}
  ): Promise<SimilarityResult[]> {
    try {
      const { limit = 10, category } = options

      let query = supabaseA
        .from('ideas_pool')
        .select('*')
        .or(`title.ilike.%${queryText}%,description.ilike.%${queryText}%`)
        .order('popularity_score', { ascending: false })
        .limit(limit)

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (error) {
        throw new Error(`Fallback text search failed: ${error.message}`)
      }

      // Return with estimated similarity based on text matching
      const results: SimilarityResult[] = (data || []).map(idea => ({
        idea,
        similarity: 0.5 // Estimated similarity for text matches
      }))

      console.log(`📝 Fallback search found ${results.length} ideas`)
      return results

    } catch (error) {
      console.error('Error in fallback text search:', error)
      return []
    }
  }

  /**
   * Generate and store embedding for a new idea in Account A
   * (Used by admin scripts to populate embeddings)
   * @param ideaId - Idea ID
   * @param text - Text to generate embedding for
   * @returns Promise<boolean>
   */
  async generateAndStoreEmbedding(ideaId: string, text: string): Promise<boolean> {
    try {
      console.log(`🔄 Generating embedding for idea ${ideaId}...`)
      
      const embedding = await generateEmbedding(text)
      
      const { error } = await supabaseA
        .from('ideas_pool')
        .update({ embedding })
        .eq('id', ideaId)

      if (error) {
        throw new Error(`Failed to store embedding: ${error.message}`)
      }

      console.log(`✅ Embedding stored for idea ${ideaId}`)
      return true

    } catch (error) {
      console.error(`❌ Error generating embedding for idea ${ideaId}:`, error)
      return false
    }
  }

  /**
   * Batch generate embeddings for multiple ideas
   * @param ideas - Array of ideas to process
   * @returns Promise<{ success: number, failed: number }>
   */
  async batchGenerateEmbeddings(ideas: IdeaPoolRecord[]): Promise<{ success: number, failed: number }> {
    let success = 0
    let failed = 0

    console.log(`🚀 Starting batch embedding generation for ${ideas.length} ideas...`)

    for (const idea of ideas) {
      try {
        // Skip if embedding already exists
        if (idea.embedding && idea.embedding.length > 0) {
          console.log(`⏭️ Skipping ${idea.id} - embedding exists`)
          continue
        }

        const text = `${idea.title} ${idea.description}`.trim()
        const isSuccess = await this.generateAndStoreEmbedding(idea.id, text)
        
        if (isSuccess) {
          success++
        } else {
          failed++
        }

        // Rate limiting - wait 100ms between requests
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        console.error(`❌ Failed to process idea ${idea.id}:`, error)
        failed++
      }
    }

    console.log(`🎉 Batch complete: ${success} success, ${failed} failed`)
    return { success, failed }
  }
}

// Export singleton instance
export const vectorSearch = new VectorSearch()