'use client';

import { Header } from '@/components/layout/header';
import { PnlMetric } from '@/components/metrics/pnl-metric';
import { WinRateMetric } from '@/components/metrics/win-rate-metric';
import { VolumeMetric } from '@/components/metrics/volume-metric';
import { TradeCountMetric } from '@/components/metrics/trade-count-metric';
import { FeeMetric } from '@/components/metrics/fee-metric';
import { PnlChart } from '@/components/charts/pnl-chart';
import { LongShortChart } from '@/components/charts/long-short-chart';

import { DrawdownChart } from '@/components/charts/drawdown-chart';
import { TimeAnalysisChart } from '@/components/charts/time-analysis-chart';
import { TradeHistoryTable } from '@/components/tables/trade-history-table';
import { DashboardControls } from '@/components/filters/dashboard-controls';
import { AdvancedMetrics } from '@/components/metrics/advanced-metrics';
import { TradingHealthScore } from '@/components/metrics/trading-health-score';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Terminal } from 'lucide-react';
import { useTrades } from '@/hooks/use-trades';

export default function Home() {
  const { trades, isMock, isLoading, viewMode } = useTrades();

  const showEmptyState = !isLoading && trades.length === 0 && viewMode === 'personal';

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <Header />
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
           {/* ... existing header content ... */}
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <DashboardControls />
          </div>
        </div>
        
        {showEmptyState && (
          <Alert className="bg-muted/50 border-primary/20">
            <Terminal className="h-4 w-4" />
            <AlertTitle>No Trading History Found (Devnet)</AlertTitle>
            <AlertDescription>
              We couldn't find any Deriverse trades for this wallet on <strong>Devnet</strong>. 
              <br />
              1. Ensure your wallet is set to Devnet.
              <br />
              2. You might need to make a trade on the Deriverse Testnet first.
              <br />
              3. Or switch to <strong>Mock Mode</strong> above to preview the dashboard.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Top Row: Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <PnlMetric />
          <WinRateMetric />
          <VolumeMetric />
          <TradeCountMetric />
        </div>

        {/* Second Row: Main Visuals */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <PnlChart className="col-span-4" />
          <LongShortChart className="col-span-3" />
        </div>
        
        {/* Third Row: Advanced Analysis */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
           <DrawdownChart className="col-span-4" />
           <TimeAnalysisChart className="col-span-3" />
        </div>

        {/* Bottom Row: Fees & Advanced Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
           <FeeMetric className="col-span-2" />
           <TradingHealthScore className="col-span-2" />
           <AdvancedMetrics className="col-span-3" />
        </div>

        {/* Trade History */}
        <div className="grid gap-4">
           <TradeHistoryTable />
        </div>
      </div>
    </div>
  );
}
