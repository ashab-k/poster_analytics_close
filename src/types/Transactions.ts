export type Transaction = {
  id?: number;
  hash: string;
  type: string;
  amount?: number;
  chainId: number;
  createdAt: string;
  user?: string;
  username?: string;
  contract?: string;
  contractType?: string;
  platform?: string;
};
export type TransactionsByChain = {
  [chainId: string]: Transaction[];
};
