/**
 * Twitter Syndication API helper
 * Unofficial API used by Twitter for embedding tweets on external sites
 * No authentication required
 */

interface SyndicationPhoto {
  url: string;
  width: number;
  height: number;
}

interface SyndicationResponse {
  id_str: string;
  text: string;
  photos?: SyndicationPhoto[];
  video?: {
    poster?: string;
    variants?: Array<{
      src: string;
      type: string;
    }>;
  };
}

/**
 * Fetch media URLs for a tweet using Twitter's Syndication API
 * @param tweetId - The numeric tweet ID
 * @returns Array of image URLs
 */
export async function fetchTweetMedia(tweetId: string): Promise<string[]> {
  try {
    const response = await fetch(
      `https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}&token=a`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AlphaStreamBot/1.0)',
        },
      }
    );

    if (!response.ok) {
      console.warn(`Syndication API returned ${response.status} for tweet ${tweetId}`);
      return [];
    }

    const data: SyndicationResponse = await response.json();

    // Extract photo URLs
    const mediaUrls: string[] = [];

    if (data.photos && data.photos.length > 0) {
      // Get high-quality image URLs
      const photoUrls = data.photos.map((photo) => {
        // Convert to high quality by replacing size parameter
        return photo.url.replace(/&name=\w+/, '&name=large');
      });
      mediaUrls.push(...photoUrls);
    }

    // Handle video thumbnails if no photos
    if (mediaUrls.length === 0 && data.video?.poster) {
      mediaUrls.push(data.video.poster);
    }

    return mediaUrls;
  } catch (error) {
    console.error(`Error fetching media for tweet ${tweetId}:`, error);
    return [];
  }
}

/**
 * Fetch media URLs for multiple tweets in parallel
 * @param tweetIds - Array of tweet IDs
 * @returns Map of tweetId -> mediaUrls
 */
export async function fetchMultipleTweetMedia(
  tweetIds: string[]
): Promise<Map<string, string[]>> {
  const results = await Promise.allSettled(
    tweetIds.map(async (id) => {
      const urls = await fetchTweetMedia(id);
      return { id, urls };
    })
  );

  const mediaMap = new Map<string, string[]>();

  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      mediaMap.set(result.value.id, result.value.urls);
    }
  });

  return mediaMap;
}
