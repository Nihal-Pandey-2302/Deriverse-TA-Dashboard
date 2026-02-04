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

interface DrawdownChartProps {
  className?: string;
}

export function DrawdownChart({ className }: DrawdownChartProps) {
  const { trades, isLoading } = useTrades();

  if (isLoading) {
    return <Skeleton className="h-[350px] w-full rounded-xl" />;
  }

  // Calculate Drawdown
  // 1. Sort trades
  const sortedTrades = [...trades].sort((a, b) => a.timestamp - b.timestamp);
  
  let cumulativePnl = 0;
  let maxPnl = 0;
  
  const data = sortedTrades.map((trade) => {
    cumulativePnl += trade.pnl;
    
    // Max PnL reached so far
    if (cumulativePnl > maxPnl) {
      maxPnl = cumulativePnl;
    }
    
    // Drawdown = Current PnL - Max PnL
    const drawdown = cumulativePnl - maxPnl;
    
    return {
      date: trade.timestamp,
      drawdown: drawdown,
    };
  });

  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Drawdown</CardTitle>
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
        <CardTitle>Drawdown Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="gradientDrawdown" x1="0" y1="0" x2="0" y2="1">
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
                itemStyle={{ color: 'var(--loss)' }}
                labelStyle={{ color: 'var(--muted-foreground)' }}
                labelFormatter={(label) => format(new Date(label), 'MMM dd, HH:mm')}
                formatter={(value: number | undefined) => [formatCurrency(value || 0), 'Drawdown from Peak']}
              />
              <Area
                type="monotone"
                dataKey="drawdown"
                stroke="var(--loss)"
                fillOpacity={1}
                fill="url(#gradientDrawdown)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
