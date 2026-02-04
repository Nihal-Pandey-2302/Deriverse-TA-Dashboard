import { Header } from '@/components/layout/header';
import { PnlChart } from '@/components/charts/pnl-chart';
import { LongShortChart } from '@/components/charts/long-short-chart';
import { DrawdownChart } from '@/components/charts/drawdown-chart';
import { TimeAnalysisChart } from '@/components/charts/time-analysis-chart';

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <Header />
      <div className="flex-1 space-y-6 p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <PnlChart className="col-span-4" />
          <LongShortChart className="col-span-3" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
           <DrawdownChart className="col-span-4" />
           <TimeAnalysisChart className="col-span-3" />
        </div>
      </div>
    </div>
  );
}
