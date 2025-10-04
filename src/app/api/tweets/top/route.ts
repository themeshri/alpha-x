import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('range') || '24h';
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'likes';

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

    const where: any = {
      createdAt: {
        gte: startDate,
      },
    };

    if (category) {
      where.analysis = {
        primaryCategory: category,
      };
    }

    let orderBy: any = { likesCount: 'desc' };
    if (sortBy === 'retweets') {
      orderBy = { retweetsCount: 'desc' };
    } else if (sortBy === 'date') {
      orderBy = { createdAt: 'desc' };
    }

    const tweets = await prisma.tweet.findMany({
      where,
      orderBy,
      take: limit,
      include: {
        user: true,
        analysis: true,
        tokenMentions: true,
      },
    });

    return NextResponse.json({ tweets });
  } catch (error) {
    console.error('Error fetching top tweets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top tweets' },
      { status: 500 }
    );
  }
}
