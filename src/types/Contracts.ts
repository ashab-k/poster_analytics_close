export interface Recipient {
  address: string;
  percentAllocation: number;
}

export interface ContractArgs {
  recipients: Recipient[];
  distributorFeePercent?: number;
}

export interface SplitContract {
  contract_address: string;
  args_hash: string;
  user_id: number;
  createdAt: string;
  chain_id: number;
  args: ContractArgs;
}

export interface SplitContractsResponse {
  status: string;
  code: number;
  data: {
    splitContracts: SplitContract[];
    totalPages: number;
    currentPage: number;
    nextPage: number | null;
    filters: {
      chainId: string;
      canvasId: string;
      userId: string;
    };
  };
}

export interface ChainInfo {
  id: number;
  name: string;
  color: string;
}

export interface AnalyticsData {
  totalContracts: number;
  uniqueRecipients: number;
  averageSplitSize: number;
  chainDistribution: { chainId: number; count: number; name: string }[];
  topUsers: { userId: number; count: number }[];
  allocationPatterns: { pattern: string; count: number }[];
  timelineData: { date: string; count: number }[];
}
