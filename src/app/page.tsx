'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { StatsCard } from '@/components/StatsCard';
import { TweetCard } from '@/components/TweetCard';
import { SentimentChart } from '@/components/SentimentChart';
import { CategoryChart } from '@/components/CategoryChart';

async function fetchOverview(range = '24h') {
  const res = await fetch(`/api/stats/overview?range=${range}`);
  if (!res.ok) throw new Error('Failed to fetch overview');
  return res.json();
}

async function fetchRecentTweets() {
  const res = await fetch('/api/tweets/recent?limit=10');
  if (!res.ok) throw new Error('Failed to fetch recent tweets');
  return res.json();
}

async function fetchTrendingTokens() {
  const res = await fetch('/api/tokens/trending?limit=10');
  if (!res.ok) throw new Error('Failed to fetch trending tokens');
  return res.json();
}

async function fetchSentiment(range = '24h') {
  const res = await fetch(`/api/stats/sentiment?range=${range}`);
  if (!res.ok) throw new Error('Failed to fetch sentiment');
  return res.json();
}

async function fetchCategories(range = '24h') {
  const res = await fetch(`/api/stats/categories?range=${range}`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export default function Home() {
  const { data: overview } = useQuery({
    queryKey: ['overview', '24h'],
    queryFn: () => fetchOverview('24h'),
    refetchInterval: 300000, // 5 minutes
  });

  const { data: recentTweets } = useQuery({
    queryKey: ['recent-tweets'],
    queryFn: fetchRecentTweets,
    refetchInterval: 300000,
  });

  const { data: trendingTokens } = useQuery({
    queryKey: ['trending-tokens'],
    queryFn: fetchTrendingTokens,
    refetchInterval: 300000,
  });

  const { data: sentiment } = useQuery({
    queryKey: ['sentiment', '24h'],
    queryFn: () => fetchSentiment('24h'),
    refetchInterval: 300000,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories', '24h'],
    queryFn: () => fetchCategories('24h'),
    refetchInterval: 300000,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Alpha Stream Analytics
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Crypto Twitter Intelligence Dashboard
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/lists"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Lists
              </Link>
              <Link
                href="/users"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Users
              </Link>
              <Link
                href="/tokens"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Tokens
              </Link>
              <Link
                href="/tweets"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Tweets
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Tweets"
            value={overview?.totalTweets?.toLocaleString() || '0'}
            subtitle="Last 24 hours"
          />
          <StatsCard
            title="Analyzed Tweets"
            value={overview?.analyzedTweets?.toLocaleString() || '0'}
            subtitle="AI processed"
          />
          <StatsCard
            title="Total Users"
            value={overview?.totalUsers?.toLocaleString() || '0'}
            subtitle="Tracked influencers"
          />
          <StatsCard
            title="Token Mentions"
            value={overview?.totalTokenMentions?.toLocaleString() || '0'}
            subtitle="Last 24 hours"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Sentiment Distribution */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Sentiment Distribution
            </h2>
            {sentiment?.sentiment ? (
              <SentimentChart data={sentiment.sentiment} />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                Loading sentiment data...
              </div>
            )}
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Tweet Categories
            </h2>
            {categories?.categories ? (
              <CategoryChart data={categories.categories} />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                Loading category data...
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Tweets */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Recent Tweets
            </h2>
            <div className="space-y-4">
              {recentTweets?.tweets && recentTweets.tweets.length > 0 ? (
                recentTweets.tweets.map((tweet: any) => (
                  <TweetCard key={tweet.id} tweet={tweet} />
                ))
              ) : (
                <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                  No tweets yet. Start scraping to see data.
                </div>
              )}
            </div>
          </div>

          {/* Trending Tokens */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Trending Tokens
            </h2>
            <div className="bg-white rounded-lg shadow border border-gray-200">
              {trendingTokens?.tokens && trendingTokens.tokens.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {trendingTokens.tokens.map((token: any, idx: number) => (
                    <li key={idx} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-900">
                            ${token.ticker}
                          </p>
                          {token.name && (
                            <p className="text-sm text-gray-500">{token.name}</p>
                          )}
                        </div>
                        <span className="text-sm font-medium text-blue-600">
                          {token.mentionCount} mentions
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No token mentions yet
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-white rounded-lg shadow border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={async () => {
                    const res = await fetch('/api/scrape', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ scrapeAll: true }),
                    });

                    const data = await res.json();
                    if (res.ok) {
                      alert(`Scraping queued for ${data.listsCount} list(s)!`);
                    } else {
                      alert(data.error || 'Failed to queue scraping job');
                    }
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Scrape All Lists
                </button>
                <Link
                  href="/lists"
                  className="block w-full px-4 py-2 bg-gray-100 text-gray-700 text-center rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Manage Lists
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
