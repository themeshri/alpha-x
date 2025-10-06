-- DropIndex
DROP INDEX IF EXISTS "tweet_analysis_sentiment_idx";
DROP INDEX IF EXISTS "tweet_analysis_sentiment_analyzedAt_idx";

-- AlterTable
ALTER TABLE "tweet_analysis" DROP COLUMN "sentiment";
