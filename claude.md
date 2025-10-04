# Claude Development Guide for Alpha Stream Analytics

This document provides guidance for using Claude Code to continue development on the Alpha Stream Analytics project.

## Project Overview

Alpha Stream Analytics is a crypto Twitter intelligence platform that:
- Scrapes tweets from Twitter influencer lists using Apify
- Analyzes tweets using Claude AI for categorization, sentiment, and entity extraction
- Tracks token mentions, project discussions, and narrative trends
- Provides real-time analytics dashboard

## Architecture

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TailwindCSS, React Query
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL
- **AI**: Anthropic Claude 3.5 Sonnet
- **Scraping**: Apify Twitter Scraper
- **Queue**: BullMQ with Redis
- **TypeScript**: Strict mode enabled

### Project Structure
```
src/
├── app/
│   ├── api/              # API route handlers
│   ├── page.tsx          # Main dashboard
│   ├── layout.tsx        # Root layout
│   └── providers.tsx     # React Query provider
├── components/           # Reusable React components
├── lib/
│   ├── prisma.ts         # Prisma client singleton
│   ├── analyzeTweet.ts   # Claude AI analysis logic
│   ├── apify.ts          # Apify scraping client
│   ├── queue.ts          # BullMQ workers and queues
│   ├── redis.ts          # Redis client
│   └── utils.ts          # Utility functions
└── types/
    └── index.ts          # TypeScript type definitions
```

## Common Development Tasks

### Adding a New API Endpoint

1. Create new route file in `src/app/api/[route]/route.ts`
2. Follow this pattern:
```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const param = searchParams.get('param');

    const data = await prisma.model.findMany({ where: {} });

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
```

### Adding a New Dashboard Page

1. Create page in `src/app/[route]/page.tsx`
2. Use client-side data fetching with React Query:
```typescript
'use client';

import { useQuery } from '@tanstack/react-query';

export default function MyPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-data'],
    queryFn: async () => {
      const res = await fetch('/api/my-endpoint');
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return <div>{/* Your UI */}</div>;
}
```

### Modifying the Database Schema

1. Edit `prisma/schema.prisma`
2. Run migration:
```bash
npx prisma migrate dev --name description_of_change
npx prisma generate
```

### Adding a New Component

1. Create in `src/components/ComponentName.tsx`
2. Use TypeScript interfaces for props
3. Follow existing patterns (see `StatsCard.tsx`, `TweetCard.tsx`)

### Working with the Queue System

The queue system handles background jobs for scraping and analysis.

**To add a new job type:**
```typescript
// In lib/queue.ts

export const myQueue = new Queue('my-job', {
  connection: redis,
});

export const myWorker = new Worker(
  'my-job',
  async (job) => {
    const { data } = job.data;
    // Process job
    return { success: true };
  },
  {
    connection: redis,
    concurrency: 1,
  }
);
```

**To trigger a job:**
```typescript
await myQueue.add('job-name', { data: 'payload' });
```

### Modifying AI Analysis

The LLM analysis is in `src/lib/analyzeTweet.ts`. To modify:

1. Update the `ANALYSIS_PROMPT` to change what's extracted
2. Update the `TweetAnalysisResult` type in `src/types/index.ts`
3. Update the worker in `lib/queue.ts` to handle new fields
4. Update the database schema if adding new tables

## Testing Workflow

### Testing the Complete Pipeline

1. Start all services:
```bash
# Terminal 1
redis-server

# Terminal 2
npm run worker

# Terminal 3
npm run dev
```

2. Open dashboard at `http://localhost:3000`
3. Click "Trigger Scrape" to test the pipeline
4. Monitor worker logs for errors
5. Check database with Prisma Studio:
```bash
npm run db:studio
```

### Manual Testing Individual Components

**Test Apify scraping:**
```typescript
import { scrapeTweetsFromList } from '@/lib/apify';
const tweets = await scrapeTweetsFromList('YOUR_LIST_URL');
console.log(tweets);
```

**Test AI analysis:**
```typescript
import { analyzeTweet } from '@/lib/analyzeTweet';
const result = await analyzeTweet('Sample crypto tweet about $BTC');
console.log(result);
```

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run worker           # Start background workers
npm run lint             # Lint code

# Database
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run migrations
npm run db:studio        # Open Prisma Studio

# Build & Deploy
npm run build            # Build for production
npm run start            # Start production server
```

## Environment Variables Reference

Required in `.env.local`:
```bash
# Database
DATABASE_URL="postgresql://..."

# Apify
APIFY_API_TOKEN="..."
TWITTER_LIST_URL="https://twitter.com/i/lists/..."

# AI
ANTHROPIC_API_KEY="..."

# Redis
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""  # Optional

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
SCRAPE_INTERVAL_MINUTES="30"
```

## Debugging Tips

### Database Issues
- Use `npm run db:studio` to inspect data visually
- Check migration status: `npx prisma migrate status`
- Reset database: `npx prisma migrate reset` (⚠️ deletes all data)

### Queue/Worker Issues
- Check Redis connection: `redis-cli ping`
- View queue in BullBoard (add if needed)
- Check worker logs for errors

### API Issues
- Use browser DevTools Network tab
- Check API route logs in terminal
- Test with curl: `curl http://localhost:3000/api/stats/overview`

### TypeScript Errors
- Regenerate Prisma types: `npx prisma generate`
- Restart TypeScript server in VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"

## Development Roadmap

See `TODO.md` for the complete 3-phase development plan:
- **Phase 1 (MVP)**: Core scraping, analysis, and dashboard - ~3 weeks
- **Phase 2 (Enhanced Analytics)**: Advanced filtering, search, narratives - ~3 weeks
- **Phase 3 (Intelligence Features)**: Alerts, watchlists, AI reports - ~3 weeks

## Best Practices

### Code Style
- Use TypeScript strictly (no `any` types)
- Follow existing naming conventions
- Add error handling to all async operations
- Log errors comprehensively

### Performance
- Use database indexes for frequently queried fields
- Implement pagination for large datasets
- Cache expensive computations with React Query
- Use `refetchInterval` wisely to avoid excessive API calls

### Security
- Never commit `.env.local` to git
- Validate all API inputs
- Use Prisma parameterized queries (prevents SQL injection)
- Rate limit API endpoints in production

## Useful Claude Prompts

When working with Claude Code, use these prompts:

### Building Features
```
"Create a new page at /app/tokens/page.tsx that shows a detailed view of all token mentions with:
- Token ticker and name
- Total mention count
- 7-day trend chart
- Top users mentioning each token
- Recent tweets mentioning the token"
```

### Debugging
```
"I'm getting this error: [paste error]. Help me debug it."
```

### Refactoring
```
"Refactor the TweetCard component to improve performance by memoizing expensive computations"
```

### Database Changes
```
"Add a new 'alerts' table to the schema with columns for user_id, alert_type, conditions (JSON), and is_active. Include proper relationships and indexes."
```

### API Development
```
"Create a new API endpoint at /api/narratives/trending that:
1. Groups narrative tags by name
2. Counts mentions in last 24h
3. Compares to previous 24h to show momentum
4. Returns top 20 trending narratives"
```

## Quick Reference: Key Files

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Main dashboard UI |
| `src/lib/queue.ts` | Background job workers |
| `src/lib/analyzeTweet.ts` | AI analysis logic |
| `prisma/schema.prisma` | Database schema |
| `src/types/index.ts` | TypeScript types |
| `TODO.md` | Development roadmap |

## Getting Help

1. Check `TODO.md` for planned features
2. Review existing code patterns in similar files
3. Check Prisma docs: https://www.prisma.io/docs
4. Check Next.js docs: https://nextjs.org/docs
5. Check BullMQ docs: https://docs.bullmq.io

## Notes

- The project uses Next.js App Router (not Pages Router)
- All frontend components should be marked `'use client'` if using hooks
- Database queries should use Prisma Client
- Background jobs run in separate worker process
- TypeScript is configured in strict mode
