'use client';

import { useTradesContext } from '@/contexts/trades-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, FilterX, Radio } from 'lucide-react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { PrintReportButton } from '@/components/features/print-report-button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function DashboardControls() {
  const { filters, setSymbolFilter, setDateRangeFilter, allTrades, isMock, viewMode, setViewMode, setUseMockData, useMockData } = useTradesContext();

  // Extract unique symbols from all trades for dynamic filter options
  const symbols = ['All', ...Array.from(new Set(allTrades.map(t => t.symbol))).sort()];

  // Date Range Handler
  const handleDateSelect = (range: DateRange | undefined) => {
    // Cast react-day-picker DateRange to our internal DateRange (which matches but ensures compat)
    setDateRangeFilter(range as any);
  };

  const clearFilters = () => {
    setSymbolFilter('All');
    setDateRangeFilter(undefined);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2 print:hidden">
      {/* View Mode Toggle */}
      <div className="flex items-center bg-muted rounded-md p-1">
        <Button 
          variant={viewMode === 'personal' ? 'secondary' : 'ghost'} 
          size="sm" 
          onClick={() => setViewMode('personal')}
          className="h-7 text-xs"
        >
          My Trades
        </Button>
        <Button 
          variant={viewMode === 'global' ? 'secondary' : 'ghost'} 
          size="sm" 
          onClick={() => setViewMode('global')}
          className="h-7 text-xs"
        >
          Global Market
        </Button>
      </div>

      {/* Mock Data Toggle */}
      <div className="flex flex-col items-end">
        <div className="flex items-center space-x-2 bg-muted/50 p-1.5 rounded-lg border border-border">
           <Switch 
              id="mock-mode" 
              checked={useMockData} 
              onCheckedChange={setUseMockData}
              className="data-[state=checked]:bg-yellow-500"
           />
           <Label htmlFor="mock-mode" className="text-xs font-medium cursor-pointer">
             {useMockData ? "Mock Mode" : "Live Mode"}
           </Label>
        </div>
        {/* Fallback Warning: User wants Live, but System forced Mock */}
        {!useMockData && isMock && (
            <div className="flex flex-col items-end mt-1">
                <span className="text-[10px] text-yellow-500 font-medium animate-pulse">
                    ⚠️ Waiting for access...
                </span>
                <span className="text-[9px] text-muted-foreground">
                    (Auto-retrying every 30s)
                </span>
            </div>
        )}
      </div>

      <div className="h-4 w-px bg-border mx-2 hidden sm:block" />

      {/* Export */}
      <PrintReportButton />

      <div className="h-4 w-px bg-border mx-2 hidden sm:block" />

      {/* Symbol Filter */}
      <Select value={filters.symbol} onValueChange={setSymbolFilter}>
        <SelectTrigger className="w-[140px] h-9">
          <SelectValue placeholder="Symbol" />
        </SelectTrigger>
        <SelectContent>
          {symbols.map(sym => (
            <SelectItem key={sym} value={sym}>
              {sym}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date Range Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            size="sm"
            className={cn(
              "w-[240px] justify-start text-left font-normal h-9",
              !filters.dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.dateRange?.from ? (
              filters.dateRange.to ? (
                <>
                  {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                  {format(filters.dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(filters.dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={filters.dateRange?.from}
            selected={filters.dateRange as any}
            onSelect={handleDateSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      {/* Clear Filters (only show if filters active) */}
      {(filters.symbol !== 'All' || filters.dateRange) && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 px-2">
          <FilterX className="h-4 w-4 mr-1" />
          Reset
        </Button>
      )}
    </div>
  );
}
