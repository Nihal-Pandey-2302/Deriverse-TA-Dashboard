/**
 * Client-side API wrapper for Deriverse server-side endpoints
 * 
 * The Deriverse SDK (@deriverse/kit) requires Node.js Buffer APIs that don't work in browsers.
 * This file provides functions that call server-side API routes where the SDK runs correctly.
 */

import { Trade } from './types';

/**
 * Fetch user trades from Deriverse using server-side API route
 */
export async function fetchDeriverseUserTrades(walletAddress: string): Promise<Trade[]> {
  try {
    console.log("Fetching trades from Deriverse API for wallet:", walletAddress);
    
    const response = await fetch(`/api/deriverse/trades?wallet=${encodeURIComponent(walletAddress)}`);
    const result = await response.json();

    if (!result.success) {
      console.error("API Error:", result.error);
      return [];
    }

    const { data } = result;
    const trades: Trade[] = [];

    // Convert positions to trades format
    if (data.positions && Array.isArray(data.positions)) {
      for (const position of data.positions) {
        const symbolPrefix = position.type === 'perp' ? 'PERP' : 'SPOT';
        // Process bids as BUY/LONG trades
        if (position.bids && position.bids.length > 0) {
          for (const bid of position.bids) {
            trades.push({
              id: `${position.instrId}-bid-${bid.orderId || Date.now()}`,
              timestamp: Date.now(),
              symbol: `${symbolPrefix}-${position.instrId}`,
              side: 'long',
              entryPrice: bid.price || 0,
              exitPrice: null,
              size: bid.qty || 0,
              pnl: 0,
              fees: 0,
              duration: 0,
              orderType: 'limit',
              status: 'open',
            });
          }
        }

        // Process asks as SELL/SHORT trades
        if (position.asks && position.asks.length > 0) {
          for (const ask of position.asks) {
            trades.push({
              id: `${position.instrId}-ask-${ask.orderId || Date.now()}`,
              timestamp: Date.now(),
              symbol: `${symbolPrefix}-${position.instrId}`,
              side: 'short',
              entryPrice: ask.price || 0,
              exitPrice: null,
              size: ask.qty || 0,
              pnl: 0,
              fees: 0,
              duration: 0,
              orderType: 'limit',
              status: 'open',
            });
          }
        }
      }
    }

    console.log(`✅ Fetched ${trades.length} trades from Deriverse`);
    return trades;

  } catch (error: any) {
    console.error("Error fetching Deriverse trades:", error);
    return [];
  }
}

/**
 * Test Deriverse connection using server-side API
 */
export async function testDeriverseConnection(walletAddress: string) {
  try {
    console.log("Testing Deriverse connection via API...");
    
    const response = await fetch('/api/deriverse/test-trade', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ walletAddress }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to test connection');
    }

    console.log("✅ Deriverse connection test successful:", result.data);
    return result.data;

  } catch (error: any) {
    console.error("Error testing Deriverse connection:", error);
    throw error;
  }
}
