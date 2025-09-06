# Quick Setup Guide

## 🚀 Get Started in 5 Minutes

### 1. Prerequisites
- Node.js 18+ installed
- Supabase CLI installed (`npm install -g supabase`)

### 2. Setup Backend
```bash
cd backend
npm run setup
```

### 3. Start Development Environment
```bash
npm run dev
```

### 4. Access Services
- **Supabase Studio**: http://localhost:54323
- **API**: http://localhost:54321
- **Database**: localhost:54322
- **Realtime**: ws://localhost:54325

### 5. Test the Backend
```bash
# Test database connection
npm run status

# Generate TypeScript types
npm run gen:types

# Test Edge Functions
curl -X POST http://localhost:54321/functions/v1/ai-idea-generator \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test-user", "industry": "technology"}'
```

## 🔧 Environment Variables

Copy `env.example` to `.env` and update with your values:

```env
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## 📊 Database Schema

The backend includes:
- ✅ User authentication & profiles
- ✅ Subscription management
- ✅ Business ideas with AI generation
- ✅ Idea validation & scoring
- ✅ Execution roadmaps & tasks
- ✅ Community features
- ✅ Launch pages
- ✅ Admin controls

## 🔐 Security Features

- ✅ Row Level Security (RLS) on all tables
- ✅ JWT authentication
- ✅ Subscription limits enforcement
- ✅ Admin role management
- ✅ Input validation

## 🚀 Edge Functions

Three main functions included:
- `ai-idea-generator` - Generate business ideas
- `idea-grading` - Validate and score ideas
- `stripe-webhook` - Handle payments

## 📱 Frontend Integration

See `FRONTEND_INTEGRATION.md` for complete React integration guide.

## 🆘 Need Help?

- Check the main `README.md` for detailed documentation
- Review `FRONTEND_INTEGRATION.md` for frontend setup
- Visit [Supabase Docs](https://supabase.com/docs)

## 🎯 Next Steps

1. Set up your frontend with the integration guide
2. Configure Stripe for payments
3. Add your AI service API keys
4. Deploy to production

---

**Backend is ready! 🎉** 