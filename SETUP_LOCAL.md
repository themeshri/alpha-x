# Local Development Setup Guide

## 1. PostgreSQL Database Setup

### Check if PostgreSQL is installed:
```bash
which psql
```

### If not installed, install via Homebrew (macOS):
```bash
brew install postgresql@16
```

### Start PostgreSQL service:
```bash
# Start PostgreSQL (will run in background)
brew services start postgresql@16

# Or start manually for this session only:
pg_ctl -D /opt/homebrew/var/postgresql@16 start
```

### Create the database:
```bash
# Create database
createdb alpha_stream

# Verify it was created
psql -l
```

### Your DATABASE_URL will be:
```
DATABASE_URL="postgresql://YOUR_USERNAME@localhost:5432/alpha_stream?schema=public"
```

To find your username:
```bash
whoami
```

For example, if your username is `husammeshri`:
```
DATABASE_URL="postgresql://husammeshri@localhost:5432/alpha_stream?schema=public"
```

### Common PostgreSQL commands:
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Stop PostgreSQL
brew services stop postgresql@16

# Restart PostgreSQL
brew services restart postgresql@16

# Connect to database
psql alpha_stream
```

---

## 2. Redis Setup

### Check if Redis is installed:
```bash
which redis-server
```

### Install Redis (macOS):
```bash
brew install redis
```

### Start Redis:

**Option 1: Run as background service (recommended):**
```bash
brew services start redis
```

**Option 2: Run in foreground (for testing):**
```bash
redis-server
```

### Verify Redis is running:
```bash
redis-cli ping
# Should return: PONG
```

### Your Redis environment variables:
```
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""
```

### Common Redis commands:
```bash
# Check if Redis is running
brew services list | grep redis

# Stop Redis
brew services stop redis

# Connect to Redis CLI
redis-cli

# Clear all Redis data (if needed)
redis-cli FLUSHALL
```

---

## 3. API Keys Setup

### Anthropic API Key (Currently Used)

1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Go to API Keys section
4. Create a new key
5. Copy and paste into `.env.local`:
```
ANTHROPIC_API_KEY="sk-ant-api03-..."
```

**Pricing**: Claude 3.5 Sonnet costs ~$3 per million input tokens

### Switch to OpenAI (Alternative)

If you prefer to use OpenAI instead of Anthropic, see the section below.

---

## 4. Apify Setup

### Get Apify API Token:

1. Go to https://apify.com/
2. Sign up for a free account
3. Go to Settings → Integrations → API
4. Copy your API token
5. Add to `.env.local`:
```
APIFY_API_TOKEN="apify_api_..."
```

**Note**: Apify free tier includes $5 credit/month

### Get Twitter List URL:

1. Go to Twitter/X
2. Create a list or find an existing one
3. Copy the URL (format: `https://twitter.com/i/lists/1234567890`)
4. Add to `.env.local`:
```
TWITTER_LIST_URL="https://twitter.com/i/lists/YOUR_LIST_ID"
```

---

## 5. Complete Setup Flow

### Step 1: Start services
```bash
# Terminal 1: Start PostgreSQL
brew services start postgresql@16

# Terminal 2: Start Redis
brew services start redis
```

### Step 2: Configure environment
```bash
# Copy example environment file
cp .env.example .env.local

# Edit .env.local with your values
nano .env.local
```

Your `.env.local` should look like:
```env
# Database
DATABASE_URL="postgresql://husammeshri@localhost:5432/alpha_stream?schema=public"

# Apify
APIFY_API_TOKEN="apify_api_YOUR_TOKEN"
TWITTER_LIST_URL="https://twitter.com/i/lists/YOUR_LIST_ID"

# AI Provider
ANTHROPIC_API_KEY="sk-ant-api03-YOUR_KEY"

# Redis (using defaults)
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
SCRAPE_INTERVAL_MINUTES="30"
```

### Step 3: Initialize database
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) View database in browser
npx prisma studio
```

### Step 4: Start the application
```bash
# Terminal 3: Start background workers
npm run worker

# Terminal 4: Start Next.js dev server
npm run dev
```

### Step 5: Open the app
Open http://localhost:3000 in your browser

---

## 6. Verification Checklist

- [ ] PostgreSQL is running: `brew services list | grep postgresql`
- [ ] Redis is running: `redis-cli ping` returns `PONG`
- [ ] Database created: `psql -l` shows `alpha_stream`
- [ ] Environment variables set in `.env.local`
- [ ] Prisma client generated: `npx prisma generate`
- [ ] Migrations run: `npx prisma migrate dev`
- [ ] Workers running: `npm run worker` shows no errors
- [ ] Dev server running: `npm run dev` shows no errors
- [ ] App accessible at http://localhost:3000

---

## 7. Troubleshooting

### PostgreSQL connection error:
```bash
# Check if PostgreSQL is running
brew services list

# Check if database exists
psql -l

# Try connecting manually
psql alpha_stream
```

### Redis connection error:
```bash
# Check if Redis is running
redis-cli ping

# If not running, start it
brew services start redis
```

### Prisma errors:
```bash
# Regenerate Prisma client
npx prisma generate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Worker not processing jobs:
```bash
# Make sure Redis is running
redis-cli ping

# Check Redis for jobs
redis-cli
> KEYS *
```

---

## 8. Stopping Services

When you're done developing:

```bash
# Stop background services
brew services stop postgresql@16
brew services stop redis

# Or stop all Homebrew services
brew services stop --all
```

---

## 9. Alternative: Using Docker (Optional)

If you prefer Docker instead of local installation:

```bash
# Create docker-compose.yml (see below)
docker-compose up -d

# Your DATABASE_URL will be:
DATABASE_URL="postgresql://postgres:password@localhost:5432/alpha_stream?schema=public"
```

See `docker-compose.yml` in project root.
