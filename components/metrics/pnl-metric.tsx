'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTrades } from '@/hooks/use-trades';
import { calculateTotalPnl, formatCurrency } from '@/lib/calculations';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PnlMetricProps {
  className?: string;
}

export function PnlMetric({ className }: PnlMetricProps) {
  const { trades, isLoading } = useTrades();
  const totalPnl = calculateTotalPnl(trades);
  const isProfit = totalPnl >= 0;

  if (isLoading) {
    return <Skeleton className="h-[140px] w-full rounded-xl" />;
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Total PnL
        </CardTitle>
        {isProfit ? (
          <TrendingUp className="h-4 w-4 text-profit" />
        ) : (
          <TrendingDown className="h-4 w-4 text-loss" />
        )}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${isProfit ? 'text-profit' : 'text-loss'}`}>
          {formatCurrency(totalPnl)}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          All-time realized profit/loss
        </p>
      </CardContent>
    </Card>
  );
}
