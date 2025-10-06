import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const listId = searchParams.get('listId');

    const whereClause = listId ? { listId } : {};

    const tweets = await prisma.tweet.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        user: true,
        analysis: true,
        tokenMentions: true,
      },
    });

    return NextResponse.json({ tweets });
  } catch (error) {
    console.error('Error fetching recent tweets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent tweets' },
      { status: 500 }
    );
  }
}
