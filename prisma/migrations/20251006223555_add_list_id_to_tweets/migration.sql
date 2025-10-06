-- AlterTable
ALTER TABLE "tweets" ADD COLUMN     "listId" TEXT;

-- CreateIndex
CREATE INDEX "tweets_listId_idx" ON "tweets"("listId");

-- CreateIndex
CREATE INDEX "tweets_listId_createdAt_idx" ON "tweets"("listId", "createdAt");

-- AddForeignKey
ALTER TABLE "tweets" ADD CONSTRAINT "tweets_listId_fkey" FOREIGN KEY ("listId") REFERENCES "twitter_lists"("id") ON DELETE SET NULL ON UPDATE CASCADE;
