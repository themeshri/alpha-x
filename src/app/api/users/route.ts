import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'tweetCount';

    const users = await prisma.user.findMany({
      take: limit,
      skip: offset,
      include: {
        _count: {
          select: { tweets: true },
        },
        tweets: {
          select: {
            likesCount: true,
            retweetsCount: true,
          },
        },
      },
    });

    const usersWithStats = users.map((user) => {
      const avgLikes =
        user.tweets.reduce((sum, t) => sum + t.likesCount, 0) /
          user.tweets.length || 0;
      const avgRetweets =
        user.tweets.reduce((sum, t) => sum + t.retweetsCount, 0) /
          user.tweets.length || 0;

      return {
        id: user.id,
        twitterHandle: user.twitterHandle,
        displayName: user.displayName,
        followerCount: user.followerCount,
        profileImageUrl: user.profileImageUrl,
        tweetCount: user._count.tweets,
        avgLikes: Math.round(avgLikes),
        avgRetweets: Math.round(avgRetweets),
      };
    });

    // Sort
    if (sortBy === 'tweetCount') {
      usersWithStats.sort((a, b) => b.tweetCount - a.tweetCount);
    } else if (sortBy === 'engagement') {
      usersWithStats.sort(
        (a, b) => b.avgLikes + b.avgRetweets - (a.avgLikes + a.avgRetweets)
      );
    }

    return NextResponse.json({ users: usersWithStats });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
