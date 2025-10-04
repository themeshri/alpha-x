-- CreateIndex
CREATE INDEX "token_mentions_tokenTicker_createdAt_idx" ON "token_mentions"("tokenTicker", "createdAt");

-- CreateIndex
CREATE INDEX "token_mentions_createdAt_idx" ON "token_mentions"("createdAt");

-- CreateIndex
CREATE INDEX "tweet_analysis_primaryCategory_analyzedAt_idx" ON "tweet_analysis"("primaryCategory", "analyzedAt");

-- CreateIndex
CREATE INDEX "tweet_analysis_sentiment_analyzedAt_idx" ON "tweet_analysis"("sentiment", "analyzedAt");

-- CreateIndex
CREATE INDEX "tweets_userId_createdAt_idx" ON "tweets"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "tweets_scrapedAt_idx" ON "tweets"("scrapedAt");
