import { serve } from 'https://deno.land/std/http/server.ts';

serve(async (req) => {
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    const body = await req.json();
    const { eventType, data } = body;

    if (!eventType || !data) {
        return new Response('Bad Request', { status: 400 });
    }

    try {
        switch (eventType) {
            case 'invoice.payment_succeeded':
                // Handle successful payment
                await updateSubscriptionStatus(data.customerId, 'active');
                break;
            case 'invoice.payment_failed':
                // Handle failed payment
                await updateSubscriptionStatus(data.customerId, 'past_due');
                break;
            case 'customer.subscription.updated':
                // Handle subscription updates
                await updateSubscriptionStatus(data.customerId, data.status);
                break;
            default:
                return new Response('Event Not Handled', { status: 200 });
        }

        return new Response('Webhook Handled', { status: 200 });
    } catch (error) {
        console.error('Error handling webhook:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
});

async function updateSubscriptionStatus(customerId, status) {
    // Implement the logic to update the subscription status in the database
    // This could involve calling Supabase client to update the relevant records
}