import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('range') || '24h';
    const limit = parseInt(searchParams.get('limit') || '20');
    const listId = searchParams.get('listId');

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
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case 'older':
        // Tweets older than 24 hours
        endDate = new Date();
        endDate.setHours(now.getHours() - 24);
        startDate = undefined; // No start limit
        break;
    }

    // Build where clause for tweet filtering by list
    const tweetWhere = listId ? { listId } : {};

    const mentions = await prisma.tokenMention.groupBy({
      by: ['tokenTicker', 'tokenName'],
      where: {
        createdAt: {
          ...(startDate ? { gte: startDate } : {}),
          ...(endDate ? { lte: endDate } : {}),
        },
        tweet: tweetWhere,
      },
      _count: {
        tokenTicker: true,
      },
      orderBy: {
        _count: {
          tokenTicker: 'desc',
        },
      },
      take: limit,
    });

    const tokens = mentions.map((m) => ({
      ticker: m.tokenTicker,
      name: m.tokenName,
      mentionCount: m._count.tokenTicker,
    }));

    return NextResponse.json({ tokens, timeRange });
  } catch (error) {
    console.error('Error fetching trending tokens:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending tokens' },
      { status: 500 }
    );
  }
}
