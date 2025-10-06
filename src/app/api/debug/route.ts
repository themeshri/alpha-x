import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [tweetCount, userCount, analysisCount, listCount] = await Promise.all([
      prisma.tweet.count(),
      prisma.user.count(),
      prisma.tweetAnalysis.count(),
      prisma.twitterList.count(),
    ]);

    const recentTweet = await prisma.tweet.findFirst({
      orderBy: { scrapedAt: 'desc' },
      select: {
        id: true,
        tweetId: true,
        tweetText: true,
        scrapedAt: true,
      },
    });

    return NextResponse.json({
      counts: {
        tweets: tweetCount,
        users: userCount,
        analyses: analysisCount,
        lists: listCount,
      },
      mostRecentTweet: recentTweet,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
