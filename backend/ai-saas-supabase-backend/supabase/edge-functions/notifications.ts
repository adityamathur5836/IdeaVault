import { serve } from 'https://deno.land/x/supabase_edge_functions@0.1.0/mod.ts';

serve(async (req) => {
    const { event, userId, message } = await req.json();

    if (!userId || !message) {
        return new Response(JSON.stringify({ error: 'User ID and message are required.' }), { status: 400 });
    }

    // Logic to send notifications based on the event type
    switch (event) {
        case 'NEW_IDEA':
            // Send notification for new idea
            await sendNotification(userId, `A new idea has been generated: ${message}`);
            break;
        case 'IDEA_VALIDATED':
            // Send notification for idea validation
            await sendNotification(userId, `Your idea has been validated: ${message}`);
            break;
        case 'TASK_UPDATED':
            // Send notification for task updates
            await sendNotification(userId, `A task related to your idea has been updated: ${message}`);
            break;
        default:
            return new Response(JSON.stringify({ error: 'Unknown event type.' }), { status: 400 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
});

async function sendNotification(userId, message) {
    // Placeholder for notification sending logic (e.g., email, push notification)
    console.log(`Sending notification to user ${userId}: ${message}`);
}