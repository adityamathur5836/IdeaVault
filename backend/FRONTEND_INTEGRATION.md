# Frontend Integration Guide

This guide explains how to integrate the IdeaVault backend with your React + Tailwind frontend.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd frontend/venture-muse-app
npm install @supabase/supabase-js
```

### 2. Environment Setup

Create a `.env` file in your frontend directory:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Copy Backend Files

Copy these files from the backend to your frontend:

```bash
# Copy Supabase client configuration
cp ../backend/src/lib/supabase.ts src/lib/
cp ../backend/src/services/api.ts src/services/
```

## 🔧 Configuration

### Supabase Client Setup

The `supabase.ts` file provides:
- Typed database interface
- Configured client with auth and realtime
- Environment variable validation

### API Service Layer

The `api.ts` file provides:
- Complete API wrapper functions
- Type-safe database operations
- Error handling
- Real-time subscriptions

## 📱 Usage Examples

### Authentication

```typescript
import { authAPI } from '../services/api'

// Sign up
const { data, error } = await authAPI.signUp(
  'user@example.com',
  'password123',
  'John Doe'
)

// Sign in
const { data, error } = await authAPI.signIn(
  'user@example.com',
  'password123'
)

// Sign out
const { error } = await authAPI.signOut()

// Get current user
const { user, error } = await authAPI.getCurrentUser()
```

### Ideas Management

```typescript
import { ideasAPI } from '../services/api'

// Get user's ideas
const { data: ideas, error } = await ideasAPI.getIdeas(userId)

// Create new idea
const { data: idea, error } = await ideasAPI.createIdea({
  user_id: userId,
  title: 'My Business Idea',
  description: 'A revolutionary new product...',
  problem_statement: 'People struggle with...',
  solution_summary: 'Our solution provides...',
  target_market: 'Young professionals aged 25-35',
  business_model: 'SaaS subscription',
  revenue_streams: ['Monthly subscriptions', 'Premium features'],
  cost_structure: ['Development', 'Marketing', 'Customer support'],
  key_metrics: ['Monthly active users', 'Churn rate'],
  tags: ['technology', 'productivity', 'saas']
})

// Generate AI idea
const { data: generatedIdea, error } = await ideasAPI.generateIdea({
  industry: 'technology',
  problem_area: 'productivity',
  target_audience: 'remote workers',
  budget_range: '10k-50k',
  timeframe: '6 months',
  user_id: userId
})

// Validate idea
const { data: validation, error } = await ideasAPI.gradeIdea({
  idea_id: ideaId,
  validator_id: userId,
  market_fit_score: 8,
  feasibility_score: 7,
  innovation_score: 9,
  scalability_score: 8,
  feedback: 'Great idea with strong potential!',
  is_anonymous: false
})
```

### Roadmaps & Tasks

```typescript
import { roadmapsAPI, tasksAPI } from '../services/api'

// Create roadmap
const { data: roadmap, error } = await roadmapsAPI.createRoadmap({
  idea_id: ideaId,
  user_id: userId,
  title: 'MVP Development Roadmap',
  description: 'Step-by-step plan to build our MVP',
  estimated_duration_days: 90,
  budget_estimate: 25000
})

// Create task
const { data: task, error } = await tasksAPI.createTask({
  roadmap_id: roadmapId,
  title: 'Market Research',
  description: 'Conduct comprehensive market analysis',
  status: 'pending',
  priority: 1,
  estimated_days: 7,
  due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
})

// Update task status
const { data: updatedTask, error } = await tasksAPI.updateTask(taskId, {
  status: 'in_progress',
  actual_days: 5
})
```

### Community Features

```typescript
import { communityAPI } from '../services/api'

// Create thread
const { data: thread, error } = await communityAPI.createThread({
  title: 'Tips for validating business ideas',
  content: 'What are your best practices for idea validation?',
  author_id: userId,
  idea_id: ideaId // optional
})

// Create message
const { data: message, error } = await communityAPI.createMessage({
  thread_id: threadId,
  author_id: userId,
  content: 'I always start with customer interviews...',
  parent_message_id: parentMessageId // optional for replies
})
```

### Subscriptions

```typescript
import { subscriptionAPI } from '../services/api'

// Get available plans
const { data: plans, error } = await subscriptionAPI.getPlans()

// Get user subscription
const { data: subscription, error } = await subscriptionAPI.getUserSubscription(userId)

// Create subscription (after Stripe payment)
const { data: newSubscription, error } = await subscriptionAPI.createSubscription({
  user_id: userId,
  plan_id: planId,
  stripe_customer_id: stripeCustomerId,
  stripe_subscription_id: stripeSubscriptionId
})
```

### Notifications

```typescript
import { notificationsAPI } from '../services/api'

// Get notifications
const { data: notifications, error } = await notificationsAPI.getNotifications(userId)

// Mark as read
const { data: updatedNotification, error } = await notificationsAPI.markAsRead(notificationId)

// Mark all as read
const { error } = await notificationsAPI.markAllAsRead(userId)
```

### Launch Pages

```typescript
import { launchPagesAPI } from '../services/api'

// Create launch page
const { data: launchPage, error } = await launchPagesAPI.createLaunchPage({
  idea_id: ideaId,
  user_id: userId,
  title: 'My Awesome Product',
  subtitle: 'Revolutionary solution for modern problems',
  description: 'Transform your workflow with our innovative platform...',
  features: ['Feature 1', 'Feature 2', 'Feature 3'],
  pricing: {
    monthly: 29.99,
    yearly: 299.99,
    features: ['All features', 'Priority support']
  },
  call_to_action: 'Get Started Today'
})

// Publish launch page
const { data: publishedPage, error } = await launchPagesAPI.updateLaunchPage(launchPageId, {
  is_published: true
})
```

## 🔄 Real-time Features

### Real-time Subscriptions

```typescript
import { realtimeAPI } from '../services/api'

// Subscribe to idea changes
const subscription = realtimeAPI.subscribeToIdeas(userId, (payload) => {
  console.log('Idea updated:', payload)
  // Update UI accordingly
})

// Subscribe to notifications
const notificationSubscription = realtimeAPI.subscribeToNotifications(userId, (payload) => {
  console.log('New notification:', payload)
  // Show notification toast
})

// Subscribe to community messages
const messageSubscription = realtimeAPI.subscribeToCommunityMessages(threadId, (payload) => {
  console.log('New message:', payload)
  // Add message to UI
})

// Cleanup subscriptions
useEffect(() => {
  return () => {
    subscription.unsubscribe()
    notificationSubscription.unsubscribe()
    messageSubscription.unsubscribe()
  }
}, [])
```

### React Hooks Example

```typescript
import { useState, useEffect } from 'react'
import { ideasAPI, realtimeAPI } from '../services/api'

export function useIdeas(userId: string) {
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Load initial data
    loadIdeas()

    // Subscribe to real-time updates
    const subscription = realtimeAPI.subscribeToIdeas(userId, (payload) => {
      if (payload.eventType === 'INSERT') {
        setIdeas(prev => [payload.new, ...prev])
      } else if (payload.eventType === 'UPDATE') {
        setIdeas(prev => prev.map(idea => 
          idea.id === payload.new.id ? payload.new : idea
        ))
      } else if (payload.eventType === 'DELETE') {
        setIdeas(prev => prev.filter(idea => idea.id !== payload.old.id))
      }
    })

    return () => subscription.unsubscribe()
  }, [userId])

  const loadIdeas = async () => {
    try {
      setLoading(true)
      const { data, error } = await ideasAPI.getIdeas(userId)
      if (error) throw error
      setIdeas(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { ideas, loading, error, refetch: loadIdeas }
}
```

## 🎨 UI Components

### Authentication Components

```typescript
// Login Form
export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = await authAPI.signIn(email, password)
    if (error) {
      // Handle error (show toast, etc.)
    } else {
      // Redirect to dashboard
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  )
}
```

### Idea Card Component

```typescript
export function IdeaCard({ idea }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-2">{idea.title}</h3>
      <p className="text-gray-600 mb-4">{idea.description}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Score:</span>
          <span className="font-semibold text-green-600">{idea.score}/10</span>
        </div>
        
        <div className="flex space-x-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            {idea.status}
          </span>
          {idea.tags?.map(tag => (
            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
```

### Notification Toast

```typescript
export function NotificationToast({ notification }) {
  return (
    <div className="bg-white border-l-4 border-blue-500 p-4 shadow-lg">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
          <p className="text-sm text-gray-500">{notification.message}</p>
        </div>
      </div>
    </div>
  )
}
```

## 🔒 Security Considerations

### Environment Variables

- Never commit `.env` files to version control
- Use different keys for development and production
- Validate environment variables on app startup

### Authentication State

```typescript
// Auth context
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    authAPI.getSession().then(({ session }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
```

### Protected Routes

```typescript
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [user, loading, navigate])

  if (loading) {
    return <div>Loading...</div>
  }

  return user ? children : null
}
```

## 🧪 Testing

### API Testing

```typescript
// Test idea creation
test('should create idea successfully', async () => {
  const mockIdea = {
    user_id: 'test-user-id',
    title: 'Test Idea',
    description: 'Test description'
  }

  const { data, error } = await ideasAPI.createIdea(mockIdea)
  
  expect(error).toBeNull()
  expect(data.title).toBe(mockIdea.title)
  expect(data.user_id).toBe(mockIdea.user_id)
})
```

### Component Testing

```typescript
test('should render idea card with correct data', () => {
  const mockIdea = {
    id: '1',
    title: 'Test Idea',
    description: 'Test description',
    score: 8.5,
    status: 'active',
    tags: ['technology']
  }

  render(<IdeaCard idea={mockIdea} />)
  
  expect(screen.getByText('Test Idea')).toBeInTheDocument()
  expect(screen.getByText('8.5/10')).toBeInTheDocument()
  expect(screen.getByText('active')).toBeInTheDocument()
})
```

## 🚀 Deployment

### Environment Variables

Set these in your production environment:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

### Build and Deploy

```bash
# Build the app
npm run build

# Deploy to your hosting platform
# (Vercel, Netlify, etc.)
```

## 📚 Additional Resources

- [Supabase React Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-react)
- [React Query with Supabase](https://supabase.com/docs/guides/getting-started/tutorials/with-react-query)
- [Next.js with Supabase](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs) 