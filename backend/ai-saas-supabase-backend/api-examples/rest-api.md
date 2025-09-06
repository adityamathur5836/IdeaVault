# REST API Examples for AI-Powered SaaS Platform

## User Authentication

### Sign Up
```http
POST /auth/v1/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Sign In
```http
POST /auth/v1/token
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

## Ideas Management

### Create Idea
```http
POST /rest/v1/ideas
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "New Business Idea",
  "description": "Description of the idea.",
  "generated_data": {},
  "status": "draft",
  "score": 0,
  "validations": []
}
```

### Get All Ideas
```http
GET /rest/v1/ideas
Authorization: Bearer <access_token>
```

### Update Idea
```http
PATCH /rest/v1/ideas?id=eq.<idea_id>
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "active",
  "score": 85
}
```

### Delete Idea
```http
DELETE /rest/v1/ideas?id=eq.<idea_id>
Authorization: Bearer <access_token>
```

## Execution Roadmap Tasks

### Create Task
```http
POST /rest/v1/tasks
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "idea_id": "<idea_id>",
  "task": "Define milestones",
  "status": "pending"
}
```

### Get Tasks for Idea
```http
GET /rest/v1/tasks?idea_id=eq.<idea_id>
Authorization: Bearer <access_token>
```

## Idea Validation and Grading

### Submit Validation
```http
POST /rest/v1/validations
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "idea_id": "<idea_id>",
  "validation_data": {
    "criteria": "Market demand",
    "score": 90
  }
}
```

## Community Features

### Send Message
```http
POST /rest/v1/messages
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "thread_id": "<thread_id>",
  "user_id": "<user_id>",
  "message": "This is a message in the thread."
}
```

## Billing and Subscription

### Create Subscription
```http
POST /rest/v1/subscriptions
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "user_id": "<user_id>",
  "plan_type": "premium",
  "payment_status": "active"
}
```

## Launch Page Data

### Update Launch Page
```http
PATCH /rest/v1/launch_pages?id=eq.<page_id>
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "custom_data": {
    "title": "My Product",
    "description": "Launch description."
  }
}
```

## Admin Controls

### Get Moderation Logs
```http
GET /rest/v1/moderation_logs
Authorization: Bearer <admin_access_token>
```

## Notes
- Replace `<access_token>`, `<idea_id>`, `<user_id>`, `<thread_id>`, and `<page_id>` with actual values.
- Ensure to handle errors and validate responses in your frontend application.