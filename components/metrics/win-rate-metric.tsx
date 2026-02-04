'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTrades } from '@/hooks/use-trades';
import { calculateStats, formatPercentage } from '@/lib/calculations';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface WinRateMetricProps {
  className?: string;
}

export function WinRateMetric({ className }: WinRateMetricProps) {
  const { trades, isLoading } = useTrades();
  const stats = calculateStats(trades);

  if (isLoading) {
    return <Skeleton className="h-[140px] w-full rounded-xl" />;
  }

  const data = [
    { name: 'Wins', value: stats.winRate },
    { name: 'Losses', value: 100 - stats.winRate },
  ];

  const COLORS = ['var(--profit)', 'var(--loss)'];

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Win Rate
        </CardTitle>
      </CardHeader>
      <CardContent className="flex justify-between items-center">
        <div>
          <div className="text-2xl font-bold">
            {formatPercentage(stats.winRate)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {trades.filter(t => t.pnl > 0).length} wins / {trades.filter(t => t.pnl <= 0).length} losses
          </p>
        </div>
        <div className="h-[50px] w-[50px]">
          <PieChart width={50} height={50}>
            <Pie
              data={data}
              cx={25}
              cy={25}
              innerRadius={15}
              outerRadius={25}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </div>
      </CardContent>
    </Card>
  );
}
