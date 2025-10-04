export type TweetCategory =
  | 'token_mention'
  | 'project_discussion'
  | 'narrative_thesis'
  | 'shitpost_drama'
  | 'educational'
  | 'market_analysis'
  | 'news_announcement'
  | 'other';

export type Sentiment = 'bullish' | 'neutral' | 'bearish';

export type UrgencyLevel = 'breaking' | 'timely' | 'general';

export interface TweetAnalysisResult {
  category: TweetCategory;
  tokens: Array<{
    ticker: string;
    name?: string;
    context?: string;
  }>;
  projects: Array<{
    name: string;
    context?: string;
  }>;
  narratives: Array<{
    name: string;
    relevance: number;
  }>;
  sentiment: Sentiment;
  urgency: UrgencyLevel;
  summary: string;
  confidenceScore: number;
}

export interface ApifyTweetData {
  id: string;
  text: string;
  url: string;
  createdAt: string;
  likeCount: number;
  retweetCount: number;
  replyCount: number;
  author: {
    userName: string;
    name: string;
    followers: number;
    description?: string;
    profilePicture?: string;
  };
}
