// types/User.ts

export interface UserGrowthPoint {
  month: string;
  count: number;
}

export interface ActivityLevels {
  low_activity: number;
  medium_activity: number;
  high_activity: number;
}

export interface UserEngagement {
  usersWithCanvases: number;
  usersWithPublishedCanvases: number;
  activeUsersLast30Days: number;
  activityLevels: ActivityLevels;
}

export interface WalletDistribution {
  evm_users: number;
  solana_users: number;
  both_wallets: number;
}

export interface SocialConnections {
  farcaster_users: number;
  lens_users: number;
  twitter_users: number;
  usersWithMultipleSocials: number;
}

export interface UserAnalytics {
  totalUsers: number;
  userGrowth: UserGrowthPoint[];
  engagement: UserEngagement;
  walletDistribution: WalletDistribution;
  socialConnections: SocialConnections;
}
