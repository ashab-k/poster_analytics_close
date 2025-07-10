export type Owner = {
  username: string | null;
  evm_address: string | null;
};

export type Canvas = {
  id: number;
  tags: string[];
};

export type PublishedCanvas = {
  id: number;
  platform: string;
  createdAt: string;
  farcaster_likes: number | null;
  farcaster_recasts: number | null;
  farcaster_replies: number | null;
  twitter_likes: number | null;
  twitter_retweets: number | null;
  twitter_replies: number | null;
  twitter_views: number | null;
  twitter_bookmarks: number | null;
  twitter_quotes: number | null;
  social_capital_score: number | null;
  reply_reaction_ratio: number | null;
  url: string | null;
  owner: Owner | null;
  canvas: Canvas | null;
  channelId: string | null;
};

export type ChannelPerformance = {
  channelId: string;
  _count: {
    hash: number;
  };
  _avg: {
    numberOfLikes: number | null;
    numberOfRecasts: number | null;
    numberOfReplies: number | null;
  };
};

export type ChannelDetail = {
  id: string;
  name: string;
  followerCount: number | null;
  imageUrl: string | null;
};

export type ScoreDistribution = {
  score_range: string;
  count: number;
};

export type PlatformComparison = {
  platform: string;
  _count: {
    id: number;
  };
  _avg: {
    social_capital_score: number | null;
    farcaster_likes: number | null;
    farcaster_recasts: number | null;
    farcaster_replies: number | null;
    twitter_likes: number | null;
    twitter_retweets: number | null;
    twitter_replies: number | null;
  };
};
export type DailyMetric = {
  platform: string;
  _count: {
    id: number;
  };
  _sum: {
    farcaster_likes: number | null;
    farcaster_recasts: number | null;
    farcaster_replies: number | null;
    twitter_likes: number | null;
    twitter_retweets: number | null;
    twitter_replies: number | null;
    twitter_views: number | null;
  };
};

export type AnalyticsData = {
  publishedCanvasPerformance: PublishedCanvas[];
  channelPerformance: ChannelPerformance[];
  channelDetails: ChannelDetail[];
  socialCapitalDistribution: ScoreDistribution[];
  platformComparison: PlatformComparison[];
  dailyMetrics: DailyMetric[];
};
