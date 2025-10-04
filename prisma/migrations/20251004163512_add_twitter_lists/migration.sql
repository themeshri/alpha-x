-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "twitterHandle" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "followerCount" INTEGER NOT NULL DEFAULT 0,
    "bio" TEXT,
    "profileImageUrl" TEXT,
    "addedToListDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tweets" (
    "id" TEXT NOT NULL,
    "tweetId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tweetText" TEXT NOT NULL,
    "tweetUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "likesCount" INTEGER NOT NULL DEFAULT 0,
    "retweetsCount" INTEGER NOT NULL DEFAULT 0,
    "repliesCount" INTEGER NOT NULL DEFAULT 0,
    "scrapedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tweets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tweet_analysis" (
    "id" TEXT NOT NULL,
    "tweetId" TEXT NOT NULL,
    "primaryCategory" TEXT NOT NULL,
    "sentiment" TEXT NOT NULL,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "summary" TEXT,
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tweet_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token_mentions" (
    "id" TEXT NOT NULL,
    "tweetId" TEXT NOT NULL,
    "tokenTicker" TEXT NOT NULL,
    "tokenName" TEXT,
    "mentionContext" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_mentions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_mentions" (
    "id" TEXT NOT NULL,
    "tweetId" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "mentionContext" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_mentions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "narrative_tags" (
    "id" TEXT NOT NULL,
    "tweetId" TEXT NOT NULL,
    "narrativeName" TEXT NOT NULL,
    "relevanceScore" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "narrative_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "twitter_lists" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "listUrl" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastScraped" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "twitter_lists_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_twitterHandle_key" ON "users"("twitterHandle");

-- CreateIndex
CREATE UNIQUE INDEX "tweets_tweetId_key" ON "tweets"("tweetId");

-- CreateIndex
CREATE INDEX "tweets_userId_idx" ON "tweets"("userId");

-- CreateIndex
CREATE INDEX "tweets_createdAt_idx" ON "tweets"("createdAt");

-- CreateIndex
CREATE INDEX "tweets_likesCount_idx" ON "tweets"("likesCount");

-- CreateIndex
CREATE UNIQUE INDEX "tweet_analysis_tweetId_key" ON "tweet_analysis"("tweetId");

-- CreateIndex
CREATE INDEX "tweet_analysis_primaryCategory_idx" ON "tweet_analysis"("primaryCategory");

-- CreateIndex
CREATE INDEX "tweet_analysis_sentiment_idx" ON "tweet_analysis"("sentiment");

-- CreateIndex
CREATE INDEX "token_mentions_tweetId_idx" ON "token_mentions"("tweetId");

-- CreateIndex
CREATE INDEX "token_mentions_tokenTicker_idx" ON "token_mentions"("tokenTicker");

-- CreateIndex
CREATE INDEX "project_mentions_tweetId_idx" ON "project_mentions"("tweetId");

-- CreateIndex
CREATE INDEX "project_mentions_projectName_idx" ON "project_mentions"("projectName");

-- CreateIndex
CREATE INDEX "narrative_tags_tweetId_idx" ON "narrative_tags"("tweetId");

-- CreateIndex
CREATE INDEX "narrative_tags_narrativeName_idx" ON "narrative_tags"("narrativeName");

-- CreateIndex
CREATE UNIQUE INDEX "twitter_lists_listUrl_key" ON "twitter_lists"("listUrl");

-- CreateIndex
CREATE UNIQUE INDEX "twitter_lists_listId_key" ON "twitter_lists"("listId");

-- AddForeignKey
ALTER TABLE "tweets" ADD CONSTRAINT "tweets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tweet_analysis" ADD CONSTRAINT "tweet_analysis_tweetId_fkey" FOREIGN KEY ("tweetId") REFERENCES "tweets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token_mentions" ADD CONSTRAINT "token_mentions_tweetId_fkey" FOREIGN KEY ("tweetId") REFERENCES "tweets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_mentions" ADD CONSTRAINT "project_mentions_tweetId_fkey" FOREIGN KEY ("tweetId") REFERENCES "tweets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "narrative_tags" ADD CONSTRAINT "narrative_tags_tweetId_fkey" FOREIGN KEY ("tweetId") REFERENCES "tweets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
