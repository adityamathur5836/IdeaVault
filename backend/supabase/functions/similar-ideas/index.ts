import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userIdeaId, queryText, threshold = 0.7, limit = 8, category, forceRefresh } = await req.json()

    // Initialize Supabase clients using Deno.env
    const supabaseA = createClient(
      Deno.env.get('SUPABASE_A_URL') ?? '',
      Deno.env.get('SUPABASE_A_ANON_KEY') ?? ''
    )

    const supabaseB = createClient(
      Deno.env.get('SUPABASE_B_URL') ?? '',
      Deno.env.get('SUPABASE_B_SERVICE_KEY') ?? ''
    )

    const startTime = Date.now()

    // Generate embedding using OpenAI
    const generateEmbedding = async (text: string): Promise<number[]> => {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text.replace(/\n/g, ' ').trim(),
        }),
      })

      const data = await response.json()
      return data.data[0].embedding
    }

    // Calculate cosine similarity
    const cosineSimilarity = (a: number[], b: number[]): number => {
      let dotProduct = 0
      let normA = 0
      let normB = 0

      for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i]
        normA += a[i] * a[i]
        normB += b[i] * b[i]
      }

      return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
    }

    let queryEmbedding: number[]
    let searchText: string

    if (userIdeaId) {
      // Get user idea
      const { data: userIdea, error: userIdeaError } = await supabaseB
        .from('user_ideas')
        .select('*')
        .eq('id', userIdeaId)
        .single()

      if (userIdeaError) throw userIdeaError

      searchText = `${userIdea.title} ${userIdea.description}`

      // Use existing embedding or generate new one
      if (userIdea.embedding && !forceRefresh) {
        queryEmbedding = userIdea.embedding
      } else {
        queryEmbedding = await generateEmbedding(searchText)
        
        // Store embedding for future use
        await supabaseB
          .from('user_ideas')
          .update({ embedding: queryEmbedding })
          .eq('id', userIdeaId)
      }
    } else if (queryText) {
      searchText = queryText
      queryEmbedding = await generateEmbedding(queryText)
    } else {
      throw new Error('Either userIdeaId or queryText must be provided')
    }

    // Get all ideas with embeddings from Account A
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
      return new Response(
        JSON.stringify({
          similarIdeas: [],
          searchMetrics: {
            queryText: searchText,
            searchTime: Date.now() - startTime,
            totalFound: 0,
            averageSimilarity: 0
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Calculate similarities
    const similarIdeas = ideas
      .map(idea => ({
        ...idea,
        similarity: cosineSimilarity(queryEmbedding, idea.embedding)
      }))
      .filter(idea => idea.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)

    // Cache similar idea IDs if this was for a user idea
    if (userIdeaId) {
      const similarIdeaIds = similarIdeas.map(idea => idea.id)
      await supabaseB
        .from('user_ideas')
        .update({ similar_ideas: similarIdeaIds })
        .eq('id', userIdeaId)
    }

    const searchMetrics = {
      queryText: searchText,
      searchTime: Date.now() - startTime,
      totalFound: similarIdeas.length,
      averageSimilarity: similarIdeas.reduce((sum, idea) => sum + idea.similarity, 0) / similarIdeas.length || 0
    }

    return new Response(
      JSON.stringify({ similarIdeas, searchMetrics }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in similar-ideas function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
