import { serve } from 'https://deno.land/x/supabase_edge_functions@0.1.0/mod.ts';

serve(async (req) => {
    const { title, description } = await req.json();

    if (!title || !description) {
        return new Response(JSON.stringify({ error: 'Title and description are required.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const score = calculateScore(title, description);
    
    return new Response(JSON.stringify({ score }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
});

function calculateScore(title, description) {
    let score = 0;

    // Simple scoring algorithm based on title and description length
    score += title.length > 10 ? 1 : 0;
    score += description.length > 50 ? 2 : 0;

    return score;
}