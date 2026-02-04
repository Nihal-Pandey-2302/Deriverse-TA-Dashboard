'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTrades } from '@/hooks/use-trades';
import { calculateStats, formatCurrency } from '@/lib/calculations';
import { Skeleton } from '@/components/ui/skeleton';
import { Ticket } from 'lucide-react';

interface FeeMetricProps {
  className?: string;
}

export function FeeMetric({ className }: FeeMetricProps) {
  const { trades, isLoading } = useTrades();
  const stats = calculateStats(trades);

  if (isLoading) {
    return <Skeleton className="h-[140px] w-full rounded-xl" />;
  }

  // Calculate percentage of pnl that went to fees
  const feePercentage = stats.totalPnl !== 0 
    ? (stats.totalFees / Math.abs(stats.totalPnl)) * 100 
    : 0;

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Fees Paid
        </CardTitle>
        <Ticket className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatCurrency(stats.totalFees)}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          ~{feePercentage.toFixed(1)}% of PnL magnitude
        </p>
      </CardContent>
    </Card>
  );
}
