import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('range') || '24h';

    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
    }

    const [totalTweets, totalUsers, analyzedTweets, totalTokenMentions] =
      await Promise.all([
        prisma.tweet.count({
          where: {
            createdAt: {
              gte: startDate,
            },
          },
        }),
        prisma.user.count(),
        prisma.tweetAnalysis.count({
          where: {
            analyzedAt: {
              gte: startDate,
            },
          },
        }),
        prisma.tokenMention.count({
          where: {
            createdAt: {
              gte: startDate,
            },
          },
        }),
      ]);

    return NextResponse.json({
      totalTweets,
      totalUsers,
      analyzedTweets,
      totalTokenMentions,
      timeRange,
    });
  } catch (error) {
    console.error('Error fetching overview stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch overview stats' },
      { status: 500 }
    );
  }
}
