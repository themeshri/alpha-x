'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { TokenModal } from '@/components/TokenModal';

async function fetchTrendingTokens(range: string) {
  const res = await fetch(`/api/tokens/trending?range=${range}&limit=50`);
  if (!res.ok) throw new Error('Failed to fetch tokens');
  return res.json();
}

export default function TokensPage() {
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedToken, setSelectedToken] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['trending-tokens', timeRange],
    queryFn: () => fetchTrendingTokens(timeRange),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Trending Tokens</h1>
              <p className="mt-1 text-sm text-gray-500">
                Most mentioned cryptocurrency tokens
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ← Dashboard
            </Link>
          </div>

          {/* Time Range Filter */}
          <div className="mt-4 flex gap-2 flex-wrap">
            {[
              { label: 'Last 15min', value: '15m' },
              { label: 'Last 1h', value: '1h' },
              { label: 'Last 6h', value: '6h' },
              { label: 'Last 24h', value: '24h' },
              { label: 'Last 7d', value: '7d' },
              { label: 'Last 30d', value: '30d' },
              { label: 'Older than 24h', value: 'older' },
            ].map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-4 py-2 rounded-lg transition-colors ${
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
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Loading tokens...</p>
          </div>
        ) : data?.tokens && data.tokens.length > 0 ? (
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Token
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mentions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.tokens.map((token: any, idx: number) => (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedToken(token.ticker)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      #{idx + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                        ${token.ticker}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {token.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {token.mentionCount} mentions
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No token mentions found. Start scraping to see data.</p>
          </div>
        )}
      </main>

      {/* Token Modal */}
      {selectedToken && (
        <TokenModal
          ticker={selectedToken}
          onClose={() => setSelectedToken(null)}
        />
      )}
    </div>
  );
}
