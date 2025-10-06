'use client';

import { useQuery } from '@tanstack/react-query';
import { TweetCard } from './TweetCard';

interface TokenModalProps {
  ticker: string;
  onClose: () => void;
}

async function fetchTokenTweets(ticker: string) {
  const res = await fetch(`/api/tokens/${encodeURIComponent(ticker)}/tweets`);
  if (!res.ok) throw new Error('Failed to fetch token tweets');
  return res.json();
}

export function TokenModal({ ticker, onClose }: TokenModalProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['token-tweets', ticker],
    queryFn: () => fetchTokenTweets(ticker),
  });

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            ${ticker} Mentions
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="text-gray-500">Loading tweets...</div>
            </div>
          ) : data?.tweets && data.tweets.length > 0 ? (
            <div className="space-y-4">
              {data.tweets.map((tweet: any) => (
                <TweetCard key={tweet.id} tweet={tweet} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No tweets found for ${ticker}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
