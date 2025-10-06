'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

async function fetchUsers() {
  const res = await fetch('/api/users?limit=50');
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export default function UsersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Users</h1>
              <p className="mt-1 text-sm text-gray-500">
                Twitter influencers being tracked
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        ) : data?.users && data.users.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.users.map((user: any) => (
              <Link
                key={user.id}
                href={`/users/${user.id}`}
                className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {user.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt={user.displayName}
                      className="w-16 h-16 rounded-full"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-2xl font-semibold text-gray-500">
                        {user.displayName[0]}
                      </span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {user.displayName}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      @{user.twitterHandle}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {user.followerCount.toLocaleString()} followers
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">
                      {user.tweetCount}
                    </p>
                    <p className="text-xs text-gray-500">Tweets</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">
                      {user.avgLikes}
                    </p>
                    <p className="text-xs text-gray-500">Avg Likes</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">
                      {user.avgRetweets}
                    </p>
                    <p className="text-xs text-gray-500">Avg RTs</p>
                  </div>
                </div>

                {/* Token Badges */}
                {user.topTokens && user.topTokens.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-500 mb-2">
                      Top Mentioned Tokens
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {user.topTokens.map((token: any, idx: number) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          ${token.ticker}
                          <span className="text-blue-600 font-semibold">
                            {token.count}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No users found. Start scraping to see data.</p>
          </div>
        )}
      </main>
    </div>
  );
}
