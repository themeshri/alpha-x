import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const resolvedParams = await params;
    const ticker = decodeURIComponent(resolvedParams.ticker).toUpperCase();

    // Get all token mentions for this ticker
    const mentions = await prisma.tokenMention.findMany({
      where: {
        tokenTicker: ticker,
      },
      include: {
        tweet: {
          include: {
            user: true,
            analysis: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit to 50 tweets
    });

    const tweets = mentions.map((mention) => ({
      id: mention.tweet.id,
      tweetId: mention.tweet.tweetId,
      tweetText: mention.tweet.tweetText,
      tweetUrl: mention.tweet.tweetUrl,
      mediaUrls: mention.tweet.mediaUrls,
      createdAt: mention.tweet.createdAt,
      likesCount: mention.tweet.likesCount,
      retweetsCount: mention.tweet.retweetsCount,
      repliesCount: mention.tweet.repliesCount,
      user: {
        id: mention.tweet.user.id,
        twitterHandle: mention.tweet.user.twitterHandle,
        displayName: mention.tweet.user.displayName,
        profileImageUrl: mention.tweet.user.profileImageUrl,
      },
      analysis: mention.tweet.analysis
        ? {
            category: mention.tweet.analysis.primaryCategory,
            summary: mention.tweet.analysis.summary,
          }
        : null,
      tokenMentions: [{ tokenTicker: ticker }],
    }));

    return NextResponse.json({ tweets, ticker });
  } catch (error) {
    console.error('Error fetching token tweets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token tweets' },
      { status: 500 }
    );
  }
}
