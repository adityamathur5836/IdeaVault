import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface IdeaGradingRequest {
  idea_id: string
  validator_id: string
  market_fit_score: number
  feasibility_score: number
  innovation_score: number
  scalability_score: number
  overall_score: number
  feedback: string
  is_anonymous: boolean
}

interface GradingAlgorithm {
  calculateScore(scores: {
    market_fit: number
    feasibility: number
    innovation: number
    scalability: number
  }): number
}

class WeightedGradingAlgorithm implements GradingAlgorithm {
  private weights = {
    market_fit: 0.3,
    feasibility: 0.25,
    innovation: 0.25,
    scalability: 0.2
  }

  calculateScore(scores: {
    market_fit: number
    feasibility: number
    innovation: number
    scalability: number
  }): number {
    const weightedScore = 
      scores.market_fit * this.weights.market_fit +
      scores.feasibility * this.weights.feasibility +
      scores.innovation * this.weights.innovation +
      scores.scalability * this.weights.scalability
    
    return Math.round(weightedScore * 10) / 10
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { idea_id, validator_id, market_fit_score, feasibility_score, innovation_score, scalability_score, overall_score, feedback, is_anonymous }: IdeaGradingRequest = await req.json()

    // Validate input
    if (!idea_id || !validator_id) {
      throw new Error('Missing required fields: idea_id and validator_id')
    }

    if (market_fit_score < 1 || market_fit_score > 10 ||
        feasibility_score < 1 || feasibility_score > 10 ||
        innovation_score < 1 || innovation_score > 10 ||
        scalability_score < 1 || scalability_score > 10 ||
        overall_score < 1 || overall_score > 10) {
      throw new Error('All scores must be between 1 and 10')
    }

    // Check if user has already validated this idea
    const { data: existingValidation } = await supabaseClient
      .from('idea_validations')
      .select('id')
      .eq('idea_id', idea_id)
      .eq('validator_id', validator_id)
      .single()

    if (existingValidation) {
      throw new Error('User has already validated this idea')
    }

    // Use AI algorithm to calculate weighted score
    const algorithm = new WeightedGradingAlgorithm()
    const calculatedScore = algorithm.calculateScore({
      market_fit: market_fit_score,
      feasibility: feasibility_score,
      innovation: innovation_score,
      scalability: scalability_score
    })

    // Insert the validation
    const { data: validation, error } = await supabaseClient
      .from('idea_validations')
      .insert({
        idea_id,
        validator_id,
        market_fit_score,
        feasibility_score,
        innovation_score,
        scalability_score,
        overall_score: calculatedScore, // Use calculated score instead of provided
        feedback,
        is_anonymous
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Get idea details for notification
    const { data: idea } = await supabaseClient
      .from('ideas')
      .select('title, user_id')
      .eq('id', idea_id)
      .single()

    // Create notification for idea owner
    if (idea && idea.user_id !== validator_id) {
      await supabaseClient
        .from('notifications')
        .insert({
          user_id: idea.user_id,
          type: 'idea_comment',
          title: 'New Idea Validation',
          message: `Your idea "${idea.title}" received a new validation with score ${calculatedScore}/10`,
          data: {
            idea_id,
            validation_id: validation.id,
            score: calculatedScore
          }
        })
    }

    return new Response(
      JSON.stringify({
        success: true,
        validation,
        calculated_score: calculatedScore,
        message: 'Idea validation submitted successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 