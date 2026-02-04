export interface Trade {
  id: string;
  timestamp: number; // Unix timestamp
  symbol: string; // e.g., "SOL/USDC"
  side: "long" | "short";
  orderType: "market" | "limit";
  entryPrice: number; // USD
  exitPrice: number | null; // USD (null if open)
  size: number; // Position size
  pnl: number; // Profit/Loss in USD
  fees: number; // Transaction fees in USD
  duration: number; // Time held in seconds
  notes?: string; // User annotations
  status?: "open" | "closed";
}

export interface PortfolioStats {
  totalPnl: number;
  totalVolume: number;
  totalFees: number;
  tradeCount: number;
  winRate: number;
  averageDuration: number;
  longShortRatio: { long: number; short: number };
  largestGain: number;
  largestLoss: number;
  averageWin: number;
  averageLoss: number;
}

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}
