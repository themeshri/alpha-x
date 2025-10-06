import { ApifyClient } from 'apify-client';
import type { ApifyTweetData } from '@/types';

let client: ApifyClient | null = null;

function getApifyClient(): ApifyClient {
  if (!client) {
    const token = process.env.APIFY_API_TOKEN;
    if (!token) {
      throw new Error('APIFY_API_TOKEN is not set. Please add it to .env.local');
    }
    client = new ApifyClient({ token });
  }
  return client;
}

/**
 * Extract list ID from Twitter list URL
 * Examples:
 * - https://twitter.com/i/lists/78783491 → "78783491"
 * - https://x.com/i/lists/1657850814910590977 → "1657850814910590977"
 */
function extractListId(listUrl: string): string {
  const match = listUrl.match(/\/lists\/(\d+)/);
  if (!match) {
    throw new Error(`Invalid Twitter list URL: ${listUrl}`);
  }
  return match[1];
}

export async function scrapeTweetsFromList(
  listUrl: string,
  maxItems: number = 100
): Promise<ApifyTweetData[]> {
  try {
    const apifyClient = getApifyClient();
    const listId = extractListId(listUrl);

    // Using the Twitter List Scraper actor (mAxIirfenUcKwNXST)
    const input = {
      startUrls: [listUrl],
      listIds: [listId],
      maxItems,
      customMapFunction: null, // Can be customized if needed
    };

    console.log(`Starting Apify scrape for list ${listId}...`);

    const run = await apifyClient.actor('mAxIirfenUcKwNXST').call(input);

    console.log(`Apify run completed. Fetching results...`);

    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

    console.log(`Retrieved ${items.length} tweets from Apify`);

    return items.map((item: any) => ({
      id: item.id,
      text: item.text || '',
      url: item.url || item.twitterUrl,
      createdAt: item.createdAt,
      likeCount: item.likeCount || 0,
      retweetCount: item.retweetCount || 0,
      replyCount: item.replyCount || 0,
      mediaUrls: item.media?.map((m: any) => m.url || m.photo || m.preview_image_url).filter(Boolean) ||
                 item.photos?.map((p: any) => p.url).filter(Boolean) ||
                 [],
      author: {
        userName: item.author?.userName || '',
        name: item.author?.name || '',
        followers: item.author?.followers || 0,
        description: item.author?.description || item.author?.bio,
        profilePicture: item.author?.profilePicture,
      },
    }));
  } catch (error) {
    console.error('Error scraping tweets from Apify:', error);
    throw error;
  }
}

export async function scrapeTweetsFromMultipleLists(
  listUrls: string[],
  maxItemsPerList: number = 100
): Promise<ApifyTweetData[]> {
  try {
    const apifyClient = getApifyClient();
    const listIds = listUrls.map(extractListId);

    const input = {
      startUrls: listUrls,
      listIds,
      maxItems: maxItemsPerList * listUrls.length,
      customMapFunction: null,
    };

    console.log(`Starting Apify scrape for ${listUrls.length} lists...`);

    const run = await apifyClient.actor('mAxIirfenUcKwNXST').call(input);

    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

    console.log(`Retrieved ${items.length} tweets from Apify`);

    return items.map((item: any) => ({
      id: item.id,
      text: item.text || '',
      url: item.url || item.twitterUrl,
      createdAt: item.createdAt,
      likeCount: item.likeCount || 0,
      retweetCount: item.retweetCount || 0,
      replyCount: item.replyCount || 0,
      mediaUrls: item.media?.map((m: any) => m.url || m.photo || m.preview_image_url).filter(Boolean) ||
                 item.photos?.map((p: any) => p.url).filter(Boolean) ||
                 [],
      author: {
        userName: item.author?.userName || '',
        name: item.author?.name || '',
        followers: item.author?.followers || 0,
        description: item.author?.description || item.author?.bio,
        profilePicture: item.author?.profilePicture,
      },
    }));
  } catch (error) {
    console.error('Error scraping tweets from multiple lists:', error);
    throw error;
  }
}
