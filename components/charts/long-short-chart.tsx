'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTrades } from '@/hooks/use-trades';
import { calculateStats } from '@/lib/calculations';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';

interface LongShortChartProps {
  className?: string;
}

export function LongShortChart({ className }: LongShortChartProps) {
  const { trades, isLoading } = useTrades();
  const stats = calculateStats(trades);

  if (isLoading) {
    return <Skeleton className="h-[350px] w-full rounded-xl" />;
  }

  const data = [
    { name: 'Long', value: stats.longShortRatio.long },
    { name: 'Short', value: stats.longShortRatio.short },
  ];

  // Only show if there is data
  const hasData = data.some(d => d.value > 0);

  if (!hasData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Long/Short Ratio</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center text-muted-foreground">
          No positions found
        </CardContent>
      </Card>
    );
  }

  const COLORS = ['#3b82f6', '#f97316']; // Blue for Long, Orange for Short

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Long/Short Ratio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full flex items-center justify-center">
          <PieChart width={300} height={300}>
            <Pie
              data={data}
              cx={150}
              cy={150}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--card)', 
                borderColor: 'var(--border)',
                borderRadius: '0.5rem',
              }}
              itemStyle={{ color: 'var(--foreground)' }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </div>
      </CardContent>
    </Card>
  );
}
