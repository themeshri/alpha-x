import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'tweetCount';

    // Fetch users with tweet count in single query
    const users = await prisma.user.findMany({
      take: limit,
      skip: offset,
      include: {
        _count: {
          select: { tweets: true },
        },
      },
    });

    // Get engagement stats in one aggregated query (no N+1)
    const userIds = users.map((u) => u.id);
    const engagementStats = await prisma.tweet.groupBy({
      by: ['userId'],
      where: { userId: { in: userIds } },
      _avg: {
        likesCount: true,
        retweetsCount: true,
      },
    });

    // Create a map for O(1) lookup
    const statsMap = Object.fromEntries(
      engagementStats.map((s) => [
        s.userId,
        {
          avgLikes: Math.round(s._avg.likesCount || 0),
          avgRetweets: Math.round(s._avg.retweetsCount || 0),
        },
      ])
    );

    const usersWithStats = users.map((user) => ({
      id: user.id,
      twitterHandle: user.twitterHandle,
      displayName: user.displayName,
      followerCount: user.followerCount,
      profileImageUrl: user.profileImageUrl,
      tweetCount: user._count.tweets,
      avgLikes: statsMap[user.id]?.avgLikes || 0,
      avgRetweets: statsMap[user.id]?.avgRetweets || 0,
    }));

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
