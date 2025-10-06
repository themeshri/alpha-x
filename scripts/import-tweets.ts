import dotenv from 'dotenv';
import path from 'path';
import * as readline from 'readline';
import { prisma } from '../src/lib/prisma';
import { analyzeQueue } from '../src/lib/queue';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

interface ApifyTweetData {
  id: string;
  text: string;
  url: string;
  createdAt: string;
  likeCount: number;
  retweetCount: number;
  replyCount: number;
  author: {
    userName: string;
    name: string;
    followers: number;
    description?: string;
    profilePicture?: string;
  };
}

async function importTweets(jsonData: string) {
  try {
    console.log('\n📥 Parsing JSON data...');
    const tweets: ApifyTweetData[] = JSON.parse(jsonData);

    if (!Array.isArray(tweets)) {
      throw new Error('JSON must be an array of tweets');
    }

    console.log(`✅ Found ${tweets.length} tweets to import\n`);

    let imported = 0;
    let skipped = 0;
    let analyzed = 0;

    for (const tweet of tweets) {
      try {
        // Check if user exists, create if not
        const user = await prisma.user.upsert({
          where: { twitterHandle: tweet.author.userName },
          update: {
            displayName: tweet.author.name,
            followerCount: tweet.author.followers,
            bio: tweet.author.description,
            profileImageUrl: tweet.author.profilePicture,
          },
          create: {
            twitterHandle: tweet.author.userName,
            displayName: tweet.author.name,
            followerCount: tweet.author.followers,
            bio: tweet.author.description,
            profileImageUrl: tweet.author.profilePicture,
          },
        });

        // Check if tweet already exists
        const existingTweet = await prisma.tweet.findUnique({
          where: { tweetId: tweet.id },
        });

        if (existingTweet) {
          skipped++;
          process.stdout.write(`⏭️  Skipped duplicate: ${tweet.id}\r`);
          continue;
        }

        // Create tweet
        const createdTweet = await prisma.tweet.create({
          data: {
            tweetId: tweet.id,
            userId: user.id,
            tweetText: tweet.text,
            tweetUrl: tweet.url,
            createdAt: new Date(tweet.createdAt),
            likesCount: tweet.likeCount,
            retweetsCount: tweet.retweetCount,
            repliesCount: tweet.replyCount,
          },
        });

        // Queue for analysis
        await analyzeQueue.add('analyze', {
          tweetId: createdTweet.id,
          tweetText: tweet.text,
        });

        imported++;
        analyzed++;
        process.stdout.write(`✅ Imported: ${imported}/${tweets.length} | Skipped: ${skipped} | Queued for analysis: ${analyzed}\r`);
      } catch (error) {
        console.error(`\n❌ Error importing tweet ${tweet.id}:`, error);
      }
    }

    console.log(`\n\n🎉 Import complete!`);
    console.log(`   ✅ Imported: ${imported} tweets`);
    console.log(`   ⏭️  Skipped: ${skipped} duplicates`);
    console.log(`   🤖 Queued for AI analysis: ${analyzed} tweets`);
    console.log(`\n💡 The analyze worker will process these tweets in the background.`);
    console.log(`   Check your dashboard in a few minutes to see results!\n`);
  } catch (error) {
    console.error('❌ Error importing tweets:', error);
    throw error;
  }
}

async function main() {
  console.clear();
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║          📥 Manual Tweet Import Tool                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  console.log('This tool lets you import Apify JSON data without API calls.\n');
  console.log('Instructions:');
  console.log('1. Go to https://console.apify.com/actors');
  console.log('2. Run the Twitter List Scraper actor (mAxIirfenUcKwNXST)');
  console.log('3. Once complete, click "Export results" → "JSON"');
  console.log('4. Copy the entire JSON array');
  console.log('5. Paste it below and press Enter, then Ctrl+D (Mac/Linux) or Ctrl+Z (Windows)\n');
  console.log('───────────────────────────────────────────────────────────\n');
  console.log('Paste your JSON data (multi-line supported):\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let jsonInput = '';

  rl.on('line', (line) => {
    jsonInput += line;
  });

  rl.on('close', async () => {
    if (!jsonInput.trim()) {
      console.error('\n❌ No data provided. Exiting.');
      process.exit(1);
    }

    try {
      await importTweets(jsonInput);
      await prisma.$disconnect();
      process.exit(0);
    } catch (error) {
      console.error('\n❌ Import failed:', error);
      await prisma.$disconnect();
      process.exit(1);
    }
  });
}

main();
