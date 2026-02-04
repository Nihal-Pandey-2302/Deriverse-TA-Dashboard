'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Trade, DateRange } from '@/lib/types';
import { fetchGlobalMarketTrades } from '@/lib/solana';
import { fetchDeriverseUserTrades } from '@/lib/deriverse-api-client';
import { MOCK_TRADES } from '@/lib/mock-data';
import { useConnection } from '@solana/wallet-adapter-react';
import { isWithinInterval } from 'date-fns';

type ViewMode = 'personal' | 'global';

interface TradesContextType {
  trades: Trade[]; // This will be the FILTERED trades
  allTrades: Trade[]; // Raw trades
  isLoading: boolean;
  isMock: boolean;
  viewMode: ViewMode;
  error: Error | null;
  filters: {
    symbol: string; // 'All' or specific symbol
    dateRange: DateRange | undefined;
  };
  setSymbolFilter: (symbol: string) => void;
  setDateRangeFilter: (range: DateRange | undefined) => void;
  setViewMode: (mode: ViewMode) => void;
  setUseMockData: (useMock: boolean) => void; // New toggle
  refreshTrades: () => Promise<void>;
}

const TradesContext = createContext<TradesContextType | undefined>(undefined);

export function TradesProvider({ children }: { children: React.ReactNode }) {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [allTrades, setTrades] = useState<Trade[]>([]);
  const [isMock, setIsMock] = useState(false);
  const [useMockData, setUseMockData] = useState(false); // User preference toggle
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('personal');
  const [error, setError] = useState<Error | null>(null);

  // Filters
  const [symbolFilter, setSymbolFilter] = useState<string>('All');
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRange | undefined>(undefined);

  const loadTrades = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (viewMode === 'personal') {
          const walletAddress = publicKey?.toBase58();
          
          if (useMockData) {
               // User forced Mock Data
               setTrades(MOCK_TRADES);
               setIsMock(true);
          } else if (!walletAddress) {
             // No wallet connected - use mock data
             setTrades(MOCK_TRADES);
             setIsMock(true);
          } else {
             // Fetch from SDK API
             const sdkTrades = await fetchDeriverseUserTrades(walletAddress);
             if (sdkTrades.length > 0) {
                 setTrades(sdkTrades);
                 setIsMock(false);
             } else {
                 // API returned 0 trades (SDK failed or no positions)
                 // Use mock data to demonstrate dashboard
                 console.log('No real trades found, using mock data');
                 setTrades(MOCK_TRADES);
                 setIsMock(true);
             }
          }
      } else {
          // Global Mode
          const data = await fetchGlobalMarketTrades();
          setTrades(data);
          setIsMock(false); // Market data is "real" (simulated from real accounts)
      }
      
    } catch (err) {
      console.error('Failed to load trades:', err);
      // Fallback to mock data
      setTrades(MOCK_TRADES);
      setIsMock(true);
      setError(err instanceof Error ? err : new Error('Failed to fetch trades'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTrades();
  }, [publicKey, viewMode, useMockData]); // Added useMockData dependency

  // Derived state: Filtered Trades
  const filteredTrades = useMemo(() => {
    return allTrades.filter(trade => {
      // Symbol Filter
      if (symbolFilter !== 'All' && trade.symbol !== symbolFilter) {
        return false;
      }
      // Date Range Filter
      if (dateRangeFilter?.from) {
        if (!isWithinInterval(new Date(trade.timestamp), {
            start: dateRangeFilter.from,
            end: dateRangeFilter.to || dateRangeFilter.from
        })) {
             return false;
        }
      }
      return true;
    });
  }, [allTrades, symbolFilter, dateRangeFilter]);

  return (
    <TradesContext.Provider value={{ 
      trades: filteredTrades, 
      allTrades, 
      isLoading,
      isMock,
      viewMode,
      error, 
      filters: { 
        symbol: symbolFilter, 
        dateRange: dateRangeFilter 
      },
      setSymbolFilter,
      setDateRangeFilter,
      setViewMode,
      setUseMockData,
      refreshTrades: loadTrades 
    }}>
      {children}
    </TradesContext.Provider>
  );
}

export function useTradesContext() {
  const context = useContext(TradesContext);
  if (context === undefined) {
    throw new Error('useTradesContext must be used within a TradesProvider');
  }
  return context;
}
