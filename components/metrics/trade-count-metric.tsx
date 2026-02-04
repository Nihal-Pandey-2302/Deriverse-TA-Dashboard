'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTrades } from '@/hooks/use-trades';
import { calculateStats } from '@/lib/calculations';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity } from 'lucide-react';

interface TradeCountMetricProps {
  className?: string;
}

export function TradeCountMetric({ className }: TradeCountMetricProps) {
  const { trades, isLoading } = useTrades();
  const stats = calculateStats(trades);

  if (isLoading) {
    return <Skeleton className="h-[140px] w-full rounded-xl" />;
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Total Trades
        </CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {stats.tradeCount}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <div className="flex gap-2">
            <span className="text-blue-400">{stats.longShortRatio.long} Long</span>
            <span className="text-orange-400">{stats.longShortRatio.short} Short</span>
          </div>
          <div className="flex gap-2">
             <span>{trades.filter(t => t.orderType === 'market').length} Mkt</span>
             <span>{trades.filter(t => t.orderType === 'limit').length} Lmt</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
