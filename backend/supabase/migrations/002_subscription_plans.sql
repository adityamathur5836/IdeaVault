-- Insert subscription plans
INSERT INTO public.subscription_plans (name, description, price_monthly, price_yearly, features, max_ideas, max_roadmaps, max_collaborators) VALUES
('Free', 'Perfect for getting started with idea generation', 0.00, 0.00, 
 '["Basic idea generation", "3 ideas limit", "1 roadmap limit", "Community access"]', 3, 1, 1),

('Starter', 'Great for individual entrepreneurs', 19.99, 199.99, 
 '["Advanced idea generation", "10 ideas limit", "5 roadmaps limit", "Priority support", "Export features"]', 10, 5, 2),

('Professional', 'For growing businesses and teams', 49.99, 499.99, 
 '["AI-powered insights", "Unlimited ideas", "Unlimited roadmaps", "Team collaboration", "Advanced analytics", "Custom branding"]', 999999, 999999, 10),

('Enterprise', 'For large organizations', 199.99, 1999.99, 
 '["Everything in Professional", "White-label solution", "API access", "Dedicated support", "Custom integrations", "Advanced security"]', 999999, 999999, 999999); 