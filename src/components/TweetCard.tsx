import { formatDistanceToNow } from 'date-fns';
import { Heart, Repeat2, MessageCircle, ExternalLink } from 'lucide-react';

interface TweetCardProps {
  tweet: {
    id: string;
    tweetText: string;
    tweetUrl: string;
    createdAt: string | Date;
    likesCount: number;
    retweetsCount: number;
    repliesCount: number;
    user: {
      displayName: string;
      twitterHandle: string;
      profileImageUrl?: string | null;
    };
    analysis?: {
      primaryCategory: string;
      sentiment: string;
    } | null;
    tokenMentions?: Array<{
      tokenTicker: string;
    }>;
  };
}

export function TweetCard({ tweet }: TweetCardProps) {
  const createdAt = typeof tweet.createdAt === 'string' ? new Date(tweet.createdAt) : tweet.createdAt;

  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-200 hover:border-blue-300 transition-colors">
      <div className="flex items-start gap-3">
        {tweet.user.profileImageUrl ? (
          <img
            src={tweet.user.profileImageUrl}
            alt={tweet.user.displayName}
            className="w-12 h-12 rounded-full"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 font-semibold">
              {tweet.user.displayName[0]}
            </span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">{tweet.user.displayName}</p>
              <p className="text-sm text-gray-500">@{tweet.user.twitterHandle}</p>
            </div>
            <a
              href={tweet.tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>

          <p className="mt-2 text-gray-800 whitespace-pre-wrap">{tweet.tweetText}</p>

          {tweet.tokenMentions && tweet.tokenMentions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {tweet.tokenMentions.map((mention, idx) => (
                <span
                  key={idx}
                  className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                >
                  ${mention.tokenTicker}
                </span>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {tweet.likesCount.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Repeat2 className="w-4 h-4" />
              {tweet.retweetsCount.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              {tweet.repliesCount.toLocaleString()}
            </span>
          </div>

          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="text-gray-500">
              {formatDistanceToNow(createdAt, { addSuffix: true })}
            </span>
            {tweet.analysis && (
              <>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                  {tweet.analysis.primaryCategory.replace('_', ' ')}
                </span>
                <span className={`px-2 py-0.5 rounded ${
                  tweet.analysis.sentiment === 'bullish'
                    ? 'bg-green-100 text-green-800'
                    : tweet.analysis.sentiment === 'bearish'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {tweet.analysis.sentiment}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
