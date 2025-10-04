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

    const sentiments = await prisma.tweetAnalysis.groupBy({
      by: ['sentiment'],
      where: {
        analyzedAt: {
          gte: startDate,
        },
      },
      _count: {
        id: true,
      },
    });

    const result = {
      bullish: 0,
      neutral: 0,
      bearish: 0,
    };

    sentiments.forEach((s) => {
      if (s.sentiment === 'bullish') result.bullish = s._count.id;
      else if (s.sentiment === 'neutral') result.neutral = s._count.id;
      else if (s.sentiment === 'bearish') result.bearish = s._count.id;
    });

    return NextResponse.json({ sentiment: result, timeRange });
  } catch (error) {
    console.error('Error fetching sentiment stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sentiment stats' },
      { status: 500 }
    );
  }
}
