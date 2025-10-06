# Manual Tweet Import Guide

Since Apify requires payment, you can use this manual workflow to import tweet data for development without API calls.

## Quick Start

```bash
npm run import
```

Then paste your JSON data and press `Ctrl+D` (Mac/Linux) or `Ctrl+Z` (Windows) when done.

---

## Step-by-Step Instructions

### 1. Get Tweet Data from Apify Console

1. Go to **https://console.apify.com/actors**
2. Find the **Twitter List Scraper** actor (ID: `mAxIirfenUcKwNXST`)
3. Click **"Try for free"** or **"Start"**
4. Configure the scraper:
   ```json
   {
     "startUrls": ["https://twitter.com/i/lists/YOUR_LIST_ID"],
     "listIds": ["YOUR_LIST_ID"],
     "maxItems": 100
   }
   ```
5. Click **"Start"**
6. Wait for the run to complete (usually 1-3 minutes)

### 2. Export the Results

1. Once complete, click **"Export results"**
2. Choose **"JSON"** format
3. Click **"Download"** or copy the JSON from the preview

The JSON should look like this:
```json
[
  {
    "id": "1234567890",
    "text": "This is a sample tweet about $BTC",
    "url": "https://twitter.com/user/status/1234567890",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "likeCount": 42,
    "retweetCount": 10,
    "replyCount": 5,
    "author": {
      "userName": "cryptotrader",
      "name": "Crypto Trader",
      "followers": 10000,
      "description": "Trading crypto since 2017",
      "profilePicture": "https://..."
    }
  }
]
```

### 3. Import into Your App

**Option A: Interactive CLI (Recommended)**

```bash
npm run import
```

Then paste the entire JSON array and press:
- **Mac/Linux**: `Ctrl+D`
- **Windows**: `Ctrl+Z` then `Enter`

The tool will:
- ✅ Parse the JSON
- ✅ Create/update users
- ✅ Import tweets (skipping duplicates)
- ✅ Queue each tweet for AI analysis
- ✅ Show progress in real-time

**Option B: From File**

```bash
# Save your JSON to a file
cat apify-export.json | npm run import
```

**Option C: Direct Paste**

```bash
npm run import << 'EOF'
[
  {"id": "123", "text": "...", ...},
  {"id": "456", "text": "...", ...}
]
EOF
```

### 4. Verify Import

Check the output:
```
🎉 Import complete!
   ✅ Imported: 50 tweets
   ⏭️  Skipped: 5 duplicates
   🤖 Queued for AI analysis: 50 tweets

💡 The analyze worker will process these tweets in the background.
   Check your dashboard in a few minutes to see results!
```

Then open your dashboard:
```bash
# Make sure worker is running
npm run worker

# In another terminal
npm run dev

# Open http://localhost:3000
```

---

## What the Import Tool Does

1. **Parses JSON** - Validates the Apify export format
2. **Creates Users** - Upserts Twitter users (creates if new, updates if exists)
3. **Imports Tweets** - Creates tweet records (skips duplicates automatically)
4. **Queues Analysis** - Sends each tweet to the analyze worker for AI processing
5. **Shows Progress** - Real-time feedback on import status

---

## Common Issues

### "JSON must be an array of tweets"

Make sure you copied the entire array, including the opening `[` and closing `]`:
```json
[
  {...},
  {...}
]
```

Not just the objects:
```json
{...},
{...}
```

### "Skipped duplicate" for all tweets

This means those tweets are already in your database. This is normal and safe!

To start fresh:
```bash
npx prisma migrate reset
npx prisma migrate dev
```

### "Error importing tweet"

Check the error message. Common causes:
- Missing required fields in JSON
- Invalid date format
- Database connection issues

---

## Example Workflow

```bash
# Terminal 1: Start the worker
npm run worker

# Terminal 2: Start the dev server
npm run dev

# Terminal 3: Import tweets
npm run import
# Paste JSON, then Ctrl+D

# Wait 1-2 minutes for analysis to complete
# Then refresh http://localhost:3000 to see results
```

---

## Apify Free Tier

If you want to test with Apify's free tier:

- **Free credits**: $5/month
- **Cost per 1000 tweets**: ~$0.30
- **Free usage**: ~16,000 tweets/month

To use free credits:
1. Sign up at https://apify.com
2. Get your API token from Settings → Integrations
3. Add to `.env.local`:
   ```env
   APIFY_API_TOKEN="apify_api_YOUR_TOKEN_HERE"
   ```
4. The app will automatically use the API instead of manual import

---

## Switching Back to API Mode

Once you have Apify credits, the app will automatically use the API:

1. Add `APIFY_API_TOKEN` to `.env.local`
2. Restart the worker
3. Use the dashboard "Scrape Now" button

No code changes needed - the app detects the token and uses the API automatically!

---

## Tips

- **Import in batches**: Don't try to import 1000s of tweets at once. Start with 50-100.
- **Run worker first**: Make sure `npm run worker` is running before importing
- **Wait for analysis**: AI analysis takes ~1 second per tweet. Be patient!
- **Check Prisma Studio**: Use `npx prisma studio` to view imported data
- **Re-import is safe**: The tool automatically skips duplicates

---

## Sample JSON for Testing

If you just want to test the import process, here's a minimal example:

```json
[
  {
    "id": "1234567890",
    "text": "Just bought some $BTC at $45k. Looking bullish! 🚀",
    "url": "https://twitter.com/cryptotrader/status/1234567890",
    "createdAt": "2024-01-15T14:30:00.000Z",
    "likeCount": 42,
    "retweetCount": 10,
    "replyCount": 5,
    "author": {
      "userName": "cryptotrader",
      "name": "Crypto Trader Pro",
      "followers": 50000,
      "description": "Professional crypto trader. Not financial advice.",
      "profilePicture": "https://pbs.twimg.com/profile_images/123/avatar.jpg"
    }
  }
]
```

Save this to `test-data.json` and run:
```bash
cat test-data.json | npm run import
```
