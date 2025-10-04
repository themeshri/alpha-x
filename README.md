# Alpha Stream Analytics

Crypto Twitter Intelligence Platform - Automated intelligence gathering from Twitter trading influencers, converting raw tweets into actionable trading insights through AI categorization and analytics.

## Features

- **List Management** - Add/edit/delete Twitter lists via web UI with database storage
- **Automated Twitter Scraping** - Scrape tweets from multiple Twitter lists using Apify Twitter List Scraper
- **AI-Powered Analysis** - Analyze tweets using OpenAI (or Claude) for categorization, sentiment, and entity extraction
- **Token Tracking** - Track cryptocurrency token mentions and trends
- **User Analytics** - Analyze Twitter influencer posting patterns and engagement
- **Real-time Dashboard** - View analytics with auto-refresh
- **Background Processing** - BullMQ job queue for async scraping and analysis
- **Automated Cron Jobs** - Scheduled scraping every 30 minutes for all active lists

## Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS, React Query
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL
- **AI**: OpenAI API (or Anthropic Claude API)
- **Scraping**: Apify Twitter List Scraper (`mAxIirfenUcKwNXST`)
- **Queue**: BullMQ with Redis
- **Deployment**: Vercel (recommended)

## Quick Start

See **[QUICK_START.md](./QUICK_START.md)** for a 5-minute setup guide!

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or hosted)
- Redis server (local or hosted)
- Apify API token (free $5/month credit)
- OpenAI API key (or Anthropic Claude API key)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd x-alpha
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
# Database (replace YOUR_USERNAME with output of `whoami`)
DATABASE_URL="postgresql://YOUR_USERNAME@localhost:5432/alpha_stream?schema=public"

# Apify
APIFY_API_TOKEN="apify_api_YOUR_TOKEN_HERE"

# AI Provider - Choose ONE:
OPENAI_API_KEY="sk-proj-YOUR_KEY_HERE"
# OR
# ANTHROPIC_API_KEY="sk-ant-api03-YOUR_KEY_HERE"

# Redis (defaults for local)
REDIS_HOST="localhost"
REDIS_PORT="6379"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
SCRAPE_INTERVAL_MINUTES="30"
```

4. Set up local services (macOS):
```bash
# Install PostgreSQL
brew install postgresql@16
brew services start postgresql@16

# Install Redis
brew install redis
brew services start redis

# Create database
createdb alpha_stream
```

5. Set up the database:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

6. Start the background workers:
```bash
# In a separate terminal
npm run worker

# Expected output:
# 🚀 Starting background workers...
# 📝 Environment loaded:
#    OpenAI: ✓ Set
#    Apify: ✓ Set
# ✅ Scrape worker running
# ✅ Analyze worker running
```

7. Start the development server:
```bash
npm run dev
```

8. Open [http://localhost:3000](http://localhost:3000)

9. Add your first Twitter list:
   - Click **"Lists"** in the header
   - Click **"+ Add Twitter List"**
   - Enter list name and URL (e.g., `https://twitter.com/i/lists/1234567890`)
   - Click **"Scrape Now"** to start!

## Usage

### Managing Lists

The app now supports multiple Twitter lists with database storage:

1. **Add Lists** - Go to `/lists` and add Twitter list URLs
2. **Activate/Deactivate** - Toggle which lists to scrape automatically
3. **Manual Scrape** - Click "Scrape Now" on individual lists or all lists
4. **Automated Scraping** - Cron job scrapes all active lists every 30 minutes

### How It Works

1. **Scraping** - Apify fetches tweets from active Twitter lists
2. **Storage** - Raw tweets stored in PostgreSQL database
3. **Analysis** - Each tweet queued for AI analysis with OpenAI/Claude
4. **Extraction** - AI extracts tokens, projects, narratives, sentiment, and categories
5. **Dashboard** - Real-time analytics with charts and insights

### API Endpoints

- `POST /api/scrape` - Trigger a scraping job (supports `scrapeAll`, `listId`, or `listUrl`)
- `GET /api/lists` - Get all Twitter lists
- `POST /api/lists` - Add a new Twitter list
- `PUT /api/lists/[id]` - Update a Twitter list
- `DELETE /api/lists/[id]` - Delete a Twitter list
- `GET /api/stats/overview?range=24h` - Get overview statistics
- `GET /api/users` - List tracked users with stats
- `GET /api/users/[id]` - Get individual user analytics
- `GET /api/tokens/trending?range=24h` - Get trending tokens
- `GET /api/tweets/top?range=24h&sortBy=likes` - Get top tweets
- `GET /api/tweets/recent?limit=20` - Get recent tweets

## Project Structure

```
x-alpha/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   ├── page.tsx          # Dashboard
│   │   ├── layout.tsx        # Root layout
│   │   └── providers.tsx     # React Query provider
│   ├── components/           # React components
│   ├── lib/
│   │   ├── prisma.ts         # Prisma client
│   │   ├── analyzeTweet.ts   # LLM analysis
│   │   ├── apify.ts          # Apify client
│   │   ├── queue.ts          # BullMQ workers
│   │   └── redis.ts          # Redis client
│   └── types/                # TypeScript types
├── prisma/
│   └── schema.prisma         # Database schema
├── TODO.md                   # Development roadmap
└── .env.local                # Environment variables
```

## Database Schema

- **twitter_lists** - Twitter lists to scrape (name, URL, active status, last scraped time)
- **users** - Twitter users being tracked
- **tweets** - Raw tweet data
- **tweet_analysis** - AI analysis results
- **token_mentions** - Extracted token mentions
- **project_mentions** - Extracted project mentions
- **narrative_tags** - Extracted narrative themes

## Development Roadmap

See [TODO.md](./TODO.md) for the complete development roadmap including:
- Phase 1: MVP (2-3 weeks)
- Phase 2: Enhanced Analytics (2-3 weeks)
- Phase 3: Intelligence Features (2-3 weeks)

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

Note: You'll need to host PostgreSQL and Redis separately (e.g., Railway, Render, or AWS).

### Background Workers

For production, run workers as a separate process:
```bash
npm run worker
```

Consider using a process manager like PM2 or deploying workers to a separate service.

## License

MIT

## Documentation

- **[QUICK_START.md](./QUICK_START.md)** - 5-minute setup guide
- **[SETUP_LOCAL.md](./SETUP_LOCAL.md)** - Detailed local installation instructions
- **[SWITCH_TO_OPENAI.md](./SWITCH_TO_OPENAI.md)** - How to switch from Anthropic to OpenAI
- **[APIFY_INTEGRATION.md](./APIFY_INTEGRATION.md)** - Apify integration technical details
- **[FINAL_SETUP.md](./FINAL_SETUP.md)** - Complete setup guide
- **[TODO.md](./TODO.md)** - Development roadmap

## Support

For issues and questions, please check the documentation files above or create an issue in the repository.
