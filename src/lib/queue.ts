import { Queue, Worker } from 'bullmq';
import { redis } from './redis';
import { scrapeTweetsFromList } from './apify';
import { analyzeTweet } from './analyzeTweet';
import { prisma } from './prisma';

// Create queues
export const scrapeQueue = new Queue('scrape-tweets', {
  connection: redis,
});

export const analyzeQueue = new Queue('analyze-tweets', {
  connection: redis,
});

// Scrape worker
export const scrapeWorker = new Worker(
  'scrape-tweets',
  async (job) => {
    const { listUrl } = job.data;

    console.log(`Starting scrape for list: ${listUrl}`);
    const tweets = await scrapeTweetsFromList(listUrl);

    console.log(`Scraped ${tweets.length} tweets`);

    for (const tweet of tweets) {
      // Check if tweet already exists
      const existing = await prisma.tweet.findUnique({
        where: { tweetId: tweet.id },
      });

      if (existing) {
        console.log(`Tweet ${tweet.id} already exists, skipping`);
        continue;
      }

      // Create or update user
      const user = await prisma.user.upsert({
        where: { twitterHandle: tweet.author.userName },
        update: {
          displayName: tweet.author.name,
          followerCount: tweet.author.followers,
          bio: tweet.author.description,
          profileImageUrl: tweet.author.profilePicture,
        },
        create: {
          twitterHandle: tweet.author.userName,
          displayName: tweet.author.name,
          followerCount: tweet.author.followers,
          bio: tweet.author.description,
          profileImageUrl: tweet.author.profilePicture,
        },
      });

      // Create tweet
      const newTweet = await prisma.tweet.create({
        data: {
          tweetId: tweet.id,
          userId: user.id,
          tweetText: tweet.text,
          tweetUrl: tweet.url,
          createdAt: new Date(tweet.createdAt),
          likesCount: tweet.likeCount,
          retweetsCount: tweet.retweetCount,
          repliesCount: tweet.replyCount,
        },
      });

      // Queue for analysis
      await analyzeQueue.add('analyze', { tweetId: newTweet.id });
    }

    return { processed: tweets.length };
  },
  {
    connection: redis,
    concurrency: 1,
  }
);

// Analyze worker
export const analyzeWorker = new Worker(
  'analyze-tweets',
  async (job) => {
    const { tweetId } = job.data;

    const tweet = await prisma.tweet.findUnique({
      where: { id: tweetId },
    });

    if (!tweet) {
      throw new Error(`Tweet ${tweetId} not found`);
    }

    // Check if already analyzed
    const existing = await prisma.tweetAnalysis.findUnique({
      where: { tweetId: tweet.id },
    });

    if (existing) {
      console.log(`Tweet ${tweet.id} already analyzed, skipping`);
      return;
    }

    console.log(`Analyzing tweet ${tweet.id}`);
    const analysis = await analyzeTweet(tweet.tweetText);

    // Save analysis
    await prisma.tweetAnalysis.create({
      data: {
        tweetId: tweet.id,
        primaryCategory: analysis.category,
        sentiment: analysis.sentiment,
        confidenceScore: analysis.confidenceScore,
        summary: analysis.summary,
      },
    });

    // Save token mentions
    for (const token of analysis.tokens) {
      await prisma.tokenMention.create({
        data: {
          tweetId: tweet.id,
          tokenTicker: token.ticker,
          tokenName: token.name,
          mentionContext: token.context,
        },
      });
    }

    // Save project mentions
    for (const project of analysis.projects) {
      await prisma.projectMention.create({
        data: {
          tweetId: tweet.id,
          projectName: project.name,
          mentionContext: project.context,
        },
      });
    }

    // Save narrative tags
    for (const narrative of analysis.narratives) {
      await prisma.narrativeTag.create({
        data: {
          tweetId: tweet.id,
          narrativeName: narrative.name,
          relevanceScore: narrative.relevance,
        },
      });
    }

    console.log(`Completed analysis for tweet ${tweet.id}`);
    return { success: true };
  },
  {
    connection: redis,
    concurrency: 3,
  }
);

// Error handlers
scrapeWorker.on('failed', (job, err) => {
  console.error(`Scrape job ${job?.id} failed:`, err);
});

analyzeWorker.on('failed', (job, err) => {
  console.error(`Analyze job ${job?.id} failed:`, err);
});
