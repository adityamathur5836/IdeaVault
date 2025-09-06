import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StripeEvent {
  id: string
  type: string
  data: {
    object: {
      id: string
      customer: string
      subscription?: string
      status: string
      current_period_start: number
      current_period_end: number
      cancel_at_period_end?: boolean
      metadata?: Record<string, string>
    }
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
    )

    const signature = req.headers.get('stripe-signature')
    const body = await req.text()
    
    // Verify webhook signature (in production, you should verify with Stripe)
    // const event = stripe.webhooks.constructEvent(body, signature, Deno.env.get('STRIPE_WEBHOOK_SECRET'))
    
    // For now, we'll parse the body directly
    const event: StripeEvent = JSON.parse(body)

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(supabaseClient, event.data.object)
        break
      
      case 'customer.subscription.deleted':
        await handleSubscriptionCancellation(supabaseClient, event.data.object)
        break
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(supabaseClient, event.data.object)
        break
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(supabaseClient, event.data.object)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

async function handleSubscriptionUpdate(supabaseClient: any, subscription: any) {
  const { data: userSubscription } = await supabaseClient
    .from('user_subscriptions')
    .select('id, user_id')
    .eq('stripe_subscription_id', subscription.id)
    .single()

  if (userSubscription) {
    // Update existing subscription
    await supabaseClient
      .from('user_subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end || false,
        updated_at: new Date().toISOString()
      })
      .eq('id', userSubscription.id)

    // Create notification
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: userSubscription.user_id,
        type: 'subscription',
        title: 'Subscription Updated',
        message: `Your subscription status has been updated to: ${subscription.status}`,
        data: {
          subscription_id: userSubscription.id,
          status: subscription.status
        }
      })
  }
}

async function handleSubscriptionCancellation(supabaseClient: any, subscription: any) {
  const { data: userSubscription } = await supabaseClient
    .from('user_subscriptions')
    .select('id, user_id')
    .eq('stripe_subscription_id', subscription.id)
    .single()

  if (userSubscription) {
    await supabaseClient
      .from('user_subscriptions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', userSubscription.id)

    // Create notification
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: userSubscription.user_id,
        type: 'subscription',
        title: 'Subscription Cancelled',
        message: 'Your subscription has been cancelled. You can still access your data until the end of your billing period.',
        data: {
          subscription_id: userSubscription.id,
          status: 'cancelled'
        }
      })
  }
}

async function handlePaymentSucceeded(supabaseClient: any, invoice: any) {
  const { data: userSubscription } = await supabaseClient
    .from('user_subscriptions')
    .select('id, user_id')
    .eq('stripe_subscription_id', invoice.subscription)
    .single()

  if (userSubscription) {
    await supabaseClient
      .from('user_subscriptions')
      .update({
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', userSubscription.id)

    // Create notification
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: userSubscription.user_id,
        type: 'subscription',
        title: 'Payment Successful',
        message: 'Your subscription payment was processed successfully.',
        data: {
          subscription_id: userSubscription.id,
          invoice_id: invoice.id
        }
      })
  }
}

async function handlePaymentFailed(supabaseClient: any, invoice: any) {
  const { data: userSubscription } = await supabaseClient
    .from('user_subscriptions')
    .select('id, user_id')
    .eq('stripe_subscription_id', invoice.subscription)
    .single()

  if (userSubscription) {
    await supabaseClient
      .from('user_subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString()
      })
      .eq('id', userSubscription.id)

    // Create notification
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: userSubscription.user_id,
        type: 'subscription',
        title: 'Payment Failed',
        message: 'Your subscription payment failed. Please update your payment method to continue service.',
        data: {
          subscription_id: userSubscription.id,
          invoice_id: invoice.id
        }
      })
  }
} 