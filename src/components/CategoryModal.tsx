'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TweetCard } from './TweetCard';

interface CategoryModalProps {
  category: string;
  initialRange?: string;
  onClose: () => void;
}

async function fetchCategoryTweets(category: string, range: string) {
  const res = await fetch(`/api/tweets/category/${encodeURIComponent(category)}?range=${range}`);
  if (!res.ok) throw new Error('Failed to fetch category tweets');
  return res.json();
}

export function CategoryModal({ category, initialRange = '24h', onClose }: CategoryModalProps) {
  const [timeRange, setTimeRange] = useState(initialRange);

  const { data, isLoading, error } = useQuery({
    queryKey: ['category-tweets', category, timeRange],
    queryFn: () => fetchCategoryTweets(category, timeRange),
    enabled: !!category, // Only run query if category exists
  });

  const categoryName = category ? category.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : 'Unknown Category';

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {categoryName}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Time Range Filter */}
          <div className="flex gap-2 flex-wrap">
            {[
              { label: '15min', value: '15m' },
              { label: '1h', value: '1h' },
              { label: '6h', value: '6h' },
              { label: '24h', value: '24h' },
              { label: '>24h', value: 'older' },
              { label: 'All Time', value: 'all' },
            ].map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  timeRange === range.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {error ? (
            <div className="text-center text-red-500 py-8">
              Error loading tweets. Please try again.
            </div>
          ) : isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="text-gray-500">Loading tweets...</div>
            </div>
          ) : data?.tweets && data.tweets.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Showing {data.tweets.length} tweet{data.tweets.length !== 1 ? 's' : ''}
              </p>
              {data.tweets.map((tweet: any) => (
                <TweetCard key={tweet.id} tweet={tweet} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No tweets found in this category for the selected time range
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
