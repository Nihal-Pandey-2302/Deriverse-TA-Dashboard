'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useTrades } from '@/hooks/use-trades';
import { Trade } from '@/lib/types';
import { formatCurrency, formatPercentage } from '@/lib/calculations';
import { format } from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  Search
} from 'lucide-react';

interface TradeHistoryTableProps {
  className?: string;
}

type SortField = 'timestamp' | 'symbol' | 'side' | 'size' | 'pnl';
type SortDirection = 'asc' | 'desc';

export function TradeHistoryTable({ className }: TradeHistoryTableProps) {
  const { trades, isLoading } = useTrades();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  const itemsPerPage = 10;

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Trade History</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  // Filter
  const filteredTrades = trades.filter(trade => 
    trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trade.side.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort
  const sortedTrades = [...filteredTrades].sort((a, b) => {
    let valA: string | number = a[sortField];
    let valB: string | number = b[sortField];

    // Handle special cases if needed, otherwise types match
    
    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginate
  const totalPages = Math.ceil(sortedTrades.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTrades = sortedTrades.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="ml-2 h-3 w-3 text-muted-foreground" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="ml-2 h-3 w-3 text-primary" />
      : <ArrowDown className="ml-2 h-3 w-3 text-primary" />;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Trade History</CardTitle>
            <CardDescription>
              Recent trading activity from your connected wallet
            </CardDescription>
          </div>
          <div className="relative w-[200px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter trades..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset page on filter
              }}
              className="pl-8 h-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort('timestamp')} className="cursor-pointer hover:bg-muted/50">
                  <div className="flex items-center">Date <SortIcon field="timestamp" /></div>
                </TableHead>
                <TableHead onClick={() => handleSort('symbol')} className="cursor-pointer hover:bg-muted/50">
                  <div className="flex items-center">Symbol <SortIcon field="symbol" /></div>
                </TableHead>
                <TableHead onClick={() => handleSort('side')} className="cursor-pointer hover:bg-muted/50">
                  <div className="flex items-center">Side <SortIcon field="side" /></div>
                </TableHead>
                <TableHead onClick={() => handleSort('size')} className="text-right cursor-pointer hover:bg-muted/50">
                  <div className="flex items-center justify-end">Size <SortIcon field="size" /></div>
                </TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead onClick={() => handleSort('pnl')} className="text-right cursor-pointer hover:bg-muted/50">
                   <div className="flex items-center justify-end">PnL <SortIcon field="pnl" /></div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTrades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No trades found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTrades.map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell className="font-medium">
                      {format(new Date(trade.timestamp), 'MMM dd, HH:mm')}
                    </TableCell>
                    <TableCell>{trade.symbol}</TableCell>
                    <TableCell>
                      <Badge variant={trade.side === 'long' ? 'default' : 'secondary'} 
                        className={trade.side === 'long' 
                          ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20' 
                          : 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20'
                        }
                      >
                        {trade.side.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(trade.size)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col">
                        <span>in: {formatCurrency(trade.entryPrice)}</span>
                        <span className="text-xs text-muted-foreground">out: {formatCurrency(trade.exitPrice)}</span>
                      </div>
                    </TableCell>
                    <TableCell className={`text-right font-medium ${trade.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                      {trade.pnl >= 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination Controls */}
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {Math.max(1, totalPages)}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
