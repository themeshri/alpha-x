# Quick Start Guide - Alpha Stream Analytics

This guide will get you up and running in 5 minutes!

## Prerequisites Check

Run these commands to see what you need to install:

```bash
# Check PostgreSQL
which psql
# ✅ If found: Skip PostgreSQL installation
# ❌ If not found: Install PostgreSQL

# Check Redis
which redis-server
# ✅ If found: Skip Redis installation
# ❌ If not found: Install Redis

# Check Node.js (should already have)
node --version
# Need: v18 or higher
```

---

## Installation Steps

### 1. Install Missing Services (macOS)

```bash
# If PostgreSQL is missing:
brew install postgresql@16
brew services start postgresql@16

# If Redis is missing:
brew install redis
brew services start redis
```

### 2. Create Database

```bash
# Create the database
createdb alpha_stream

# Verify it worked
psql -l | grep alpha_stream
```

### 3. Get Your API Keys

You need 2 API keys:

**Option A: Anthropic (Currently configured)**
- Go to: https://console.anthropic.com/
- Sign up → Get API key
- Copy it (starts with `sk-ant-api03-...`)

**Option B: OpenAI (Cheaper alternative)**
- Go to: https://platform.openai.com/api-keys
- Sign up → Create API key
- Copy it (starts with `sk-proj-...`)
- See `SWITCH_TO_OPENAI.md` for code changes

**Apify (Required for scraping)**
- Go to: https://apify.com/
- Sign up → Settings → Integrations → API
- Copy token (starts with `apify_api_...`)

### 4. Configure Environment

```bash
# Copy template
cp .env.example .env.local

# Edit with your values
nano .env.local
```

Replace these values in `.env.local`:

```env
# Get your username
DATABASE_URL="postgresql://YOUR_USERNAME@localhost:5432/alpha_stream?schema=public"
# Replace YOUR_USERNAME with output of: whoami

APIFY_API_TOKEN="apify_api_YOUR_TOKEN_HERE"

ANTHROPIC_API_KEY="sk-ant-api03-YOUR_KEY_HERE"
# OR if using OpenAI:
# OPENAI_API_KEY="sk-proj-YOUR_KEY_HERE"

TWITTER_LIST_URL="https://twitter.com/i/lists/YOUR_LIST_ID"
# Get from any Twitter list URL
```

### 5. Install Dependencies

```bash
# Install all packages (includes OpenAI, dotenv, etc.)
npm install
```

### 6. Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init
```

### 7. Start Everything

Open **3 terminals**:

**Terminal 1 - Workers (Background jobs)**
```bash
npm run worker

# You should see:
# 🚀 Starting background workers...
# 📝 Environment loaded:
#    OpenAI: ✓ Set
#    Apify: ✓ Set
# ✅ Scrape worker running
# ✅ Analyze worker running
```

**Terminal 2 - Dev Server**
```bash
npm run dev
```

**Terminal 3 - (Optional) Database Viewer**
```bash
npx prisma studio
```

### 8. Open the App

Go to: **http://localhost:3000**

1. Click **"Lists"** in the header
2. Click **"+ Add Twitter List"**
3. Add your Twitter list
4. Click **"Scrape Now"** to start collecting data!

---

## Troubleshooting

### Can't connect to database?

```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Start it if stopped
brew services start postgresql@16

# Test connection
psql alpha_stream
```

### Can't connect to Redis?

```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG

# If not running
brew services start redis
```

### Workers not processing jobs?

1. Make sure Redis is running: `redis-cli ping`
2. Check worker logs for errors
3. Restart workers: Ctrl+C then `npm run worker`

### No data showing up?

1. Click "Trigger Scrape" button on dashboard
2. Wait 1-2 minutes for processing
3. Check worker terminal for progress
4. Refresh the page

---

## Using Docker Instead (Alternative)

If you prefer Docker over local installation:

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Your DATABASE_URL will be:
DATABASE_URL="postgresql://postgres:password@localhost:5432/alpha_stream?schema=public"

# Then continue with steps 4-7 above
```

---

## Verify Everything Works

**Checklist:**
- [ ] PostgreSQL running: `brew services list | grep postgres`
- [ ] Redis running: `redis-cli ping` → PONG
- [ ] Database created: `psql -l | grep alpha_stream`
- [ ] `.env.local` configured with all keys
- [ ] Migrations run: `npx prisma migrate status`
- [ ] Worker running without errors
- [ ] Dev server accessible at http://localhost:3000
- [ ] Trigger scrape works (check worker logs)

---

## Next Steps

1. **Create a Twitter list** with crypto influencers
2. **Add the list URL** to `.env.local`
3. **Trigger scrape** from dashboard
4. **Wait for analysis** (check worker logs)
5. **Explore the data** on dashboard

---

## Daily Workflow

Starting development:
```bash
# Make sure services are running
brew services list

# Start workers
npm run worker

# Start dev server (new terminal)
npm run dev
```

Stopping development:
```bash
# Stop workers: Ctrl+C
# Stop dev server: Ctrl+C

# (Optional) Stop background services
brew services stop postgresql@16
brew services stop redis
```

---

## Getting Help

- See `SETUP_LOCAL.md` for detailed setup
- See `SWITCH_TO_OPENAI.md` to use OpenAI instead
- See `claude.md` for development guide
- See `TODO.md` for roadmap
- Check worker logs for errors
- Use `npx prisma studio` to view database
