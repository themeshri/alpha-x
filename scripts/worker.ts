import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
// Also load from .env as fallback
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Validate environment variables before starting
import { validateEnv } from '../src/lib/env';
validateEnv();

import { scrapeWorker, analyzeWorker } from '../src/lib/queue';
import { startCronJobs } from '../src/lib/cron';

console.log('🚀 Starting background workers...');
console.log('📝 Environment loaded:');
console.log(`   Database: ${process.env.DATABASE_URL?.substring(0, 30)}...`);
console.log(`   OpenAI: ${process.env.OPENAI_API_KEY ? '✓ Set' : '✗ Missing'}`);
console.log(`   Anthropic: ${process.env.ANTHROPIC_API_KEY ? '✓ Set' : '✗ Missing'}`);
console.log(`   Apify: ${process.env.APIFY_API_TOKEN ? '✓ Set' : '✗ Missing'}`);
console.log(`   Redis: ${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`);
console.log('');
console.log('✅ Scrape worker running');
console.log('✅ Analyze worker running');

// Start cron jobs for automated scraping
startCronJobs();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing workers...');
  scrapeWorker.close();
  analyzeWorker.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, closing workers...');
  scrapeWorker.close();
  analyzeWorker.close();
  process.exit(0);
});
