// @ts-nocheck  <-- add this at the top to disable TS errors in VSCode (optional)
// Edge Functions run on Deno, not Node, so TypeScript can't resolve Deno globals locally

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    )

    const { industry, problem_area, target_audience, budget_range, timeframe, user_id } = await req.json()

    if (!user_id) {
      throw new Error("User ID is required")
    }

    // Count user's current ideas
    const { count: currentIdeas } = await supabaseClient
      .from("user_ideas")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user_id)

    const maxIdeas = 50
    if (currentIdeas && currentIdeas >= maxIdeas) {
      throw new Error(`Idea limit exceeded. You can create up to ${maxIdeas} ideas.`)
    }

    // Generate new idea
    const generatedIdea = generateIdeaFromTemplate({
      industry,
      problem_area,
      target_audience,
      budget_range,
      timeframe,
    })

    // Save to user_ideas
    const { data: userIdea, error: userError } = await supabaseClient
      .from("user_ideas")
      .insert({
        user_id,
        title: generatedIdea.title,
        description: generatedIdea.description,
        category: generatedIdea.category,
        problem_statement: generatedIdea.problem_statement,
        solution_summary: generatedIdea.solution_summary,
        target_market: generatedIdea.target_market,
        business_model: generatedIdea.business_model,
        revenue_streams: generatedIdea.revenue_streams,
        cost_structure: generatedIdea.cost_structure,
        key_metrics: generatedIdea.key_metrics,
        tags: generatedIdea.tags,
        status: "draft",
      })
      .select()
      .single()

    if (userError) {
      throw new Error(`Failed to save idea: ${userError.message}`)
    }

    // Save to ideas_pool
    const { error: poolError } = await supabaseClient.from("ideas_pool").insert({
      title: generatedIdea.title,
      description: generatedIdea.description,
      category: generatedIdea.category,
      problem_statement: generatedIdea.problem_statement,
      solution_summary: generatedIdea.solution_summary,
      target_market: generatedIdea.target_market,
      business_model: generatedIdea.business_model,
      revenue_streams: generatedIdea.revenue_streams,
      cost_structure: generatedIdea.cost_structure,
      key_metrics: generatedIdea.key_metrics,
      tags: generatedIdea.tags,
      difficulty: generatedIdea.difficulty,
      market_size: generatedIdea.market_size,
      time_to_market: generatedIdea.time_to_market,
      initial_investment: generatedIdea.initial_investment,
      popularity_score: generatedIdea.popularity_score,
      created_by: user_id,
    })

    if (poolError) {
      console.warn("Failed to save to ideas pool:", poolError.message)
    }

    return new Response(
      JSON.stringify({
        success: true,
        idea: {
          ...userIdea,
          difficulty: generatedIdea.difficulty,
          market_size: generatedIdea.market_size,
          time_to_market: generatedIdea.time_to_market,
          initial_investment: generatedIdea.initial_investment,
          score: Math.floor(generatedIdea.popularity_score),
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    )
  } catch (error) {
    console.error("Error:", error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    )
  }
})

function generateIdeaFromTemplate(params: any) {
  const templates = [
    {
      title: "AI-Powered Personal Finance Coach",
      description:
        "An intelligent financial advisor that provides personalized budgeting, investment advice, and financial planning.",
      category: "fintech",
      problem_statement:
        "Many people struggle with financial planning and lack access to affordable, personalized financial advice.",
      solution_summary: "An AI platform that analyzes spending patterns and provides personalized financial advice.",
      target_market: "Young professionals aged 25-40 who want to improve their financial literacy",
      business_model: "Freemium with premium subscription tiers",
      revenue_streams: ["Monthly subscriptions", "Premium features", "Financial product referrals"],
      cost_structure: ["AI infrastructure", "Compliance", "Customer support", "Marketing"],
      key_metrics: ["Monthly active users", "Subscription conversion rate", "Customer lifetime value"],
      tags: ["finance", "ai", "personal-finance", "budgeting"],
      difficulty: "Medium",
      market_size: "$50B+",
      time_to_market: "6-12 months",
      initial_investment: "$100K-$500K",
      popularity_score: 85,
    },
    {
      title: "Sustainable Local Food Marketplace",
      description: "A platform connecting local farmers with consumers for fresh, sustainable produce delivery.",
      category: "marketplace",
      problem_statement:
        "Consumers want fresh, local produce but struggle to find reliable sources and farmers need better market access.",
      solution_summary: "A digital marketplace that connects local farmers directly with consumers for fresh produce delivery.",
      target_market: "Health-conscious consumers and local farmers in urban and suburban areas",
      business_model: "Commission-based marketplace with delivery fees",
      revenue_streams: ["Transaction commissions", "Delivery fees", "Premium farmer listings"],
      cost_structure: ["Platform development", "Delivery logistics", "Farmer onboarding", "Marketing"],
      key_metrics: ["Gross merchandise value", "Number of active farmers", "Customer retention rate"],
      tags: ["marketplace", "sustainability", "food", "local"],
      difficulty: "Medium",
      market_size: "$30B+",
      time_to_market: "6-9 months",
      initial_investment: "$200K-$500K",
      popularity_score: 78,
    },
    {
      title: "Remote Team Productivity Suite",
      description: "An all-in-one platform for remote teams to collaborate, track productivity, and maintain team culture.",
      category: "productivity",
      problem_statement: "Remote teams struggle with collaboration, productivity tracking, and maintaining team culture.",
      solution_summary: "A comprehensive platform that combines project management, time tracking, and team engagement tools.",
      target_market: "Remote-first companies and distributed teams of 10-500 employees",
      business_model: "SaaS subscription with per-user pricing",
      revenue_streams: ["Monthly subscriptions", "Enterprise plans", "Integration marketplace"],
      cost_structure: ["Software development", "Cloud infrastructure", "Sales team", "Customer success"],
      key_metrics: ["Monthly recurring revenue", "User engagement", "Team productivity scores"],
      tags: ["productivity", "remote-work", "collaboration", "saas"],
      difficulty: "Hard",
      market_size: "$20B+",
      time_to_market: "9-15 months",
      initial_investment: "$300K+",
      popularity_score: 82,
    },
  ]

  let selectedTemplate = templates[Math.floor(Math.random() * templates.length)]

  if (params.industry && params.industry !== "any") {
    const industryMatch = templates.find((t) => t.category === params.industry)
    if (industryMatch) selectedTemplate = industryMatch
  }

  if (params.budget_range) {
    switch (params.budget_range) {
      case "bootstrap":
        selectedTemplate.difficulty = "Easy"
        selectedTemplate.initial_investment = "Under $10K"
        break
      case "small":
        selectedTemplate.initial_investment = "$10K-$50K"
        break
      case "medium":
        selectedTemplate.initial_investment = "$50K-$200K"
        break
      case "large":
        selectedTemplate.difficulty = "Hard"
        selectedTemplate.initial_investment = "$200K+"
        break
    }
  }

  return selectedTemplate
}
