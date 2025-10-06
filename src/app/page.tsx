'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { StatsCard } from '@/components/StatsCard';
import { TweetCard } from '@/components/TweetCard';
import { CategoryChart } from '@/components/CategoryChart';
import { TokenModal } from '@/components/TokenModal';
import { CategoryModal } from '@/components/CategoryModal';
import { JobProgress } from '@/components/JobProgress';

async function fetchOverview(range = '24h', listId?: string) {
  const url = listId
    ? `/api/stats/overview?range=${range}&listId=${listId}`
    : `/api/stats/overview?range=${range}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch overview');
  return res.json();
}

async function fetchRecentTweets(listId?: string) {
  const url = listId
    ? `/api/tweets/recent?limit=10&listId=${listId}`
    : '/api/tweets/recent?limit=10';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch recent tweets');
  return res.json();
}

async function fetchTrendingTokens(range = '24h', listId?: string) {
  const url = listId
    ? `/api/tokens/trending?limit=10&range=${range}&listId=${listId}`
    : `/api/tokens/trending?limit=10&range=${range}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch trending tokens');
  return res.json();
}

async function fetchCategories(range = '24h', listId?: string) {
  const url = listId
    ? `/api/stats/categories?range=${range}&listId=${listId}`
    : `/api/stats/categories?range=${range}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

async function fetchLists() {
  const res = await fetch('/api/lists');
  if (!res.ok) throw new Error('Failed to fetch lists');
  return res.json();
}

export default function Home() {
  const queryClient = useQueryClient();
  const [tokenRange, setTokenRange] = useState('24h');
  const [categoryRange, setCategoryRange] = useState('24h');
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [isScraping, setIsScraping] = useState(false);

  const { data: overview } = useQuery({
    queryKey: ['overview', '24h', selectedListId],
    queryFn: () => fetchOverview('24h', selectedListId || undefined),
    refetchInterval: 300000, // 5 minutes
  });

  const { data: recentTweets } = useQuery({
    queryKey: ['recent-tweets', selectedListId],
    queryFn: () => fetchRecentTweets(selectedListId || undefined),
    refetchInterval: 300000,
  });

  const { data: trendingTokens } = useQuery({
    queryKey: ['trending-tokens', tokenRange, selectedListId],
    queryFn: () => fetchTrendingTokens(tokenRange, selectedListId || undefined),
    refetchInterval: 300000,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories', categoryRange, selectedListId],
    queryFn: () => fetchCategories(categoryRange, selectedListId || undefined),
    refetchInterval: 300000,
  });

  const { data: lists } = useQuery({
    queryKey: ['lists'],
    queryFn: fetchLists,
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
                href="/"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Dashboard
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
        {/* List Tabs */}
        {lists?.lists && lists.lists.length > 0 && (
          <div className="mb-6 bg-white rounded-lg shadow border border-gray-200 p-4">
            <div className="flex justify-between items-center gap-4">
              <div className="flex gap-2 flex-wrap flex-1">
                <button
                  onClick={() => setSelectedListId(null)}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    selectedListId === null
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Lists
                </button>
                {lists.lists.map((list: any) => (
                  <button
                    key={list.id}
                    onClick={() => setSelectedListId(list.id)}
                    className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                      selectedListId === list.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {list.name}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    setIsScraping(true);
                    const loadingToast = toast.loading('Queueing scraping job...');

                    try {
                      const res = await fetch('/api/scrape', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          scrapeAll: selectedListId === null,
                          listId: selectedListId,
                        }),
                      });

                      const data = await res.json();
                      toast.dismiss(loadingToast);

                      if (res.ok) {
                        if (selectedListId === null) {
                          toast.success(`Scraping queued for ${data.listsCount} list(s)!`);
                        } else {
                          toast.success('Scraping queued for selected list!');
                        }

                        // Start polling for job completion to refresh data
                        const pollInterval = setInterval(async () => {
                          const statusRes = await fetch('/api/jobs/status');
                          const status = await statusRes.json();

                          if (!status.isProcessing) {
                            // Jobs are done, refresh all data
                            clearInterval(pollInterval);
                            queryClient.invalidateQueries({ queryKey: ['overview'] });
                            queryClient.invalidateQueries({ queryKey: ['recent-tweets'] });
                            queryClient.invalidateQueries({ queryKey: ['trending-tokens'] });
                            queryClient.invalidateQueries({ queryKey: ['categories'] });
                            toast.success('Data refreshed with new tweets!');
                          }
                        }, 3000); // Check every 3 seconds

                        // Stop polling after 5 minutes regardless
                        setTimeout(() => clearInterval(pollInterval), 300000);
                      } else {
                        toast.error(data.error || 'Failed to queue scraping job');
                      }
                    } catch (error) {
                      toast.dismiss(loadingToast);
                      toast.error('Failed to queue scraping job');
                    } finally {
                      setIsScraping(false);
                    }
                  }}
                  disabled={isScraping}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isScraping ? 'Scraping...' : 'Scrape'}
                </button>
                <Link
                  href="/lists"
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
                >
                  Manage Lists
                </Link>
              </div>
            </div>
          </div>
        )}

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
        <div className="grid grid-cols-1 gap-8 mb-8">
          {/* Category Distribution */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Tweet Categories
              </h2>
            </div>

            {/* Time Range Filter */}
            <div className="mb-4 flex gap-2 flex-wrap">
              {[
                { label: '15min', value: '15m' },
                { label: '1h', value: '1h' },
                { label: '6h', value: '6h' },
                { label: '24h', value: '24h' },
                { label: '>24h', value: 'older' },
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() => setCategoryRange(range.value)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    categoryRange === range.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {categories?.categories ? (
              <CategoryChart
                data={categories.categories}
                onCategoryClick={(category) => setSelectedCategory(category)}
              />
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Trending Tokens
              </h2>
            </div>

            {/* Time Range Filter */}
            <div className="mb-4 flex gap-2 flex-wrap">
              {[
                { label: '15min', value: '15m' },
                { label: '1h', value: '1h' },
                { label: '6h', value: '6h' },
                { label: '24h', value: '24h' },
                { label: '>24h', value: 'older' },
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() => setTokenRange(range.value)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    tokenRange === range.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-200">
              {trendingTokens?.tokens && trendingTokens.tokens.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {trendingTokens.tokens.map((token: any, idx: number) => (
                    <li
                      key={idx}
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedToken(token.ticker)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-900 hover:text-blue-600">
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
          </div>
        </div>
      </main>

      {/* Token Modal */}
      {selectedToken && (
        <TokenModal
          ticker={selectedToken}
          onClose={() => setSelectedToken(null)}
        />
      )}

      {/* Category Modal */}
      {selectedCategory && (
        <CategoryModal
          category={selectedCategory}
          initialRange={categoryRange}
          onClose={() => setSelectedCategory(null)}
        />
      )}

      {/* Job Progress Indicator */}
      <JobProgress />

      {/* Toast Notifications */}
      <Toaster position="top-right" />
    </div>
  );
}
