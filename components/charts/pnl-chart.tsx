'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTrades } from '@/hooks/use-trades';
import { formatCurrency } from '@/lib/calculations';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { format } from 'date-fns';

interface PnlChartProps {
  className?: string;
}

export function PnlChart({ className }: PnlChartProps) {
  const { trades, isLoading } = useTrades();

  if (isLoading) {
    return <Skeleton className="h-[350px] w-full rounded-xl" />;
  }

  // Process data for chart: Cumulative PnL over time
  // 1. Sort trades by timestamp ascending
  const sortedTrades = [...trades].sort((a, b) => a.timestamp - b.timestamp);
  
  // 2. Calculate cumulative PnL
  let cumulativePnl = 0;
  const data = sortedTrades.map((trade) => {
    cumulativePnl += trade.pnl;
    return {
      date: trade.timestamp,
      pnl: cumulativePnl,
      rawPnl: trade.pnl,
    };
  });

  // If no trades, show empty state or at least one point
  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Historical PnL</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center text-muted-foreground">
          No trade data available
        </CardContent>
      </Card>
    );
  }

  const isPositive = cumulativePnl >= 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Historical PnL</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="gradientPnl" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--profit)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--profit)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradientLoss" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--loss)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--loss)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(val) => format(new Date(val), 'MMM dd')}
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tickFormatter={(val) => `$${val}`}
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--card)', 
                  borderColor: 'var(--border)',
                  borderRadius: '0.5rem',
                }}
                itemStyle={{ color: 'var(--foreground)' }}
                labelStyle={{ color: 'var(--muted-foreground)' }}
                labelFormatter={(label) => format(new Date(label), 'MMM dd, HH:mm')}
                formatter={(value: number | undefined) => [formatCurrency(value || 0), 'Cumulative PnL']}
              />
              <Area
                type="monotone"
                dataKey="pnl"
                stroke={isPositive ? "var(--profit)" : "var(--loss)"}
                fillOpacity={1}
                fill={isPositive ? "url(#gradientPnl)" : "url(#gradientLoss)"}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
