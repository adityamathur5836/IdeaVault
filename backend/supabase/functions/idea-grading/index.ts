import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
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

class WeightedGradingAlgorithm {
  private weights = {
    market_fit: 0.3,
    feasibility: 0.25,
    innovation: 0.2,
    scalability: 0.25
  }

  calculateScore(scores: {
    market_fit: number
    feasibility: number
    innovation: number
    scalability: number
  }): number {
    const weightedSum = 
      scores.market_fit * this.weights.market_fit +
      scores.feasibility * this.weights.feasibility +
      scores.innovation * this.weights.innovation +
      scores.scalability * this.weights.scalability

    return Math.round(weightedSum * 100) / 100
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { 
      idea_id, 
      validator_id, 
      market_fit_score, 
      feasibility_score, 
      innovation_score, 
      scalability_score, 
      overall_score, 
      feedback, 
      is_anonymous 
    }: IdeaGradingRequest = await req.json()

    // Validate input
    if (!idea_id || !validator_id) {
      throw new Error('Missing required fields: idea_id and validator_id')
    }

    // Validate scores are between 1-10
    const scores = [market_fit_score, feasibility_score, innovation_score, scalability_score]
    if (scores.some(score => score < 1 || score > 10)) {
      throw new Error('All scores must be between 1 and 10')
    }

    // Check if idea exists
    const { data: idea, error: ideaError } = await supabaseClient
      .from('ideas')
      .select('id, user_id, title')
      .eq('id', idea_id)
      .single()

    if (ideaError || !idea) {
      throw new Error('Idea not found')
    }

    // Use AI algorithm to calculate weighted score
    const algorithm = new WeightedGradingAlgorithm()
    const calculatedScore = algorithm.calculateScore({
      market_fit: market_fit_score,
      feasibility: feasibility_score,
      innovation: innovation_score,
      scalability: scalability_score
    })

    // Create validations table if it doesn't exist
    const { error: createTableError } = await supabaseClient.rpc('create_validations_table_if_not_exists')
    
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
        overall_score: calculatedScore,
        feedback,
        is_anonymous,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      // If table doesn't exist, create it dynamically
      if (error.code === '42P01') {
        await supabaseClient.rpc('exec', {
          sql: `
            CREATE TABLE IF NOT EXISTS idea_validations (
              id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
              idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
              validator_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
              market_fit_score INTEGER CHECK (market_fit_score >= 1 AND market_fit_score <= 10),
              feasibility_score INTEGER CHECK (feasibility_score >= 1 AND feasibility_score <= 10),
              innovation_score INTEGER CHECK (innovation_score >= 1 AND innovation_score <= 10),
              scalability_score INTEGER CHECK (scalability_score >= 1 AND scalability_score <= 10),
              overall_score DECIMAL(3,2),
              feedback TEXT,
              is_anonymous BOOLEAN DEFAULT FALSE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            ALTER TABLE idea_validations ENABLE ROW LEVEL SECURITY;
            
            CREATE POLICY "Users can view validations for their ideas" ON idea_validations
              FOR SELECT USING (
                EXISTS (
                  SELECT 1 FROM ideas 
                  WHERE ideas.id = idea_validations.idea_id 
                  AND ideas.user_id = auth.uid()
                )
              );
              
            CREATE POLICY "Users can create validations" ON idea_validations
              FOR INSERT WITH CHECK (auth.uid() = validator_id);
          `
        })
        
        // Retry the insert
        const { data: retryValidation, error: retryError } = await supabaseClient
          .from('idea_validations')
          .insert({
            idea_id,
            validator_id,
            market_fit_score,
            feasibility_score,
            innovation_score,
            scalability_score,
            overall_score: calculatedScore,
            feedback,
            is_anonymous,
            created_at: new Date().toISOString()
          })
          .select()
          .single()
          
        if (retryError) throw retryError
        validation = retryValidation
      } else {
        throw error
      }
    }

    // Update idea's average score
    const { data: allValidations } = await supabaseClient
      .from('idea_validations')
      .select('overall_score')
      .eq('idea_id', idea_id)

    if (allValidations && allValidations.length > 0) {
      const averageScore = allValidations.reduce((sum, v) => sum + v.overall_score, 0) / allValidations.length
      
      await supabaseClient
        .from('ideas')
        .update({ 
          score: Math.round(averageScore * 100) / 100,
          updated_at: new Date().toISOString()
        })
        .eq('id', idea_id)
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
    console.error('Error in idea-grading:', error)
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
