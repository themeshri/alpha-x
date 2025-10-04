import { NextResponse } from 'next/server';
import { scrapeQueue } from '@/lib/queue';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { listUrl, listId, scrapeAll } = body;

    let listUrls: string[] = [];

    if (scrapeAll) {
      // Scrape all active lists
      const lists = await prisma.twitterList.findMany({
        where: { isActive: true },
      });

      if (lists.length === 0) {
        return NextResponse.json(
          { error: 'No active Twitter lists found. Please add a list first.' },
          { status: 400 }
        );
      }

      listUrls = lists.map((list) => list.listUrl);
    } else if (listId) {
      // Scrape specific list by ID
      const list = await prisma.twitterList.findUnique({
        where: { id: listId },
      });

      if (!list) {
        return NextResponse.json(
          { error: 'Twitter list not found' },
          { status: 404 }
        );
      }

      listUrls = [list.listUrl];
    } else if (listUrl) {
      // Scrape one-time URL (not saved)
      listUrls = [listUrl];
    } else {
      return NextResponse.json(
        { error: 'listUrl, listId, or scrapeAll is required' },
        { status: 400 }
      );
    }

    // Queue scraping jobs
    const jobs = await Promise.all(
      listUrls.map((url) =>
        scrapeQueue.add('scrape', { listUrl: url })
      )
    );

    return NextResponse.json({
      success: true,
      jobIds: jobs.map((job) => job.id),
      listsCount: listUrls.length,
      message: `Queued scraping for ${listUrls.length} list(s)`,
    });
  } catch (error) {
    console.error('Error queueing scrape job:', error);
    return NextResponse.json(
      { error: 'Failed to queue scraping job' },
      { status: 500 }
    );
  }
}
