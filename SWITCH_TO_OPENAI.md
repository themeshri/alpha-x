# How to Switch from Anthropic to OpenAI

## Option 1: Quick Switch (Recommended)

### Step 1: Install OpenAI SDK
```bash
npm install openai
```

### Step 2: Update Environment Variables

Edit `.env.local` and replace Anthropic key with OpenAI key:

```env
# Comment out or remove Anthropic key
# ANTHROPIC_API_KEY="sk-ant-api03-..."

# Add OpenAI key
OPENAI_API_KEY="sk-proj-..."
```

Get your OpenAI API key from: https://platform.openai.com/api-keys

### Step 3: Update the analyzer file

**Note**: The current `src/lib/analyzeTweet.ts` already uses OpenAI with lazy initialization pattern. This prevents environment variable loading issues.

**Current implementation** (already in place):

```typescript
import OpenAI from 'openai';
import type { TweetAnalysisResult } from '@/types';

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

export async function analyzeTweet(tweetText: string): Promise<TweetAnalysisResult> {
  const openai = getOpenAIClient(); // Lazy initialization
  // ... rest of implementation
}
```

**Why lazy initialization?**
- Prevents OpenAI client from being instantiated before environment variables are loaded
- Critical for worker scripts that use `dotenv` to load `.env.local`
- Ensures API key is available when client is created

### Step 4: Restart Workers

```bash
# Stop current workers (Ctrl+C)
# Then restart:
npm run worker
```

That's it! The app will now use OpenAI instead of Anthropic.

---

## Option 2: Keep Both and Toggle

If you want to easily switch between Anthropic and OpenAI:

### Step 1: Create a unified analyzer

Create `src/lib/analyzeTweet.ts`:

```typescript
import type { TweetAnalysisResult } from '@/types';

const AI_PROVIDER = process.env.AI_PROVIDER || 'openai'; // or 'anthropic'

export async function analyzeTweet(tweetText: string): Promise<TweetAnalysisResult> {
  if (AI_PROVIDER === 'anthropic') {
    const { analyzeTweet: anthropicAnalyze } = await import('./analyzeTweetAnthropic');
    return anthropicAnalyze(tweetText);
  } else {
    const { analyzeTweet: openaiAnalyze } = await import('./analyzeTweetOpenAI');
    return openaiAnalyze(tweetText);
  }
}
```

### Step 2: Rename existing files

```bash
# Rename current Anthropic version
mv src/lib/analyzeTweet.ts src/lib/analyzeTweetAnthropic.ts
```

### Step 3: Update .env.local

```env
# Choose provider: 'openai' or 'anthropic'
AI_PROVIDER="openai"

# Keep both keys available
OPENAI_API_KEY="sk-proj-..."
ANTHROPIC_API_KEY="sk-ant-api03-..."
```

---

## Cost Comparison

### OpenAI Pricing (as of 2024):

**GPT-4 Turbo:**
- Input: $10 per 1M tokens
- Output: $30 per 1M tokens

**GPT-3.5 Turbo (cheaper):**
- Input: $0.50 per 1M tokens
- Output: $1.50 per 1M tokens

### Anthropic Pricing:

**Claude 3.5 Sonnet:**
- Input: $3 per 1M tokens
- Output: $15 per 1M tokens

**Claude 3 Haiku (cheaper):**
- Input: $0.25 per 1M tokens
- Output: $1.25 per 1M tokens

### Recommendation:

- **Best Quality**: GPT-4 Turbo or Claude 3.5 Sonnet
- **Best Price/Performance**: GPT-3.5 Turbo or Claude 3 Haiku
- **Most Cost-Effective**: GPT-3.5 Turbo ($0.50/1M vs $3/1M)

---

## Model Selection Guide

### For OpenAI:

Edit `src/lib/analyzeTweet.ts` and change the model:

```typescript
const completion = await openai.chat.completions.create({
  model: 'gpt-4-turbo-preview', // Change this line
  // Options:
  // 'gpt-4-turbo-preview' - Best quality, expensive
  // 'gpt-4' - High quality, very expensive
  // 'gpt-3.5-turbo' - Good quality, cheap (recommended)
  ...
});
```

### For Anthropic:

Edit `src/lib/analyzeTweet.ts` and change the model:

```typescript
const message = await anthropic.messages.create({
  model: 'claude-3-haiku-20240307', // Change this line
  // Options:
  // 'claude-3-5-sonnet-20241022' - Best quality (current)
  // 'claude-3-opus-20240229' - Highest quality, most expensive
  // 'claude-3-sonnet-20240229' - Balanced
  // 'claude-3-haiku-20240307' - Fast and cheap
  ...
});
```

---

## Testing Your Setup

### Test with a sample tweet:

```bash
# Start Node REPL
node

# Paste this code:
```

```javascript
const { analyzeTweet } = require('./src/lib/analyzeTweet.ts');

const testTweet = "$BTC looking strong at $45k! Time to accumulate before the next bull run 🚀";

analyzeTweet(testTweet).then(result => {
  console.log(JSON.stringify(result, null, 2));
}).catch(err => {
  console.error('Error:', err);
});
```

### Expected output:
```json
{
  "category": "token_mention",
  "tokens": [
    {
      "ticker": "BTC",
      "name": "Bitcoin",
      "context": "price discussion"
    }
  ],
  "projects": [],
  "narratives": [
    {
      "name": "Bull Run",
      "relevance": 0.8
    }
  ],
  "sentiment": "bullish",
  "urgency": "timely",
  "summary": "Bullish on Bitcoin at current price levels",
  "confidenceScore": 0.9
}
```

---

## Troubleshooting

### "Invalid API Key" error:

1. Check your API key is correct in `.env.local`
2. Make sure there are no extra spaces
3. Verify the key works: https://platform.openai.com/playground

### "Rate limit exceeded":

OpenAI has rate limits on free tier:
- GPT-3.5: 3 requests/minute
- GPT-4: 10,000 tokens/minute

Solution: Reduce `SCRAPE_INTERVAL_MINUTES` or upgrade your OpenAI plan.

### Different results quality:

GPT-3.5 vs GPT-4 will produce different quality results. If you're getting poor categorization:

1. Try GPT-4 Turbo for better accuracy
2. Or adjust the prompt in `analyzeTweetOpenAI.ts`
3. Or increase temperature for more creativity (current: 0.3)

---

## Reverting to Anthropic

If you want to go back:

```bash
# Restore backup
cp src/lib/analyzeTweet.anthropic.backup.ts src/lib/analyzeTweet.ts

# Update .env.local
# Comment out: OPENAI_API_KEY
# Uncomment: ANTHROPIC_API_KEY

# Restart workers
npm run worker
```
