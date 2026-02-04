import { Trade } from './types';

/**
 * Professional Mock Data Generator
 * 
 * Creates realistic trading data that demonstrates:
 * - Winning streaks and losing streaks
 * - Drawdown and recovery patterns
 * - Multiple symbols (SOL, BTC, ETH, JUP perpetuals)
 * - Various order types and durations
 * - Realistic PnL distribution
 */

const SYMBOLS = [
  'SOL-PERP',
  'BTC-PERP', 
  'ETH-PERP',
  'JUP-PERP',
  'BONK-PERP'
];

const PRICES = {
  'SOL-PERP': 98.5,
  'BTC-PERP': 43200,
  'ETH-PERP': 2450,
  'JUP-PERP': 0.85,
  'BONK-PERP': 0.000012
};

export function generateRealisticMockTrades(): Trade[] {
  const trades: Trade[] = [];
  const now = Date.now();
  let currentBalance = 10000; // Starting balance for realistic PnL

  // Story Arc: Month of trading with realistic patterns
  
  // ============================================
  // WEEK 1: Learning Phase (Mixed results, small positions)
  // ============================================
  addTrade(trades, now, 27, 'SOL-PERP', 'long', 'market', 0.5, 45, 5);   // Small win
  addTrade(trades, now, 26, 'SOL-PERP', 'short', 'limit', 0.3, -25, 3);  // Small loss
  addTrade(trades, now, 25, 'ETH-PERP', 'long', 'market', 0.2, 30, 2);   // Small win
  addTrade(trades, now, 24, 'BTC-PERP', 'long', 'limit', 0.1, -15, 1);   // Small loss
  addTrade(trades, now, 23, 'SOL-PERP', 'short', 'market', 0.4, 35, 4);  // Medium win

  // ============================================
  // WEEK 2: Building Confidence (Winning streak)
  // ============================================
  addTrade(trades, now, 20, 'SOL-PERP', 'long', 'limit', 1.2, 120, 8);   // Good win
  addTrade(trades, now, 19, 'ETH-PERP', 'long', 'market', 0.8, 95, 6);   // Good win
  addTrade(trades, now, 18, 'BTC-PERP', 'long', 'limit', 0.5, 85, 4);    // Good win
  addTrade(trades, now, 17, 'JUP-PERP', 'long', 'market', 2.0, 150, 12); // Great win
  addTrade(trades, now, 16, 'SOL-PERP', 'short', 'limit', 1.5, 110, 10); // Great win

  // ============================================
  // WEEK 3: Overconfidence (Big loss - drawdown event)
  // ============================================
  addTrade(trades, now, 15, 'SOL-PERP', 'long', 'market', 3.0, 75, 15);   // Win
  addTrade(trades, now, 14, 'BTC-PERP', 'long', 'limit', 2.5, -450, 20);  // BIG LOSS - overleveraged
  addTrade(trades, now, 13, 'ETH-PERP', 'short', 'market', 1.0, -120, 8); // Loss (revenge trading)
  addTrade(trades, now, 12, 'SOL-PERP', 'long', 'market', 0.8, -65, 5);   // Small loss

  // ============================================
  // WEEK 4: Recovery & Risk Management (Smaller positions, steady gains)
  // ============================================
  addTrade(trades, now, 10, 'SOL-PERP', 'long', 'limit', 0.6, 55, 6);    // Disciplined win
  addTrade(trades, now, 9, 'ETH-PERP', 'short', 'limit', 0.5, 45, 4);    // Disciplined win
  addTrade(trades, now, 8, 'BTC-PERP', 'long', 'limit', 0.4, 60, 5);     // Disciplined win
  addTrade(trades, now, 7, 'JUP-PERP', 'long', 'market', 1.0, 80, 8);    // Good win
  addTrade(trades, now, 6, 'SOL-PERP', 'short', 'limit', 0.7, -30, 3);   // Small loss (acceptable)
  addTrade(trades, now, 5, 'BONK-PERP', 'long', 'market', 5.0, 95, 10);  // Good win on memecoin
  
  // ============================================
  // CURRENT WEEK: Consistent Performance
  // ============================================
  addTrade(trades, now, 4, 'SOL-PERP', 'long', 'limit', 1.0, 85, 7);     // Good win
  addTrade(trades, now, 3, 'ETH-PERP', 'long', 'market', 0.6, 50, 5);    // Win
  addTrade(trades, now, 2, 'BTC-PERP', 'short', 'limit', 0.5, 65, 4);    // Win
  addTrade(trades, now, 1, 'SOL-PERP', 'long', 'limit', 0.8, 70, 6);     // Recent win
  addTrade(trades, now, 0.5, 'JUP-PERP', 'short', 'market', 1.2, -25, 2); // Small recent loss

  return trades.reverse(); // Most recent first
}

function addTrade(
  trades: Trade[],
  now: number,
  daysAgo: number,
  symbol: string,
  side: 'long' | 'short',
  orderType: 'market' | 'limit',
  sizeMultiplier: number,
  pnl: number,
  durationHours: number
) {
  const basePrice = PRICES[symbol as keyof typeof PRICES] || 100;
  const size = sizeMultiplier * 100;
  const entryPrice = basePrice * (1 + (Math.random() * 0.02 - 0.01)); // ±1% variance
  
  const pnlPercent = pnl / size;
  const exitPrice = side === 'long'
    ? entryPrice * (1 + pnlPercent)
    : entryPrice * (1 - pnlPercent);
  
  // Randomize time of day (±12 hours) so trades aren't all at the same time
  const timeVariance = (Math.random() * 24 - 12) * 60 * 60 * 1000;
  const timestamp = now - (daysAgo * 24 * 60 * 60 * 1000) + timeVariance;
  const duration = durationHours * 60 * 60; // Convert to seconds
  const fees = size * 0.0005; // 0.05% fee (realistic for perps)

  trades.push({
    id: `trade-${trades.length + 1}`,
    timestamp,
    symbol,
    side,
    orderType,
    entryPrice,
    exitPrice,
    size,
    pnl,
    fees,
    duration,
    status: 'closed',
    notes: pnl > 100 ? 'Strong momentum' : pnl < -100 ? 'Cut loss' : undefined,
  });
}

// Generate additional random trades to reach ~50-60 total
export function generateMockTrades(baseCount: number = 30): Trade[] {
  const realistic = generateRealisticMockTrades();
  const additional: Trade[] = [];
  const now = Date.now();

  // Add some filler trades for older history
  for (let i = 0; i < baseCount; i++) {
    const daysAgo = 28 + (i * 0.5); // Older than realistic trades
    const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    const side = Math.random() > 0.5 ? 'long' : 'short';
    const isWin = Math.random() > 0.45;
    const pnl = isWin ? (Math.random() * 60 + 20) : -(Math.random() * 40 + 10);
    
    addTrade(
      additional,
      now,
      daysAgo,
      symbol,
      side,
      Math.random() > 0.6 ? 'limit' : 'market',
      Math.random() * 0.8 + 0.2,
      pnl,
      Math.random() * 10 + 1
    );
  }

  return [...realistic, ...additional.reverse()];
}

export const MOCK_TRADES = generateMockTrades(35);
