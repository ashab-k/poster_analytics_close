import { createPublicClient, http } from 'viem'
import { base, polygon } from 'viem/chains'

// Create clients for different chains
export const baseClient = createPublicClient({
  chain: base,
  transport: http()
})

export const polygonClient = createPublicClient({
  chain: polygon,
  transport: http()
})

// Helper function to get the appropriate client based on chainId
export const getClient = (chainId: string) => {
  switch (chainId) {
    case '8453':
      return baseClient
    case '137':
      return polygonClient
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`)
  }
} 