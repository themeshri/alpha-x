'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { TweetCard } from '@/components/TweetCard';

async function fetchTopTweets(range: string, sortBy: string, category?: string) {
  let url = `/api/tweets/top?range=${range}&sortBy=${sortBy}&limit=20`;
  if (category) url += `&category=${category}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch tweets');
  return res.json();
}

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'token_mention', label: 'Token Mention' },
  { value: 'project_discussion', label: 'Project Discussion' },
  { value: 'narrative_thesis', label: 'Narrative/Thesis' },
  { value: 'market_analysis', label: 'Market Analysis' },
  { value: 'news_announcement', label: 'News/Announcement' },
  { value: 'educational', label: 'Educational' },
  { value: 'shitpost_drama', label: 'Shitpost/Drama' },
];

export default function TweetsPage() {
  const [timeRange, setTimeRange] = useState('24h');
  const [sortBy, setSortBy] = useState('likes');
  const [category, setCategory] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['top-tweets', timeRange, sortBy, category],
    queryFn: () => fetchTopTweets(timeRange, sortBy, category),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Top Tweets</h1>
              <p className="mt-1 text-sm text-gray-500">
                Highest engagement tweets from tracked influencers
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ← Dashboard
            </Link>
          </div>

          {/* Filters */}
          <div className="mt-6 space-y-4">
            {/* Time Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Range
              </label>
              <div className="flex gap-2">
                {['24h', '7d', '30d'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      timeRange === range
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {range === '24h' ? '24 Hours' : range === '7d' ? '7 Days' : '30 Days'}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'likes', label: 'Likes' },
                  { value: 'retweets', label: 'Retweets' },
                  { value: 'date', label: 'Recent' },
                ].map((sort) => (
                  <button
                    key={sort.value}
                    onClick={() => setSortBy(sort.value)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      sortBy === sort.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {sort.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Loading tweets...</p>
          </div>
        ) : data?.tweets && data.tweets.length > 0 ? (
          <div className="space-y-4">
            {data.tweets.map((tweet: any) => (
              <TweetCard key={tweet.id} tweet={tweet} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No tweets found. Try adjusting your filters or start scraping.</p>
          </div>
        )}
      </main>
    </div>
  );
}
