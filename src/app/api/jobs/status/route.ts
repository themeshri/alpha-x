import { NextResponse } from 'next/server';
import { scrapeQueue, analyzeQueue } from '@/lib/queue';

export async function GET() {
  try {
    // Get counts for both queues
    const [
      scrapeWaiting,
      scrapeActive,
      scrapeCompleted,
      scrapeFailed,
      analyzeWaiting,
      analyzeActive,
      analyzeCompleted,
      analyzeFailed,
    ] = await Promise.all([
      scrapeQueue.getWaitingCount(),
      scrapeQueue.getActiveCount(),
      scrapeQueue.getCompletedCount(),
      scrapeQueue.getFailedCount(),
      analyzeQueue.getWaitingCount(),
      analyzeQueue.getActiveCount(),
      analyzeQueue.getCompletedCount(),
      analyzeQueue.getFailedCount(),
    ]);

    const isProcessing = scrapeActive > 0 || analyzeActive > 0 || scrapeWaiting > 0 || analyzeWaiting > 0;

    return NextResponse.json({
      scrape: {
        waiting: scrapeWaiting,
        active: scrapeActive,
        completed: scrapeCompleted,
        failed: scrapeFailed,
      },
      analyze: {
        waiting: analyzeWaiting,
        active: analyzeActive,
        completed: analyzeCompleted,
        failed: analyzeFailed,
      },
      isProcessing,
      status: isProcessing ? 'processing' : 'idle',
    });
  } catch (error) {
    console.error('Error fetching job status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job status' },
      { status: 500 }
    );
  }
}
