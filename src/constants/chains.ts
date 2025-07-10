export const CHAIN_NAMES: { [key: number]: string } = {
  0: "Farcaster",
  1: "Ethereum",
  10: "Optimism",
  137: "Polygon",
  1514: "Story",
  2818: "Morph",
  5112: "Ham",
  8453: "Base",
  10143: "Arbitrum Nova",
  42161: "Arbitrum",
  84532: "Base Sepolia",
  325000: "Camp Network",
  7777777: "Zora",
  666666666: "Degen Chain",
  999999999: "Zora Testnet",
  123420001114: "Basecamp",
  1315: "Story Testnet"
};

export const TRANSACTION_TYPES = {
  PAYMENT: "PAYMENT",
  MINT: "MINT",
  PUBLISH: "PUBLISH",
  ONCHAIN: "ONCHAIN",
  CONTRACT_DEPLOYMENT: "CONTRACT_DEPLOYMENT"
} as const;

export const TRANSACTION_TYPE_COLORS: { [key: string]: string } = {
  [TRANSACTION_TYPES.PAYMENT]: "bg-blue-100 text-blue-800",
  [TRANSACTION_TYPES.MINT]: "bg-green-100 text-green-800",
  [TRANSACTION_TYPES.PUBLISH]: "bg-purple-100 text-purple-800",
  [TRANSACTION_TYPES.ONCHAIN]: "bg-yellow-100 text-yellow-800",
  [TRANSACTION_TYPES.CONTRACT_DEPLOYMENT]: "bg-orange-100 text-orange-800"
}; 