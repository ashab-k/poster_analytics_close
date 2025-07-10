export interface IpData {
  IpId?: string;
  ipID?: string;
  txHash: string;
  tokenId: number;
  licenseTermsId?: number;
}

export interface StoryStat {
  id: number;
  ipType: "derivative_ip" | "fresh_ip";
  ipData: IpData[];
  spgNftContract: string;
  chainId: string;
  createdAt: string;
  updatedAt: string;
  canvasId: number;
}

export interface StoryDataResponse {
  status: string;
  code: number;
  data: {
    stats: StoryStat[];
    filters: {
      ipType: string;
      chainId: string;
    };
    totalCount: number;
    pages: {
      currentPage: number;
      nextPage: number | null;
    };
  };
}

export interface StoryAnalytics {
  totalIps: number;
  freshIps: number;
  derivativeIps: number;
  timelineData: { date: string; count: number }[];
  ipTypeDistribution: { type: string; count: number }[];
  canvasDistribution: { canvasId: number; count: number }[];
} 