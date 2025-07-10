export interface Payment {
  signature: string;
  evm_address: string;
  amount: number;
  chain_id: string;
  token: string;
  createdAt: string; // ISO date string
} 