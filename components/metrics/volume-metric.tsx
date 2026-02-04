'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTrades } from '@/hooks/use-trades';
import { calculateStats, formatCurrency } from '@/lib/calculations';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart2 } from 'lucide-react';

interface VolumeMetricProps {
  className?: string;
}

export function VolumeMetric({ className }: VolumeMetricProps) {
  const { trades, isLoading } = useTrades();
  const stats = calculateStats(trades);

  if (isLoading) {
    return <Skeleton className="h-[140px] w-full rounded-xl" />;
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Total Volume
        </CardTitle>
        <BarChart2 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatCurrency(stats.totalVolume)}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Accumulated value traded
        </p>
      </CardContent>
    </Card>
  );
}
