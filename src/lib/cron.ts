import { scrapeQueue } from './queue';
import { prisma } from './prisma';

const SCRAPE_INTERVAL_MINUTES = parseInt(
  process.env.SCRAPE_INTERVAL_MINUTES || '30'
);

async function scrapeAllActiveLists() {
  try {
    const lists = await prisma.twitterList.findMany({
      where: { isActive: true },
    });

    if (lists.length === 0) {
      console.log('⚠️  No active Twitter lists found. Add lists via the UI or set TWITTER_LIST_URL in .env');
      return;
    }

    console.log(`📋 Scraping ${lists.length} active Twitter list(s)...`);

    for (const list of lists) {
      await scrapeQueue.add('scrape', { listUrl: list.listUrl });

      // Update last scraped timestamp
      await prisma.twitterList.update({
        where: { id: list.id },
        data: { lastScraped: new Date() },
      });
    }

    console.log(`✅ Queued scraping for ${lists.length} list(s)`);
  } catch (error) {
    console.error('Error in scheduled scrape:', error);
  }
}

export function startCronJobs() {
  console.log(`🕐 Scheduling scrape job every ${SCRAPE_INTERVAL_MINUTES} minutes`);

  // Run immediately on startup
  scrapeAllActiveLists();

  // Schedule recurring job
  setInterval(
    async () => {
      console.log('⏰ Triggering scheduled scrape job');
      await scrapeAllActiveLists();
    },
    SCRAPE_INTERVAL_MINUTES * 60 * 1000
  );
}
