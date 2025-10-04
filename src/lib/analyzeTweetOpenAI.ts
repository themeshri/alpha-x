import OpenAI from 'openai';
import type { TweetAnalysisResult } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ANALYSIS_PROMPT = `You are a crypto Twitter intelligence analyst. Analyze this tweet and extract structured information.

Tweet: {tweet}

Respond ONLY with valid JSON matching this exact structure:
{
  "category": "token_mention" | "project_discussion" | "narrative_thesis" | "shitpost_drama" | "educational" | "market_analysis" | "news_announcement" | "other",
  "tokens": [{"ticker": "BTC", "name": "Bitcoin", "context": "price prediction"}],
  "projects": [{"name": "Uniswap", "context": "new feature launch"}],
  "narratives": [{"name": "DeFi Summer", "relevance": 0.9}],
  "sentiment": "bullish" | "neutral" | "bearish",
  "urgency": "breaking" | "timely" | "general",
  "summary": "One sentence insight",
  "confidenceScore": 0.85
}

Categories:
- token_mention: Specific crypto token discussed
- project_discussion: DeFi protocol, NFT project, infrastructure
- narrative_thesis: Broader themes (AI agents, RWA, gaming)
- shitpost_drama: FUD, criticism, controversy
- educational: Tutorials, explanations
- market_analysis: TA, charts, price predictions
- news_announcement: Breaking news, launches
- other: Everything else

Extract ALL token tickers (e.g., $BTC, $ETH), projects mentioned, and narrative themes.`;

export async function analyzeTweet(tweetText: string): Promise<TweetAnalysisResult> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview', // or 'gpt-3.5-turbo' for cheaper option
      messages: [
        {
          role: 'system',
          content: 'You are a crypto Twitter intelligence analyst. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: ANALYSIS_PROMPT.replace('{tweet}', tweetText),
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const result = JSON.parse(content) as TweetAnalysisResult;
    return result;
  } catch (error) {
    console.error('Error analyzing tweet with OpenAI:', error);
    throw error;
  }
}
