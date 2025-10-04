# Final Setup Guide - Alpha Stream Analytics

## 🎉 What You Have Now

A complete crypto Twitter intelligence platform with:

✅ **Correct Apify Integration** - Using Twitter List Scraper actor (`mAxIirfenUcKwNXST`)
✅ **List Management System** - Add/edit/delete lists via web UI
✅ **Database Storage** - Lists saved for future use
✅ **Automated Scraping** - Cron job scrapes all active lists
✅ **AI Analysis** - Claude or OpenAI for tweet categorization
✅ **Full Dashboard** - Analytics, charts, and insights

---

## 🚀 Quick Start (5 Minutes)

### 1. Install Redis (if not already installed)

```bash
brew install redis
brew services start redis
```

Verify: `redis-cli ping` should return `PONG`

### 2. Set Up Database

PostgreSQL is already installed. Create the database:

```bash
# Start PostgreSQL
brew services start postgresql@16

# Create database
createdb alpha_stream
```

### 3. Configure Environment

Edit `.env.local`:

```env
# Database (replace with your username from `whoami`)
DATABASE_URL="postgresql://husammeshri@localhost:5432/alpha_stream?schema=public"

# Apify (get from https://apify.com)
APIFY_API_TOKEN="apify_api_YOUR_TOKEN_HERE"

# AI Provider - Choose ONE:
ANTHROPIC_API_KEY="sk-ant-api03-..."  # Recommended
# OR
# OPENAI_API_KEY="sk-proj-..."  # Cheaper alternative

# Redis (defaults work locally)
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
SCRAPE_INTERVAL_MINUTES="30"
```

### 4. Install Dependencies

```bash
# Install all packages (includes OpenAI, dotenv, etc.)
npm install
```

### 5. Run Migrations

```bash
# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init
```

### 6. Start Everything

Open **3 terminals**:

**Terminal 1 - Workers:**
```bash
npm run worker
```

**Terminal 2 - Dev Server:**
```bash
npm run dev
```

**Terminal 3 - Database Viewer (Optional):**
```bash
npx prisma studio
```

### 7. Add Your First List

1. Open **http://localhost:3000**
2. Click **"Lists"** in the header
3. Click **"+ Add Twitter List"**
4. Fill in:
   - **Name**: e.g., "Crypto Influencers"
   - **List URL**: `https://twitter.com/i/lists/YOUR_LIST_ID`
   - **Description**: Optional notes
5. Click **"Add List"**
6. Click **"Scrape Now"** to start scraping

**Expected worker output:**
```bash
🚀 Starting background workers...
📝 Environment loaded:
   OpenAI: ✓ Set
   Apify: ✓ Set
✅ Scrape worker running
✅ Analyze worker running
```

---

## 📋 How to Get API Keys

### Apify ($5 free credit/month)

1. Go to https://apify.com
2. Sign up for free account
3. Go to **Settings → Integrations → API**
4. Copy your API token
5. Paste into `.env.local` as `APIFY_API_TOKEN`

**Cost**: $0.30 per 1000 tweets (very cheap!)

### Anthropic (Recommended)

1. Go to https://console.anthropic.com
2. Sign up
3. Go to **API Keys**
4. Create new key
5. Paste into `.env.local` as `ANTHROPIC_API_KEY`

**Cost**: $3 per 1M tokens (moderate)

### OpenAI (Cheaper Alternative)

1. Go to https://platform.openai.com/api-keys
2. Sign up
3. Create API key
4. Follow `SWITCH_TO_OPENAI.md` to switch code

**Cost**: $0.50 per 1M tokens (cheapest!)

---

## 🎯 How to Get Twitter List URLs

### Option 1: Use an Existing List

1. Go to Twitter/X
2. Find any public list (search "crypto" in Lists)
3. Copy the URL (e.g., `https://twitter.com/i/lists/1234567890`)

### Option 2: Create Your Own List

1. Go to Twitter → Lists → Create new list
2. Add crypto influencers to the list
3. Copy the list URL

**Example Lists to Try:**
- `https://twitter.com/i/lists/78783491` (ESPN example)
- Create your own with your favorite crypto accounts

---

## 💡 Using the App

### Dashboard (/)

- View stats (tweets, users, tokens)
- See sentiment and category charts
- Browse recent tweets
- View trending tokens
- Quick scrape all lists

### Lists (/lists)

- Add new Twitter lists
- Toggle lists active/inactive
- Scrape individual lists
- Delete lists
- View last scraped time

### Users (/users)

- See all tracked Twitter users
- View tweet counts and engagement
- Click user for detailed analytics

### Tokens (/tokens)

- Trending cryptocurrency mentions
- Filter by time range (24h, 7d, 30d)
- See mention counts

### Tweets (/tweets)

- Top tweets by engagement
- Filter by category and time
- Sort by likes/retweets/date

---

## 🔄 Automated Workflow

Once set up, the system runs automatically:

1. **Worker starts** → Checks for active lists
2. **Every 30 minutes** → Scrapes all active lists
3. **Apify fetches tweets** → Stores in database
4. **AI analyzes tweets** → Extracts tokens, sentiment, categories
5. **Dashboard updates** → Shows latest insights

You can:
- Add more lists anytime
- Toggle lists on/off
- Manually trigger scraping
- View real-time analytics

---

## 🛠 Common Commands

```bash
# Check Services
brew services list              # See what's running
redis-cli ping                  # Test Redis (should return PONG)
psql alpha_stream               # Connect to database

# Development
npm run dev                     # Start Next.js
npm run worker                  # Start background jobs
npx prisma studio               # View database in browser

# Database
npx prisma generate             # Regenerate Prisma client
npx prisma migrate dev          # Run new migrations
npx prisma migrate reset        # Reset database (⚠️ deletes data)

# Stop Services
brew services stop postgresql@16
brew services stop redis
```

---

## 📊 Cost Estimates

### Light Usage (100 tweets/day)
- Apify: $0.90/month
- Anthropic: ~$5/month
- **Total: ~$6/month**

### Medium Usage (1000 tweets/day)
- Apify: $9/month
- Anthropic: ~$50/month
- **Total: ~$59/month**

### Heavy Usage (10,000 tweets/day)
- Apify: $90/month
- Anthropic: ~$500/month
- **Total: ~$590/month**

**Tip**: Use OpenAI to reduce AI costs by 85%!

---

## 🐛 Troubleshooting

### "Can't connect to database"
```bash
brew services start postgresql@16
psql alpha_stream  # Test connection
```

### "Can't connect to Redis"
```bash
brew services start redis
redis-cli ping  # Should return PONG
```

### "No lists found"
Add a list via the UI at `/lists`

### "Worker not processing"
1. Check Redis is running
2. Check worker logs for errors
3. Restart: Ctrl+C then `npm run worker`

### "Apify error"
1. Verify `APIFY_API_TOKEN` in `.env.local`
2. Check Apify account has credits
3. Verify list URL format is correct

---

## 📚 Documentation Files

- **QUICK_START.md** - 5-minute setup guide
- **SETUP_LOCAL.md** - Detailed local installation
- **SWITCH_TO_OPENAI.md** - Use OpenAI instead of Anthropic
- **APIFY_INTEGRATION.md** - How the list system works
- **claude.md** - Development guide
- **TODO.md** - Feature roadmap

---

## 🎓 Next Steps

1. **Add your lists** - Start with 1-2 to test
2. **Test scraping** - Click "Scrape Now" and watch worker logs
3. **Explore the data** - Check dashboard after scraping completes
4. **Add more lists** - Scale up as needed
5. **Customize settings** - Adjust scrape interval, maxItems, etc.

---

## 🆘 Getting Help

**Check the logs:**
- Worker terminal shows scraping progress
- Dev terminal shows API requests
- Browser console shows React errors

**Common solutions:**
1. Restart workers
2. Check environment variables
3. Verify API keys
4. Run `npx prisma generate`

**Resources:**
- Apify Docs: https://docs.apify.com
- Prisma Docs: https://prisma.io/docs
- Next.js Docs: https://nextjs.org/docs

---

## ✨ You're Ready!

The system is fully configured and ready to:
- ✅ Scrape Twitter lists via Apify
- ✅ Analyze tweets with AI
- ✅ Track tokens and sentiment
- ✅ Show beautiful analytics
- ✅ Run automatically 24/7

**Start by adding your first list at:**
**http://localhost:3000/lists**

Happy tracking! 🚀
