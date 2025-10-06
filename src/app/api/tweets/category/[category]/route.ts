import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('range') || '24h';
    const resolvedParams = await params;
    const category = decodeURIComponent(resolvedParams.category);

    const now = new Date();
    let startDate: Date | undefined = new Date();
    let endDate: Date | undefined;

    switch (timeRange) {
      case '15m':
        startDate.setMinutes(now.getMinutes() - 15);
        break;
      case '1h':
        startDate.setHours(now.getHours() - 1);
        break;
      case '6h':
        startDate.setHours(now.getHours() - 6);
        break;
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'older':
        // Tweets older than 24 hours
        endDate = new Date();
        endDate.setHours(now.getHours() - 24);
        startDate = undefined;
        break;
      case 'all':
        // All time - no date filter
        startDate = undefined;
        endDate = undefined;
        break;
    }

    // Build where clause
    const whereClause: any = {
      analysis: {
        primaryCategory: category,
      },
    };

    // Only add date filter if we have a startDate or endDate
    if (startDate || endDate) {
      whereClause.createdAt = {
        ...(startDate ? { gte: startDate } : {}),
        ...(endDate ? { lte: endDate } : {}),
      };
    }

    // Get tweets with this category
    const tweets = await prisma.tweet.findMany({
      where: whereClause,
      include: {
        user: true,
        analysis: true,
        tokenMentions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit to 50 tweets
    });

    const formattedTweets = tweets.map((tweet) => ({
      id: tweet.id,
      tweetId: tweet.tweetId,
      tweetText: tweet.tweetText,
      tweetUrl: tweet.tweetUrl,
      mediaUrls: tweet.mediaUrls,
      createdAt: tweet.createdAt,
      likesCount: tweet.likesCount,
      retweetsCount: tweet.retweetsCount,
      repliesCount: tweet.repliesCount,
      user: {
        id: tweet.user.id,
        twitterHandle: tweet.user.twitterHandle,
        displayName: tweet.user.displayName,
        profileImageUrl: tweet.user.profileImageUrl,
      },
      analysis: tweet.analysis
        ? {
            category: tweet.analysis.primaryCategory,
            summary: tweet.analysis.summary,
          }
        : null,
      tokenMentions: tweet.tokenMentions,
    }));

    return NextResponse.json({ tweets: formattedTweets, category, timeRange });
  } catch (error) {
    console.error('Error fetching category tweets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category tweets' },
      { status: 500 }
    );
  }
}
