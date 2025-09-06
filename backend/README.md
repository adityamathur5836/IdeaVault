# IdeaVault Backend - AI-Powered SaaS Platform

A comprehensive backend for an AI-powered SaaS platform for business idea generation using Supabase. This backend provides a scalable, secure, and fully managed database and API layer with real-time capabilities.

## 🚀 Features

- **Complete Database Schema**: PostgreSQL database with all necessary tables for a SaaS platform
- **Row Level Security**: Comprehensive RLS policies for data protection
- **Real-time APIs**: Built-in real-time capabilities using Supabase
- **Edge Functions**: Custom business logic for AI grading, billing, and notifications
- **Authentication**: Secure user authentication with Supabase Auth
- **Subscription Management**: Complete billing and subscription system
- **Community Features**: Forums, messaging, and collaboration tools
- **Launch Pages**: Customizable product landing pages
- **Admin Controls**: Moderation and admin management tools

## 📋 Prerequisites

- Node.js 18+ 
- Supabase CLI
- **Docker Desktop** (required for local development)
- PostgreSQL (handled by Supabase)
- Stripe account (for payments)
- AI service API keys (OpenAI, Anthropic, etc.)

> **Note:** If you don't want to use Docker locally, you can use Supabase Cloud instead. See [DOCKER_SETUP.md](./DOCKER_SETUP.md) for alternatives.

## 🛠️ Installation

1. **Install Docker Desktop**
   ```bash
   brew install --cask docker
   # Or download from https://www.docker.com/products/docker-desktop/
   ```

2. **Start Docker Desktop**
   ```bash
   open /Applications/Docker.app
   # Wait for Docker to fully start (1-2 minutes)
   ```

3. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd IdeaVault/backend
   ```

4. **Install Supabase CLI** (if not already installed)
   ```bash
   npm install -g supabase
   ```

5. **Initialize Supabase project**
   ```bash
   supabase init
   ```

6. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your actual values
   ```

7. **Start local development**
   ```bash
   npm run dev
   ```

> **Alternative:** Don't want to use Docker? See [DOCKER_SETUP.md](./DOCKER_SETUP.md) for Supabase Cloud setup.

## 🧪 Demo Data

The backend includes demo data for testing:

- **Demo User**: `demo@ideavault.com` / `demo123`
- **Sample Ideas**: 3 business ideas with full details
- **Sample Roadmaps**: 2 execution roadmaps with tasks
- **Sample Community**: Threads and messages for testing
- **Sample Launch Page**: One published launch page

To create the demo user manually (if migrations fail):
```bash
# Run in Supabase SQL Editor
psql -h localhost -p 54322 -U postgres -d postgres -f scripts/create-test-user.sql
```

## 🗄️ Database Schema

### Core Tables

#### Users & Authentication
- `user_profiles` - Extended user information
- `subscription_plans` - Available subscription tiers
- `user_subscriptions` - User subscription status

#### Ideas & Validation
- `ideas` - Business ideas with AI-generated content
- `idea_validations` - Community validation and scoring

#### Execution Roadmaps
- `roadmaps` - Execution plans for ideas
- `roadmap_tasks` - Individual tasks within roadmaps

#### Community Features
- `community_threads` - Discussion threads
- `community_messages` - Messages within threads
- `notifications` - User notifications

#### Launch Pages
- `launch_pages` - Customizable product landing pages

#### Admin & Moderation
- `admin_logs` - Admin action logs
- `moderation_actions` - Content moderation

## 🔐 Security Features

### Row Level Security (RLS)
All tables have comprehensive RLS policies that ensure:
- Users can only access their own data
- Public content is accessible to all authenticated users
- Admins and moderators have appropriate access levels
- Subscription limits are enforced

### Authentication
- Email/password authentication
- Social login support (Google, GitHub, etc.)
- JWT token management
- Password reset functionality

## 🚀 Edge Functions

### AI Idea Generator (`ai-idea-generator`)
Generates business ideas based on user input parameters:
- Industry preferences
- Problem areas
- Target audience
- Budget constraints
- Timeframe

### AI Idea Grading (`idea-grading`)
Provides intelligent idea validation with:
- Market fit scoring
- Feasibility assessment
- Innovation evaluation
- Scalability analysis
- Weighted scoring algorithm

### Stripe Webhook Handler (`stripe-webhook`)
Manages subscription lifecycle:
- Payment processing
- Subscription status updates
- Billing notifications
- Payment failure handling

## 📡 API Endpoints

### Authentication
```typescript
// Sign up
POST /auth/v1/signup
{
  email: string,
  password: string,
  options: { data: { full_name: string } }
}

// Sign in
POST /auth/v1/token?grant_type=password
{
  email: string,
  password: string
}

// Sign out
POST /auth/v1/logout
```

### Ideas
```typescript
// Get user's ideas
GET /rest/v1/ideas?user_id=eq.{user_id}

// Create new idea
POST /rest/v1/ideas
{
  user_id: string,
  title: string,
  description: string,
  // ... other fields
}

// Generate AI idea
POST /functions/v1/ai-idea-generator
{
  industry?: string,
  problem_area?: string,
  target_audience?: string,
  user_id: string
}

// Validate idea
POST /functions/v1/idea-grading
{
  idea_id: string,
  validator_id: string,
  market_fit_score: number,
  feasibility_score: number,
  innovation_score: number,
  scalability_score: number,
  feedback: string,
  is_anonymous: boolean
}
```

### Roadmaps
```typescript
// Get roadmaps
GET /rest/v1/roadmaps?user_id=eq.{user_id}

// Create roadmap
POST /rest/v1/roadmaps
{
  idea_id: string,
  user_id: string,
  title: string,
  description: string,
  estimated_duration_days: number,
  budget_estimate: number
}

// Get tasks
GET /rest/v1/roadmap_tasks?roadmap_id=eq.{roadmap_id}

// Create task
POST /rest/v1/roadmap_tasks
{
  roadmap_id: string,
  title: string,
  description: string,
  status: 'pending' | 'in_progress' | 'completed',
  priority: number,
  estimated_days: number,
  assignee_id?: string,
  due_date?: string
}
```

### Community
```typescript
// Get threads
GET /rest/v1/community_threads

// Create thread
POST /rest/v1/community_threads
{
  title: string,
  content: string,
  author_id: string,
  idea_id?: string
}

// Get messages
GET /rest/v1/community_messages?thread_id=eq.{thread_id}

// Create message
POST /rest/v1/community_messages
{
  thread_id: string,
  author_id: string,
  content: string,
  parent_message_id?: string
}
```

### Subscriptions
```typescript
// Get plans
GET /rest/v1/subscription_plans?is_active=eq.true

// Get user subscription
GET /rest/v1/user_subscriptions?user_id=eq.{user_id}&status=eq.active

// Create subscription
POST /rest/v1/user_subscriptions
{
  user_id: string,
  plan_id: string,
  stripe_customer_id?: string,
  stripe_subscription_id?: string
}
```

## 🔄 Real-time Features

### Subscriptions
```typescript
// Subscribe to idea changes
supabase
  .channel('ideas')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'ideas',
    filter: `user_id=eq.${userId}`
  }, callback)
  .subscribe()

// Subscribe to notifications
supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`
  }, callback)
  .subscribe()

// Subscribe to community messages
supabase
  .channel(`thread-${threadId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'community_messages',
    filter: `thread_id=eq.${threadId}`
  }, callback)
  .subscribe()
```

## 🧪 Testing

### Database Functions
```sql
-- Test idea scoring
SELECT calculate_idea_score('idea-uuid-here');

-- Test subscription status
SELECT get_user_subscription_status('user-uuid-here');

-- Test notification creation
SELECT create_notification(
  'user-uuid-here',
  'idea_comment',
  'Test Title',
  'Test Message',
  '{"test": "data"}'::jsonb
);
```

### Edge Functions
```bash
# Test AI idea generator
curl -X POST http://localhost:54321/functions/v1/ai-idea-generator \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "industry": "technology",
    "problem_area": "productivity",
    "target_audience": "remote workers",
    "user_id": "user-uuid-here"
  }'

# Test idea grading
curl -X POST http://localhost:54321/functions/v1/idea-grading \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "idea_id": "idea-uuid-here",
    "validator_id": "user-uuid-here",
    "market_fit_score": 8,
    "feasibility_score": 7,
    "innovation_score": 9,
    "scalability_score": 8,
    "feedback": "Great idea with strong market potential",
    "is_anonymous": false
  }'
```

## 🚀 Deployment

### Local Development
```bash
# Start all services
supabase start

# Stop all services
supabase stop

# Reset database
supabase db reset

# Generate types
supabase gen types typescript --local > src/lib/database.types.ts
```

### Production Deployment
1. **Create Supabase project**
   ```bash
   supabase projects create ideavault-prod
   ```

2. **Link to remote project**
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. **Deploy database**
   ```bash
   supabase db push
   ```

4. **Deploy Edge Functions**
   ```bash
   supabase functions deploy ai-idea-generator
   supabase functions deploy idea-grading
   supabase functions deploy stripe-webhook
   ```

5. **Set production environment variables**
   ```bash
   supabase secrets set SUPABASE_URL=your-production-url
   supabase secrets set SUPABASE_ANON_KEY=your-production-anon-key
   supabase secrets set STRIPE_SECRET_KEY=your-stripe-secret-key
   # ... other secrets
   ```

## 🔧 Configuration

### Environment Variables
See `env.example` for all required environment variables.

### Database Configuration
- **Port**: 54322 (local), 5432 (production)
- **Extensions**: uuid-ossp, pgcrypto
- **RLS**: Enabled on all tables
- **Triggers**: Automated updates and notifications

### API Configuration
- **Port**: 54321 (local)
- **CORS**: Configured for frontend
- **Rate Limiting**: Built into Supabase
- **Authentication**: JWT-based

## 📊 Monitoring & Analytics

### Database Monitoring
- Query performance tracking
- Connection pool monitoring
- Storage usage analytics
- Real-time subscription monitoring

### Application Monitoring
- Edge function execution logs
- API response times
- Error tracking
- User activity analytics

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit secrets to version control
2. **RLS Policies**: Always test policies thoroughly
3. **Input Validation**: Validate all user inputs
4. **Rate Limiting**: Implement appropriate rate limits
5. **Audit Logging**: Log all admin actions
6. **Regular Updates**: Keep dependencies updated

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the Supabase documentation
- Review the API documentation

## 🔗 Links

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Stripe Documentation](https://stripe.com/docs)
- [React + Supabase Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-react) 