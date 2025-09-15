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
    // Debug environment variables
    console.log('LOCAL_DB_URL:', Deno.env.get('LOCAL_DB_URL'))
    console.log('IDEAS_POOL_URL:', Deno.env.get('IDEAS_POOL_URL'))
    
    // Use remote Supabase URLs for production
    const supabaseBUrl = Deno.env.get('SUPABASE_B_URL') || 'https://jpzduznkbreqyjperbff.supabase.co'
    const supabaseBServiceKey = Deno.env.get('SUPABASE_B_SERVICE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwemR1em5rYnJlcXlqcGVyYmZmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjkxODAxMywiZXhwIjoyMDcyNDk0MDEzfQ.SCNef3Jq0bUmjH863SpRX83qu_7X0Y4-I6p5LKE-Tus'
    
    console.log('Using remote Supabase setup')
    console.log('Supabase B URL:', supabaseBUrl)
    
    // Remote Supabase (Account B) - User data
    const supabaseB = createClient(
      supabaseBUrl,
      supabaseBServiceKey,
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Remote Supabase (Account A) - Ideas pool
    const supabaseA = createClient(
      Deno.env.get('IDEAS_POOL_URL') ?? 'https://vryersltsbjkdqhvorgk.supabase.co',
      Deno.env.get('IDEAS_POOL_ANON_KEY') ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyeWVyc2x0c2Jqa2RxaHZvcmdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNDk3NDIsImV4cCI6MjA2NTkyNTc0Mn0.3B4oZUOh9pTxeFls5wSc8gmrrA97tbudn796jXPXN6k'
    )

    // Test connection first
    try {
      const { data: testData, error: testError } = await supabaseB
        .from('ideas')
        .select('count', { count: 'exact', head: true })
        .limit(1)
      
      console.log('Connection test result:', { testData, testError })
    } catch (connError) {
      console.error('Connection test failed:', connError)
      throw new Error(`Database connection failed: ${connError.message}`)
    }

    const { industry, problem_area, target_audience, budget_range, timeframe, user_id } = await req.json()

    if (!user_id) {
      throw new Error('User ID is required')
    }

    // Check user subscription limits
    const { count: currentIdeas } = await supabaseB
      .from('ideas')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id)

    const maxIdeas = 50
    if (currentIdeas && currentIdeas >= maxIdeas) {
      throw new Error(`Idea limit exceeded. You can create up to ${maxIdeas} ideas.`)
    }

    // Generate idea using AI-like logic
    const generatedIdea = await generateIdeaWithAI({
      industry,
      problem_area,
      target_audience,
      budget_range,
      timeframe
    })

    // Save to user ideas (Account B)
    const { data: userIdea, error: userError } = await supabaseB
      .from('ideas')
      .insert({
        user_id,
        title: generatedIdea.title,
        description: generatedIdea.description,
        problem_statement: generatedIdea.problem_statement,
        solution_summary: generatedIdea.solution_summary,
        target_market: generatedIdea.target_market,
        business_model: generatedIdea.business_model,
        tags: generatedIdea.tags,
        status: 'draft',
        score: generatedIdea.popularity_score / 10
      })
      .select()
      .single()

    if (userError) {
      throw new Error(`Failed to save user idea: ${userError.message}`)
    }

    // Get similar ideas from Product Hunt data
    const { data: similarProducts } = await supabaseA
      .from('product_hunt_products')
      .select('*')
      .ilike('category_tags', `%${generatedIdea.category}%`)
      .order('upvotes', { ascending: false })
      .limit(3)

    return new Response(
      JSON.stringify({
        success: true,
        idea: {
          ...userIdea,
          difficulty: generatedIdea.difficulty,
          market_size: generatedIdea.market_size,
          time_to_market: generatedIdea.time_to_market,
          initial_investment: generatedIdea.initial_investment,
          score: Math.floor(generatedIdea.popularity_score)
        },
        similar_products: similarProducts || [],
        message: 'Idea generated successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in ai-idea-generator:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to generate idea'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

async function generateIdeaWithAI(params: any) {
  const ideaTemplates = [
    {
      title: 'AI-Powered Personal Finance Coach',
      description: 'An intelligent financial advisor that provides personalized budgeting, investment advice, and financial planning.',
      category: 'FINANCE',
      problem_statement: 'Many people struggle with financial planning and lack access to affordable, personalized financial advice.',
      solution_summary: 'An AI platform that analyzes spending patterns and provides personalized financial advice.',
      target_market: 'Young professionals and families seeking financial guidance',
      business_model: 'Freemium SaaS with premium advisory services',
      tags: ['AI', 'Finance', 'Personal Finance', 'SaaS'],
      difficulty: 'intermediate',
      market_size: '$50B+',
      time_to_market: '12-18 months',
      initial_investment: '$100K-500K',
      popularity_score: 85
    },
    {
      title: 'Smart Home Energy Optimizer',
      description: 'IoT-based system that automatically optimizes home energy consumption to reduce bills and carbon footprint.',
      category: 'SMART_HOME',
      problem_statement: 'Homeowners waste energy and money due to inefficient usage patterns.',
      solution_summary: 'Smart devices and AI algorithms that learn usage patterns and optimize energy consumption.',
      target_market: 'Environmentally conscious homeowners',
      business_model: 'Hardware sales + software subscription',
      tags: ['IoT', 'Energy', 'Smart Home', 'Sustainability'],
      difficulty: 'advanced',
      market_size: '$20B+',
      time_to_market: '18-24 months',
      initial_investment: '$500K-1M',
      popularity_score: 78
    },
    {
      title: 'Virtual Reality Fitness Platform',
      description: 'Immersive VR workouts that make fitness fun and engaging through gamification.',
      category: 'FITNESS',
      problem_statement: 'Traditional fitness routines are boring and hard to maintain consistently.',
      solution_summary: 'VR platform with gamified workouts, social features, and personalized training.',
      target_market: 'Tech-savvy fitness enthusiasts and gamers',
      business_model: 'Subscription-based with premium content',
      tags: ['VR', 'Fitness', 'Gaming', 'Health'],
      difficulty: 'intermediate',
      market_size: '$15B+',
      time_to_market: '12-15 months',
      initial_investment: '$200K-800K',
      popularity_score: 82
    }
  ]

  // Simple algorithm to select and customize idea based on inputs
  let selectedTemplate = ideaTemplates[Math.floor(Math.random() * ideaTemplates.length)]
  
  // Customize based on industry
  if (params.industry) {
    const industryMatch = ideaTemplates.find(t => 
      t.category.toLowerCase().includes(params.industry.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(params.industry.toLowerCase()))
    )
    if (industryMatch) selectedTemplate = industryMatch
  }

  // Adjust based on budget
  if (params.budget_range === 'low') {
    selectedTemplate.difficulty = 'beginner'
    selectedTemplate.initial_investment = '$10K-50K'
  } else if (params.budget_range === 'high') {
    selectedTemplate.difficulty = 'advanced'
    selectedTemplate.initial_investment = '$500K-2M'
  }

  return selectedTemplate
}
