import { Trade, PortfolioStats } from './types';

export function calculateTotalPnl(trades: Trade[]): number {
  return trades.reduce((sum, trade) => sum + trade.pnl, 0);
}

export function calculateWinRate(trades: Trade[]): number {
  if (trades.length === 0) return 0;
  const wins = trades.filter((t) => t.pnl > 0).length;
  return (wins / trades.length) * 100;
}

export function calculateVolume(trades: Trade[]): number {
  return trades.reduce((sum, trade) => sum + (trade.size * trade.entryPrice), 0);
}

export function calculateStats(trades: Trade[]): PortfolioStats {
  if (trades.length === 0) {
    return {
      totalPnl: 0,
      totalVolume: 0,
      totalFees: 0,
      tradeCount: 0,
      winRate: 0,
      averageDuration: 0,
      longShortRatio: { long: 0, short: 0 },
      largestGain: 0,
      largestLoss: 0,
      averageWin: 0,
      averageLoss: 0,
    };
  }

  const totalPnl = calculateTotalPnl(trades);
  const totalFees = trades.reduce((sum, t) => sum + t.fees, 0);
  const totalVolume = trades.reduce((sum, t) => sum + t.size, 0); // Using size as volume (mock data size is position size)
  const winRate = calculateWinRate(trades);
  
  const wins = trades.filter(t => t.pnl > 0);
  const losses = trades.filter(t => t.pnl <= 0);
  
  const averageWin = wins.length > 0 ? wins.reduce((sum, t) => sum + t.pnl, 0) / wins.length : 0;
  const averageLoss = losses.length > 0 ? losses.reduce((sum, t) => sum + t.pnl, 0) / losses.length : 0;
  
  const longs = trades.filter(t => t.side === 'long').length;
  const shorts = trades.filter(t => t.side === 'short').length;
  
  const totalDuration = trades.reduce((sum, t) => sum + t.duration, 0);

  return {
    totalPnl,
    totalVolume,
    totalFees,
    tradeCount: trades.length,
    winRate,
    averageDuration: totalDuration / trades.length,
    longShortRatio: { long: longs, short: shorts },
    largestGain: Math.max(...trades.map(t => t.pnl)),
    largestLoss: Math.min(...trades.map(t => t.pnl)),
    averageWin,
    averageLoss,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
}
