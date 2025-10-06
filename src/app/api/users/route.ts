import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'tweetCount';
    const listId = searchParams.get('listId');

    // Build where clause for filtering tweets by list
    const tweetWhere = listId ? { listId } : {};

    // Build user where clause
    const userWhereClause = listId
      ? {
          tweets: {
            some: { listId },
          },
        }
      : {};

    // Fetch users with tweet count in single query, filtered by list
    const users = await prisma.user.findMany({
      where: userWhereClause,
      take: limit,
      skip: offset,
      include: {
        _count: {
          select: { tweets: tweetWhere },
        },
      },
    });

    // Get engagement stats in one aggregated query (no N+1)
    const userIds = users.map((u) => u.id);
    const engagementStats = await prisma.tweet.groupBy({
      by: ['userId'],
      where: { userId: { in: userIds }, ...tweetWhere },
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

    // Get token mentions for each user (removed - no longer needed)
    // const tokenMentions = await prisma.tokenMention.groupBy({
    //   by: ['tokenTicker'],
    //   where: {
    //     tweet: {
    //       userId: { in: userIds },
    //     },
    //   },
    //   _count: {
    //     id: true,
    //   },
    // });

    // Get detailed token mentions per user
    const userTokens = listId
      ? await prisma.$queryRaw<Array<{
          userId: string;
          tokenTicker: string;
          count: bigint;
        }>>`
          SELECT t."userId", tm."tokenTicker", COUNT(tm.id)::int as count
          FROM token_mentions tm
          JOIN tweets t ON tm."tweetId" = t.id
          WHERE t."userId" = ANY(${userIds}::text[]) AND t."listId" = ${listId}
          GROUP BY t."userId", tm."tokenTicker"
          ORDER BY count DESC
        `
      : await prisma.$queryRaw<Array<{
          userId: string;
          tokenTicker: string;
          count: bigint;
        }>>`
          SELECT t."userId", tm."tokenTicker", COUNT(tm.id)::int as count
          FROM token_mentions tm
          JOIN tweets t ON tm."tweetId" = t.id
          WHERE t."userId" = ANY(${userIds}::text[])
          GROUP BY t."userId", tm."tokenTicker"
          ORDER BY count DESC
        `;

    // Create token map per user
    const userTokenMap = new Map<string, Array<{ ticker: string; count: number }>>();
    userTokens.forEach((item) => {
      const userId = item.userId;
      const ticker = item.tokenTicker;
      const count = Number(item.count);

      if (!userTokenMap.has(userId)) {
        userTokenMap.set(userId, []);
      }
      userTokenMap.get(userId)!.push({ ticker, count });
    });

    const usersWithStats = users.map((user) => ({
      id: user.id,
      twitterHandle: user.twitterHandle,
      displayName: user.displayName,
      followerCount: user.followerCount,
      profileImageUrl: user.profileImageUrl,
      tweetCount: user._count.tweets,
      avgLikes: statsMap[user.id]?.avgLikes || 0,
      avgRetweets: statsMap[user.id]?.avgRetweets || 0,
      topTokens: (userTokenMap.get(user.id) || []).slice(0, 5), // Top 5 tokens
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
