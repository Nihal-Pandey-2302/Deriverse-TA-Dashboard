'use client';

import { useTradesContext } from '@/contexts/trades-context';

export function useTrades() {
  return useTradesContext();
}
