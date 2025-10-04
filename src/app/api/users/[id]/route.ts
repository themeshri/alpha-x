import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        tweets: {
          include: {
            analysis: true,
            tokenMentions: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate stats
    const totalTweets = user.tweets.length;
    const avgLikes =
      user.tweets.reduce((sum, t) => sum + t.likesCount, 0) / totalTweets || 0;
    const avgRetweets =
      user.tweets.reduce((sum, t) => sum + t.retweetsCount, 0) / totalTweets || 0;

    // Category breakdown
    const categories: Record<string, number> = {};
    user.tweets.forEach((tweet) => {
      if (tweet.analysis) {
        categories[tweet.analysis.primaryCategory] =
          (categories[tweet.analysis.primaryCategory] || 0) + 1;
      }
    });

    // Top tokens
    const tokenCounts: Record<string, number> = {};
    user.tweets.forEach((tweet) => {
      tweet.tokenMentions.forEach((mention) => {
        tokenCounts[mention.tokenTicker] =
          (tokenCounts[mention.tokenTicker] || 0) + 1;
      });
    });

    const topTokens = Object.entries(tokenCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([ticker, count]) => ({ ticker, count }));

    return NextResponse.json({
      user: {
        id: user.id,
        twitterHandle: user.twitterHandle,
        displayName: user.displayName,
        followerCount: user.followerCount,
        bio: user.bio,
        profileImageUrl: user.profileImageUrl,
      },
      stats: {
        totalTweets,
        avgLikes: Math.round(avgLikes),
        avgRetweets: Math.round(avgRetweets),
      },
      categories,
      topTokens,
      recentTweets: user.tweets.slice(0, 10),
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
