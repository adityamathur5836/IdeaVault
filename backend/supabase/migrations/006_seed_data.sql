-- Insert sample ideas (for demonstration)
INSERT INTO public.ideas (user_id, title, description, problem_statement, solution_summary, target_market, status, score, is_public, tags) VALUES
('00000000-0000-0000-0000-000000000001', 'AI-Powered Personal Chef', 
 'An AI system that creates personalized meal plans and recipes based on dietary restrictions, preferences, and available ingredients.',
 'People struggle to maintain healthy eating habits due to lack of time, knowledge, and motivation to plan and cook meals.',
 'An AI-powered platform that analyzes user preferences, dietary needs, and available ingredients to generate personalized meal plans and recipes.',
 'Health-conscious individuals aged 25-45 who want to eat better but lack time for meal planning',
 'active', 8.5, true, ARRAY['health', 'ai', 'food', 'lifestyle']),

('00000000-0000-0000-0000-000000000001', 'Sustainable Fashion Marketplace', 
 'A marketplace connecting eco-conscious consumers with sustainable fashion brands and second-hand clothing.',
 'Fast fashion contributes to environmental pollution and unethical labor practices, while sustainable options are often expensive and hard to find.',
 'A curated marketplace that verifies sustainability credentials and connects consumers with ethical fashion brands.',
 'Environmentally conscious consumers aged 18-35 who prioritize sustainability in their purchasing decisions',
 'active', 7.8, true, ARRAY['sustainability', 'fashion', 'marketplace', 'eco-friendly']),

('00000000-0000-0000-0000-000000000001', 'Remote Team Wellness Platform', 
 'A comprehensive wellness platform designed specifically for remote teams to maintain physical and mental health.',
 'Remote workers often struggle with isolation, lack of physical activity, and poor work-life boundaries.',
 'A platform offering virtual fitness classes, mental health resources, and team-building activities tailored for remote teams.',
 'Remote-first companies and distributed teams looking to improve employee wellness and engagement',
 'draft', 6.2, false, ARRAY['wellness', 'remote-work', 'team-building', 'health']);

-- Insert sample roadmaps (using the first two ideas)
INSERT INTO public.roadmaps (idea_id, user_id, title, description, estimated_duration_days, budget_estimate, priority_level) VALUES
((SELECT id FROM public.ideas WHERE title = 'AI-Powered Personal Chef' LIMIT 1), '00000000-0000-0000-0000-000000000001', 
 'AI Chef MVP Development', 'Initial development roadmap for the AI-powered personal chef platform', 90, 25000.00, 1),

((SELECT id FROM public.ideas WHERE title = 'Sustainable Fashion Marketplace' LIMIT 1), '00000000-0000-0000-0000-000000000001', 
 'Sustainable Fashion Launch', 'Go-to-market strategy for the sustainable fashion marketplace', 120, 50000.00, 2);

-- Insert sample roadmap tasks
INSERT INTO public.roadmap_tasks (roadmap_id, title, description, status, priority, estimated_days, due_date) VALUES
((SELECT id FROM public.roadmaps WHERE title = 'AI Chef MVP Development' LIMIT 1), 'Market Research', 'Conduct comprehensive market research and competitor analysis', 'completed', 1, 7, NOW() - INTERVAL '30 days'),

((SELECT id FROM public.roadmaps WHERE title = 'AI Chef MVP Development' LIMIT 1), 'UI/UX Design', 'Design user interface and user experience for the AI chef platform', 'in_progress', 2, 14, NOW() + INTERVAL '7 days'),

((SELECT id FROM public.roadmaps WHERE title = 'AI Chef MVP Development' LIMIT 1), 'Backend Development', 'Develop the core AI algorithms and backend infrastructure', 'pending', 3, 21, NOW() + INTERVAL '21 days'),

((SELECT id FROM public.roadmaps WHERE title = 'AI Chef MVP Development' LIMIT 1), 'Beta Testing', 'Conduct beta testing with 100 users and gather feedback', 'pending', 4, 14, NOW() + INTERVAL '42 days'),

((SELECT id FROM public.roadmaps WHERE title = 'Sustainable Fashion Launch' LIMIT 1), 'Brand Development', 'Create brand identity and marketing materials', 'pending', 1, 10, NOW() + INTERVAL '14 days'),

((SELECT id FROM public.roadmaps WHERE title = 'Sustainable Fashion Launch' LIMIT 1), 'Vendor Onboarding', 'Onboard 50+ sustainable fashion brands', 'pending', 2, 30, NOW() + INTERVAL '30 days');

-- Insert sample community threads
INSERT INTO public.community_threads (title, content, author_id, idea_id, view_count) VALUES
('Tips for validating business ideas', 'What are your best practices for validating business ideas before investing time and money?', 
 '00000000-0000-0000-0000-000000000001', NULL, 45),

('AI in food industry - thoughts?', 'I''m working on an AI-powered food platform. Anyone else exploring this space?', 
 '00000000-0000-0000-0000-000000000001', (SELECT id FROM public.ideas WHERE title = 'AI-Powered Personal Chef' LIMIT 1), 23);

-- Insert sample community messages
INSERT INTO public.community_messages (thread_id, author_id, content) VALUES
((SELECT id FROM public.community_threads WHERE title = 'Tips for validating business ideas' LIMIT 1), '00000000-0000-0000-0000-000000000001', 
 'I always start with customer interviews. Talk to at least 20 potential customers before building anything.'),

((SELECT id FROM public.community_threads WHERE title = 'Tips for validating business ideas' LIMIT 1), '00000000-0000-0000-0000-000000000001', 
 'Also, create a simple landing page to test demand. You''d be surprised how much you can learn from that.'),

((SELECT id FROM public.community_threads WHERE title = 'AI in food industry - thoughts?' LIMIT 1), '00000000-0000-0000-0000-000000000001', 
 'The food industry is ripe for AI disruption. I''m seeing a lot of interesting startups in this space.');

-- Insert sample launch pages
INSERT INTO public.launch_pages (idea_id, user_id, slug, title, subtitle, description, features, pricing, is_published, view_count) VALUES
((SELECT id FROM public.ideas WHERE title = 'AI-Powered Personal Chef' LIMIT 1), '00000000-0000-0000-0000-000000000001', 
 'ai-personal-chef', 'AI Personal Chef', 'Your AI-powered culinary companion', 
 'Transform your cooking experience with personalized meal plans and recipes generated by AI.',
 '["Personalized meal plans", "Dietary restriction support", "Ingredient optimization", "Nutritional analysis"]',
 '{"monthly": 9.99, "yearly": 99.99, "features": ["Unlimited meal plans", "Recipe generation", "Shopping lists"]}',
 true, 156); 