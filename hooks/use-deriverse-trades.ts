import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Trade } from '@/lib/types';
import { fetchUserTrades } from '@/lib/deriverse-sdk';

export function useDeriverseTrades(address?: string) {
  const { connection } = useConnection();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function load() {
      if (!address) {
        setTrades([]);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        console.log('Fetching Deriverse trades for:', address);
        const data = await fetchUserTrades(connection, address);
        setTrades(data);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err : new Error('Failed to load trades'));
        setTrades([]);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [connection, address]);

  return { trades, isLoading, error };
}
