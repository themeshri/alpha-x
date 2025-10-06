-- AlterTable
ALTER TABLE "tweets" ADD COLUMN     "mediaUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
