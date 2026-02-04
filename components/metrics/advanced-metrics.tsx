'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTrades } from '@/hooks/use-trades';
import { calculateStats, formatCurrency } from '@/lib/calculations';
import { Skeleton } from '@/components/ui/skeleton';
import { Timer, TrendingUp, TrendingDown } from 'lucide-react';

interface AdvancedMetricsProps {
  className?: string;
}

export function AdvancedMetrics({ className }: AdvancedMetricsProps) {
  const { trades, isLoading } = useTrades();
  const stats = calculateStats(trades);

  if (isLoading) {
    return <Skeleton className="h-[140px] w-full rounded-xl" />;
  }

  // Calculate Largest Win/Loss
  let largestWin = 0;
  let largestLoss = 0;
  let totalDuration = 0;

  trades.forEach(t => {
    if (t.pnl > largestWin) largestWin = t.pnl;
    if (t.pnl < largestLoss) largestLoss = t.pnl;
    totalDuration += t.duration;
  });

  const avgDurationSeconds = trades.length > 0 ? totalDuration / trades.length : 0;
  const avgDurationMinutes = Math.round(avgDurationSeconds / 60);

  return (
    <div className={`grid gap-4 md:grid-cols-3 ${className}`}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Avg Duration
          </CardTitle>
          <Timer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {avgDurationMinutes}m
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            per trade
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Best Trade
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-profit" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-profit">
            +{formatCurrency(largestWin)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Top performance
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Worst Trade
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-loss" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-loss">
            {formatCurrency(largestLoss)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Max drawdown
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
