'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTrades } from '@/hooks/use-trades';
import { calculateStats } from '@/lib/calculations';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Heart, ShieldAlert, Trophy } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface TradingHealthScoreProps {
  className?: string;
}

export function TradingHealthScore({ className }: TradingHealthScoreProps) {
  const { trades, isLoading } = useTrades();
  const stats = calculateStats(trades);

  if (isLoading) {
    return <Skeleton className="h-[200px] w-full rounded-xl" />;
  }

  if (trades.length === 0) {
    return (
      <Card className={className}>
         <CardHeader>
           <CardTitle>Trading Health</CardTitle>
         </CardHeader>
         <CardContent>No trades to analyze</CardContent>
      </Card>
    );
  }

  // --- SCORE CALCULATION ALGORITHM ---
  
  // 1. Win Rate Score (Target: 40-60%)
  // Too high (>80%) might mean taking small profits too early (scalping)
  // Too low (<30%) means bad strategy unless high R:R
  let winRateScore = 0;
  const wr = stats.winRate;
  if (wr >= 40 && wr <= 65) winRateScore = 100;
  else if (wr > 65) winRateScore = 80;
  else if (wr >= 30) winRateScore = 70;
  else winRateScore = 40;

  // 2. Risk/Reward Score (Avg Win / Avg Loss)
  // Target: > 1.5
  const avgWin = stats.averageWin || 0;
  const avgLoss = Math.abs(stats.averageLoss || 1); // Avoid div by zero
  const rrRatio = avgWin / avgLoss;
  
  let rrScore = 0;
  if (rrRatio >= 2.0) rrScore = 100;
  else if (rrRatio >= 1.5) rrScore = 90;
  else if (rrRatio >= 1.0) rrScore = 70;
  else rrScore = 50;

  // 3. Drawdown Score (Resilience)
  // Lower is better. > 20% drawdown is bad.
  // We don't have max drawdown pre-calculated in stats, let's approximate from biggest loss vs total PnL
  // Ideally we use a helper, but let's use Largest Loss / Current Balance proxy
  const largestLoss = Math.abs(stats.largestLoss);
  // Assume starting capital 10,000 for relative scoring
  const estimatedDrawdown = largestLoss / 10000; 
  
  let riskScore = 0;
  if (estimatedDrawdown < 0.05) riskScore = 100; // <5% loss
  else if (estimatedDrawdown < 0.10) riskScore = 80;
  else if (estimatedDrawdown < 0.20) riskScore = 60;
  else riskScore = 40;

  // WEIGHTED TOTAL
  // 30% WinRate, 40% Risk/Reward, 30% Risk Management
  const totalScore = Math.round(
    (winRateScore * 0.3) + 
    (rrScore * 0.4) + 
    (riskScore * 0.3)
  );

  // Determine Grade
  let grade = 'F';
  let color = 'text-red-500';
  if (totalScore >= 90) { grade = 'A+'; color = 'text-green-500'; }
  else if (totalScore >= 80) { grade = 'A'; color = 'text-green-500'; }
  else if (totalScore >= 70) { grade = 'B'; color = 'text-blue-500'; }
  else if (totalScore >= 60) { grade = 'C'; color = 'text-yellow-500'; }
  else { grade = 'D'; color = 'text-orange-500'; }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Trading Health Score</CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
           <div>
             <div className={`text-3xl font-bold ${color}`}>{totalScore}/100</div>
             <p className="text-xs text-muted-foreground mt-1">Grade: {grade}</p>
           </div>
           
           <div className="flex flex-col gap-1 text-right text-xs text-muted-foreground">
              <span className={rrScore > 80 ? "text-green-500" : "text-yellow-500"}>
                 R:R Ratio: {rrRatio.toFixed(2)}
              </span>
              <span className={winRateScore > 80 ? "text-green-500" : "text-yellow-500"}>
                 Win Rate: {wr.toFixed(1)}%
              </span>
           </div>
        </div>

        <Progress value={totalScore} className="h-2 mt-4" />
        
        <div className="mt-4 grid grid-cols-2 gap-2">
           <div className="bg-muted/50 p-2 rounded text-xs flex items-center gap-2">
              <Trophy className="h-3 w-3 text-yellow-500" />
              <span>Consistency: {winRateScore >= 80 ? "Excellent" : "Good"}</span>
           </div>
           <div className="bg-muted/50 p-2 rounded text-xs flex items-center gap-2">
              <ShieldAlert className="h-3 w-3 text-blue-500" />
              <span>Risk Mgmt: {riskScore >= 80 ? "Solid" : "Review"}</span>
           </div>
        </div>
      </CardContent>
    </Card>
  );
}
