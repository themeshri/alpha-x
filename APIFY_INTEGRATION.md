# Apify Integration Update

## What Changed

The app now uses the correct **Twitter List Scraper** actor (`mAxIirfenUcKwNXST`) from Apify and includes a database-backed system for managing multiple Twitter lists.

### Key Updates:

1. **Correct Apify Actor** - Now using `mAxIirfenUcKwNXST` (Twitter List Scraper)
2. **List Management UI** - Add, view, edit, and delete Twitter lists via the web interface
3. **Database Storage** - Lists are stored in PostgreSQL for future use
4. **Multiple Lists Support** - Scrape multiple lists at once
5. **Auto List ID Extraction** - Automatically extracts list ID from URL

---

## New Database Table

Added `twitter_lists` table to store your Twitter lists:

```prisma
model TwitterList {
  id          String   @id @default(cuid())
  name        String
  listUrl     String   @unique
  listId      String   @unique
  description String?
  isActive    Boolean  @default(true)
  lastScraped DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## Running the Migration

After pulling these changes, run:

```bash
# Generate Prisma client with new model
npx prisma generate

# Create and apply the migration
npx prisma migrate dev --name add_twitter_lists

# Restart workers to pick up changes
# Ctrl+C to stop, then:
npm run worker
```

---

## How to Use

### 1. Access Lists Management

Navigate to: **http://localhost:3000/lists**

Or click the **"Lists"** button in the header.

### 2. Add a Twitter List

Click **"+ Add Twitter List"** and fill in:

- **List Name**: A friendly name (e.g., "Crypto Influencers")
- **List URL**: The full Twitter list URL
- **Description**: Optional notes about the list

**Supported URL formats:**
```
https://twitter.com/i/lists/78783491
https://x.com/i/lists/1657850814910590977
```

The app will automatically extract the list ID (the number at the end).

### 3. Manage Lists

From the Lists page, you can:

- **Toggle Active/Inactive** - Click the status badge
- **Scrape Now** - Start scraping a specific list immediately
- **Scrape All** - Scrape all active lists at once
- **Delete** - Remove a list permanently
- **View on Twitter** - Click the link to see the list

### 4. Automated Scraping

The cron job now automatically scrapes **all active lists** every 30 minutes.

To change the interval, update `.env.local`:
```env
SCRAPE_INTERVAL_MINUTES="15"  # Change to your preferred interval
```

---

## API Changes

### Scrape Endpoint - New Options

**POST** `/api/scrape`

Now supports 3 modes:

#### 1. Scrape all active lists:
```json
{
  "scrapeAll": true
}
```

#### 2. Scrape specific list by ID:
```json
{
  "listId": "clx123abc..."
}
```

#### 3. Scrape one-time URL (not saved):
```json
{
  "listUrl": "https://twitter.com/i/lists/78783491"
}
```

### New List Management Endpoints

#### Get all lists:
```bash
GET /api/lists
```

#### Add new list:
```bash
POST /api/lists
Content-Type: application/json

{
  "name": "My Crypto List",
  "listUrl": "https://twitter.com/i/lists/1234567890",
  "description": "Top crypto traders"
}
```

#### Update list:
```bash
PATCH /api/lists/:id
Content-Type: application/json

{
  "isActive": false,
  "name": "Updated name"
}
```

#### Delete list:
```bash
DELETE /api/lists/:id
```

---

## Apify Actor Details

### Cost

**$0.30 per 1000 tweets** - Very cost-effective!

### Performance

- Scrapes **30-80 tweets per second**
- Handles large lists efficiently
- Supports up to 1000 items per run (configurable)

### Features Used

```javascript
{
  startUrls: ["https://twitter.com/i/lists/78783491"],
  listIds: ["78783491"],
  maxItems: 100,
  customMapFunction: null
}
```

---

## Environment Variables

**No longer required** but still supported:

```env
# Optional: For backward compatibility
TWITTER_LIST_URL="https://twitter.com/i/lists/YOUR_LIST_ID"
```

**Recommended approach:** Add lists via the UI instead!

---

## Migration Path

### If you had TWITTER_LIST_URL in .env.local:

1. Go to **http://localhost:3000/lists**
2. Click **"+ Add Twitter List"**
3. Add your existing list with a name
4. Remove `TWITTER_LIST_URL` from `.env.local` (optional)

### Starting fresh:

1. Run the migration (see above)
2. Add your first list via the UI
3. Click "Scrape Now" to test
4. Enable auto-scraping by keeping it active

---

## Code Changes Summary

### Files Updated:

- `src/lib/apify.ts` - Now uses correct actor `mAxIirfenUcKwNXST`
- `src/lib/cron.ts` - Scrapes all active lists automatically
- `src/lib/queue.ts` - Handles multiple lists
- `prisma/schema.prisma` - Added TwitterList model

### Files Created:

- `src/app/lists/page.tsx` - List management UI
- `src/app/api/lists/route.ts` - List CRUD operations
- `src/app/api/lists/[id]/route.ts` - Individual list operations
- `src/app/api/scrape/route.ts` - Updated scraping logic

---

## Troubleshooting

### "No active Twitter lists found"

You need to add at least one list:
1. Go to `/lists`
2. Click "+ Add Twitter List"
3. Make sure it's marked as "Active"

### "Invalid Twitter list URL"

Make sure your URL follows this format:
```
https://twitter.com/i/lists/NUMBERS_ONLY
```

The app extracts the numbers at the end.

### Lists not scraping automatically

1. Check worker logs for errors
2. Verify at least one list is marked as "Active"
3. Check `SCRAPE_INTERVAL_MINUTES` in `.env.local`

### Apify errors

1. Verify `APIFY_API_TOKEN` is correct in `.env.local`
2. Check your Apify account has sufficient credits
3. Review worker logs for specific error messages

---

## Testing Your Setup

1. Add a test list with a small number of tweets
2. Click "Scrape Now"
3. Monitor worker terminal for progress
4. Check dashboard after 1-2 minutes
5. Verify tweets appear in the UI

---

## Best Practices

1. **Use descriptive names** for your lists
2. **Add descriptions** to remember why you're tracking each list
3. **Set inactive** instead of deleting lists you want to pause
4. **Start with smaller maxItems** (100) for testing
5. **Monitor Apify costs** if scraping frequently

---

## Future Enhancements

Possible additions based on this foundation:

- **Schedule different intervals** per list
- **Set custom maxItems** per list
- **Track scraping statistics** (tweets/day, cost estimates)
- **Import/export** list configurations
- **Duplicate detection** across lists
- **List groups** or tags for organization
