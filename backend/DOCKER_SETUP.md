# Docker Setup Guide

## 🐳 Docker Desktop Installation

Supabase requires Docker Desktop to run locally. Here's how to set it up:

### 1. Install Docker Desktop

**Option A: Using Homebrew (Recommended)**
```bash
brew install --cask docker
```

**Option B: Manual Installation**
1. Visit [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/)
2. Download and install Docker Desktop
3. Start Docker Desktop from Applications

### 2. Verify Installation

```bash
# Check Docker version
docker --version

# Check if Docker daemon is running
docker ps
```

### 3. Start Docker Desktop

If Docker Desktop is not running:
```bash
# Start Docker Desktop
open /Applications/Docker.app

# Wait for it to fully start (may take 1-2 minutes)
# You'll see the Docker icon in your menu bar when ready
```

### 4. Troubleshooting

**If Docker CLI is not found:**
```bash
# Reinstall Docker CLI
brew install docker

# Restart your terminal
```

**If Docker daemon is not running:**
1. Open Docker Desktop from Applications
2. Wait for the Docker icon to appear in the menu bar
3. The icon should be solid (not animated) when ready

**If you see permission errors:**
```bash
# Add your user to the docker group
sudo usermod -aG docker $USER

# Restart your terminal
```

## 🚀 Alternative: Use Supabase Cloud

If you prefer not to use Docker locally, you can use Supabase Cloud:

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up and create a new project
3. Note your project URL and API keys

### 2. Update Environment Variables
```bash
# Copy the example file
cp env.example .env

# Update with your cloud project details
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Deploy Database Schema
```bash
# Link to your cloud project
supabase link --project-ref your-project-ref

# Push the database schema
supabase db push

# Deploy Edge Functions
supabase functions deploy ai-idea-generator
supabase functions deploy idea-grading
supabase functions deploy stripe-webhook
```

## 🔧 Development Workflow

### With Docker (Local Development)
```bash
# Start local Supabase
npm run dev

# Access services
# - Studio: http://localhost:54323
# - API: http://localhost:54321
# - Database: localhost:54322
```

### With Supabase Cloud
```bash
# No need to start local services
# Just use the cloud URLs directly

# Access services
# - Studio: https://supabase.com/dashboard/project/your-project
# - API: https://your-project.supabase.co
```

## 📝 Next Steps

Once Docker is running or you've set up Supabase Cloud:

1. **Start the backend:**
   ```bash
   npm run dev
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your values
   ```

3. **Test the setup:**
   ```bash
   npm run status
   ```

4. **Integrate with frontend:**
   See `FRONTEND_INTEGRATION.md` for React setup

## 🆘 Still Having Issues?

1. **Docker Desktop not starting:**
   - Check if you have enough disk space
   - Restart your Mac
   - Reinstall Docker Desktop

2. **Permission issues:**
   - Make sure Docker Desktop has necessary permissions
   - Check System Preferences > Security & Privacy

3. **Port conflicts:**
   - Make sure ports 54321-54329 are available
   - Stop any other services using these ports

4. **Need help:**
   - Check [Docker Desktop docs](https://docs.docker.com/desktop/)
   - Visit [Supabase docs](https://supabase.com/docs)
   - Create an issue in the repository 