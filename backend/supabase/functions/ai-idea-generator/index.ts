import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface IdeaGenerationRequest {
  industry?: string
  problem_area?: string
  target_audience?: string
  budget_range?: string
  timeframe?: string
  user_id: string
}

interface GeneratedIdea {
  title: string
  description: string
  problem_statement: string
  solution_summary: string
  target_market: string
  business_model: string
  revenue_streams: string[]
  cost_structure: string[]
  key_metrics: string[]
  tags: string[]
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

    const { industry, problem_area, target_audience, budget_range, timeframe, user_id }: IdeaGenerationRequest = await req.json()

    // Check user subscription limits
    const { data: subscription } = await supabaseClient
      .rpc('get_user_subscription_status', { p_user_id: user_id })

    const { count: currentIdeas } = await supabaseClient
      .from('ideas')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id)
      .neq('status', 'archived')

    if (currentIdeas >= subscription.max_ideas) {
      throw new Error(`Idea limit exceeded. You can create up to ${subscription.max_ideas} ideas with your current plan.`)
    }

    // Generate idea using AI (simplified version - in production, integrate with OpenAI or similar)
    const generatedIdea = await generateIdeaWithAI({
      industry,
      problem_area,
      target_audience,
      budget_range,
      timeframe
    })

    // Insert the generated idea
    const { data: idea, error } = await supabaseClient
      .from('ideas')
      .insert({
        user_id,
        title: generatedIdea.title,
        description: generatedIdea.description,
        problem_statement: generatedIdea.problem_statement,
        solution_summary: generatedIdea.solution_summary,
        target_market: generatedIdea.target_market,
        business_model: generatedIdea.business_model,
        revenue_streams: generatedIdea.revenue_streams,
        cost_structure: generatedIdea.cost_structure,
        key_metrics: generatedIdea.key_metrics,
        tags: generatedIdea.tags,
        status: 'draft'
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({
        success: true,
        idea,
        message: 'Idea generated successfully'
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

async function generateIdeaWithAI(params: Omit<IdeaGenerationRequest, 'user_id'>): Promise<GeneratedIdea> {
  // This is a simplified AI generation - in production, integrate with OpenAI, Anthropic, or similar
  const ideas = [
    {
      title: 'AI-Powered Personal Finance Coach',
      description: 'An intelligent financial advisor that provides personalized budgeting, investment advice, and financial planning based on individual goals and circumstances.',
      problem_statement: 'Many people struggle with financial planning and lack access to affordable, personalized financial advice.',
      solution_summary: 'An AI platform that analyzes spending patterns, provides personalized financial advice, and helps users achieve their financial goals.',
      target_market: 'Young professionals aged 25-40 who want to improve their financial literacy and planning',
      business_model: 'Freemium with premium subscription tiers',
      revenue_streams: ['Monthly subscriptions', 'Premium features', 'Financial product referrals'],
      cost_structure: ['AI infrastructure', 'Compliance and security', 'Customer support', 'Marketing'],
      key_metrics: ['Monthly active users', 'Subscription conversion rate', 'Customer lifetime value', 'Churn rate'],
      tags: ['finance', 'ai', 'personal-finance', 'budgeting']
    },
    {
      title: 'Sustainable Home Energy Management',
      description: 'A smart home system that optimizes energy usage, integrates renewable energy sources, and helps homeowners reduce their carbon footprint while saving money.',
      problem_statement: 'Homeowners want to reduce energy costs and environmental impact but lack the tools and knowledge to optimize their home energy usage.',
      solution_summary: 'An IoT-based platform that monitors and optimizes home energy consumption, integrates with renewable energy systems, and provides actionable insights.',
      target_market: 'Environmentally conscious homeowners with smart home technology',
      business_model: 'Hardware sales + subscription service',
      revenue_streams: ['Smart device sales', 'Monthly monitoring service', 'Energy optimization software'],
      cost_structure: ['Hardware manufacturing', 'Software development', 'Installation services', 'Customer support'],
      key_metrics: ['Device installations', 'Energy savings achieved', 'Customer satisfaction', 'Retention rate'],
      tags: ['sustainability', 'energy', 'iot', 'smart-home']
    },
    {
      title: 'Virtual Reality Education Platform',
      description: 'An immersive learning platform that uses VR technology to create engaging educational experiences for students of all ages.',
      problem_statement: 'Traditional education methods often fail to engage students and provide hands-on learning experiences, especially for complex subjects.',
      solution_summary: 'A VR platform that creates immersive, interactive learning environments for various subjects, making education more engaging and effective.',
      target_market: 'Educational institutions, corporate training departments, and individual learners',
      business_model: 'B2B licensing + B2C subscriptions',
      revenue_streams: ['Institutional licenses', 'Individual subscriptions', 'Content creation services'],
      cost_structure: ['VR content development', 'Platform maintenance', 'Hardware partnerships', 'Sales and marketing'],
      key_metrics: ['Active users', 'Learning outcomes improvement', 'Content library size', 'Customer retention'],
      tags: ['education', 'vr', 'edtech', 'immersive-learning']
    }
  ]

  // Select a random idea (in production, use AI to generate based on parameters)
  const randomIndex = Math.floor(Math.random() * ideas.length)
  return ideas[randomIndex]
} 