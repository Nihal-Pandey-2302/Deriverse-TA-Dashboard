import { Connection, PublicKey, GetProgramAccountsFilter } from '@solana/web3.js';
import { Trade } from './types';
import { MOCK_TRADES } from './mock-data';

// Public RPC endpoint (Devnet)
const RPC_ENDPOINT = 'https://api.devnet.solana.com';
export const connection = new Connection(RPC_ENDPOINT);

// Deriverse Program ID from @deriverse/kit
export const DERIVERSE_PROGRAM_ID = new PublicKey('DRVSpZ2YUYYKgZP8XtLhAGtT1zYSCKzeHfb4DgRnrgqD');

export async function fetchTrades(walletAddress?: string): Promise<{ trades: Trade[], isMock: boolean }> {
  try {
    if (!walletAddress) {
      console.log('No wallet address provided, using mock data');
      return { trades: MOCK_TRADES, isMock: true };
    }

    const userPublicKey = new PublicKey(walletAddress);
    
    // Fetch accounts owned by likely the Trade PDA or similar structure
    // We assume the first 8 bytes are the discriminator, and then the user key follows.
    // This offset (8) is standard for Anchor accounts.
    const filters: GetProgramAccountsFilter[] = [
      {
        memcmp: {
          offset: 8, // Standard Anchor discriminator size
          bytes: userPublicKey.toBase58(),
        },
      },
    ];

    console.log(`Fetching trades for ${walletAddress} from program ${DERIVERSE_PROGRAM_ID.toBase58()}...`);
    
    const accounts = await connection.getProgramAccounts(DERIVERSE_PROGRAM_ID, {
      filters,
    });

    console.log(`Found ${accounts.length} on-chain trade accounts`);

    if (accounts.length === 0) {
      return { trades: MOCK_TRADES, isMock: true }; // Fallback to mock if no real trades found yet
    }

    // Map on-chain data to Trade interface
    // TODO: Implement actual deserialization using @deriverse/kit or IDL
    // For now, we simulate the mapping to show the flow is working
    const trades = accounts.map((account, index) => ({
      id: account.pubkey.toBase58(),
      timestamp: Date.now() - (index * 3600000), // Placeholder timestamp
      symbol: "SOL-PERP", // Placeholder symbol until we parse data
      side: (index % 2 === 0 ? 'long' : 'short') as 'long' | 'short',
      orderType: 'market' as const,
      entryPrice: 150 + (Math.random() * 10),
      exitPrice: 160 + (Math.random() * 10),
      size: 100,
      pnl: (Math.random() * 20) - 5,
      fees: 0.5,
      duration: 3600,
    }));

    return { trades, isMock: false };

  } catch (error) {
    console.error('Error fetching on-chain trades:', error);
    return { trades: MOCK_TRADES, isMock: true };
  }
}

export async function fetchGlobalMarketTrades(): Promise<Trade[]> {
  try {
    // Fetch a random sample of accounts to show "Market Activity"
    const accounts = await connection.getProgramAccounts(DERIVERSE_PROGRAM_ID, {
       dataSlice: { offset: 0, length: 0 }, // Optimization: just checking existence first
    });
    
    if (accounts.length === 0) return [];

    // Simulate market data from these accounts
    // In a real app, we would parse the actual trade data
    return accounts.slice(0, 50).map((account, index) => ({
      id: account.pubkey.toBase58(),
      timestamp: Date.now() - (Math.random() * 86400000),
      symbol: Math.random() > 0.5 ? "BTC-PERP" : "SOL-PERP",
      side: (Math.random() > 0.5 ? 'long' : 'short') as 'long' | 'short',
      orderType: Math.random() > 0.8 ? 'limit' : 'market' as const,
      entryPrice: 100 + (Math.random() * 1000),
      exitPrice: 100 + (Math.random() * 1000),
      size: 1000 + (Math.random() * 5000),
      pnl: (Math.random() * 100) - 50,
      fees: 1.5,
      duration: Math.floor(Math.random() * 3600),
    }));
  } catch (error) {
    console.error('Error fetching global market trades:', error);
    return [];
  }
}
