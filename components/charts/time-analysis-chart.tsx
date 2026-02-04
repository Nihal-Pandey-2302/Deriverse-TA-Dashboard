'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTrades } from '@/hooks/use-trades';
import { formatCurrency } from '@/lib/calculations';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell
} from 'recharts';
import { getHours } from 'date-fns';

interface TimeAnalysisChartProps {
  className?: string;
}

export function TimeAnalysisChart({ className }: TimeAnalysisChartProps) {
  const { trades, isLoading } = useTrades();

  if (isLoading) {
    return <Skeleton className="h-[350px] w-full rounded-xl" />;
  }

  // Aggregate by Hour of Day (0-23)
  const hourlyData = new Array(24).fill(0).map((_, i) => ({
    hour: i,
    pnl: 0,
    count: 0
  }));

  trades.forEach(trade => {
    const hour = getHours(new Date(trade.timestamp));
    hourlyData[hour].pnl += trade.pnl;
    hourlyData[hour].count += 1;
  });

  // Filter out hours with no trades if desired, or keep 24h view
  // Let's keep 0-23 for consistency but maybe trim edges if empty? 
  // For now, show all 24h to spot patterns.
  
  const data = hourlyData.map(d => ({
    ...d,
    label: `${d.hour}:00`,
    avgPnl: d.count > 0 ? d.pnl / d.count : 0
  }));

  if (trades.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Hourly Performance</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center text-muted-foreground">
          No data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Hourly Performance (Avg PnL)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis 
                dataKey="label" 
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                interval={2} // Show every 3rd label (0, 3, 6...)
              />
              <YAxis 
                tickFormatter={(val) => `$${val}`}
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                cursor={{ fill: 'var(--muted)' }}
                contentStyle={{ 
                  backgroundColor: 'var(--card)', 
                  borderColor: 'var(--border)',
                  borderRadius: '0.5rem',
                }}
                itemStyle={{ color: 'var(--foreground)' }}
                labelStyle={{ color: 'var(--muted-foreground)' }}
                formatter={(value: number | undefined) => [formatCurrency(value || 0), 'Avg PnL']}
              />
              <Bar dataKey="avgPnl" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.avgPnl >= 0 ? "var(--profit)" : "var(--loss)"} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
