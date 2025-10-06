import { NextResponse } from 'next/server';
import { scrapeQueue } from '@/lib/queue';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { listUrl, listId, scrapeAll } = body;

    let listsToScrape: Array<{ listUrl: string; listId: string }> = [];

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

      listsToScrape = lists.map((list) => ({
        listUrl: list.listUrl,
        listId: list.id,
      }));
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

      listsToScrape = [{ listUrl: list.listUrl, listId: list.id }];
    } else if (listUrl) {
      // Scrape one-time URL (not saved) - no listId
      listsToScrape = [{ listUrl, listId: '' }];
    } else {
      return NextResponse.json(
        { error: 'listUrl, listId, or scrapeAll is required' },
        { status: 400 }
      );
    }

    // Queue scraping jobs
    const jobs = await Promise.all(
      listsToScrape.map((item) =>
        scrapeQueue.add('scrape', {
          listUrl: item.listUrl,
          listId: item.listId || undefined,
        })
      )
    );

    // Update lastScraped timestamp for each list
    await Promise.all(
      listsToScrape
        .filter((item) => item.listId) // Only update lists with IDs
        .map((item) =>
          prisma.twitterList.update({
            where: { id: item.listId },
            data: { lastScraped: new Date() },
          })
        )
    );

    return NextResponse.json({
      success: true,
      jobIds: jobs.map((job) => job.id),
      listsCount: listsToScrape.length,
      message: `Queued scraping for ${listsToScrape.length} list(s)`,
    });
  } catch (error) {
    console.error('Error queueing scrape job:', error);
    return NextResponse.json(
      { error: 'Failed to queue scraping job' },
      { status: 500 }
    );
  }
}
