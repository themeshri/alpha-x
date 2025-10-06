import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('range') || '24h';
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

    const categories = await prisma.tweetAnalysis.groupBy({
      by: ['primaryCategory'],
      where: {
        analyzedAt: {
          ...(startDate ? { gte: startDate } : {}),
          ...(endDate ? { lte: endDate } : {}),
        },
        tweet: tweetWhere,
      },
      _count: {
        primaryCategory: true,
      },
      orderBy: {
        _count: {
          primaryCategory: 'desc',
        },
      },
    });

    const result: Record<string, number> = {};
    categories.forEach((c) => {
      result[c.primaryCategory] = c._count.primaryCategory;
    });

    return NextResponse.json({ categories: result, timeRange });
  } catch (error) {
    console.error('Error fetching category stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category stats' },
      { status: 500 }
    );
  }
}
