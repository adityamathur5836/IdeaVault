-- Example SQL Queries for Interacting with the Database

-- 1. Retrieve all users
SELECT * FROM users;

-- 2. Retrieve a user profile by user ID
SELECT * FROM user_profiles WHERE user_id = 'your_user_id';

-- 3. Insert a new idea
INSERT INTO ideas (title, description, generated_data, status, score, validations)
VALUES ('New Business Idea', 'Description of the idea', '{"data": "example"}', 'draft', 0, '{}');

-- 4. Update the status of an idea
UPDATE ideas
SET status = 'active'
WHERE id = 'your_idea_id';

-- 5. Retrieve all ideas for a specific user
SELECT * FROM ideas WHERE user_id = 'your_user_id';

-- 6. Insert a new task linked to an idea
INSERT INTO tasks (idea_id, task, milestone, status)
VALUES ('your_idea_id', 'Complete market research', 'Research Phase', 'pending');

-- 7. Retrieve all tasks for a specific idea
SELECT * FROM tasks WHERE idea_id = 'your_idea_id';

-- 8. Record an idea validation
INSERT INTO idea_validations (idea_id, validation_score, comments)
VALUES ('your_idea_id', 85, 'Validated successfully.');

-- 9. Retrieve all validations for a specific idea
SELECT * FROM idea_validations WHERE idea_id = 'your_idea_id';

-- 10. Retrieve community messages related to an idea
SELECT * FROM community_messages WHERE idea_id = 'your_idea_id';

-- 11. Insert a new billing record
INSERT INTO billing (user_id, plan_type, payment_status)
VALUES ('your_user_id', 'premium', 'active');

-- 12. Retrieve billing information for a user
SELECT * FROM billing WHERE user_id = 'your_user_id';

-- 13. Retrieve launch page data
SELECT * FROM launch_page_data WHERE user_id = 'your_user_id';

-- 14. Log an admin action
INSERT INTO moderation_logs (admin_id, action, details)
VALUES ('your_admin_id', 'deleted_idea', 'Deleted idea with ID your_idea_id');