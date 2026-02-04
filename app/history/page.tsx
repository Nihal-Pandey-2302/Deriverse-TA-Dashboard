import { Header } from '@/components/layout/header';
import { TradeHistoryTable } from '@/components/tables/trade-history-table';

export default function HistoryPage() {
  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <Header />
      <div className="flex-1 space-y-6 p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">Trade History</h2>
        <TradeHistoryTable />
      </div>
    </div>
  );
}
