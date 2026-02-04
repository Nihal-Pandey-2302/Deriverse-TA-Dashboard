"use client";

import { Header } from '@/components/layout/header';
import { PnlMetric } from '@/components/metrics/pnl-metric';
import { WinRateMetric } from '@/components/metrics/win-rate-metric';
import { VolumeMetric } from '@/components/metrics/volume-metric';
import { FeeMetric } from '@/components/metrics/fee-metric';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@solana/wallet-adapter-react";
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, History, PlayCircle } from "lucide-react";
import { testDeriverseConnection } from "@/lib/deriverse-api-client";
import { useConnection } from "@solana/wallet-adapter-react";
import { useState } from "react";

export default function WalletPage() {
  const { connected, publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [isTrading, setIsTrading] = useState(false);

  const handleCreateTestTrade = async () => {
    if (!connected || !publicKey) return;
    setIsTrading(true);
    try {
        const result = await testDeriverseConnection(publicKey.toBase58());
        console.log("Deriverse connection test result:", result);
        alert(`Deriverse connection successful!\\nClient ID: ${result.clientId || 'N/A'}\\nMarkets: ${result.marketsCount || 0}`);
    } catch (e: any) {
        console.error(e);
        alert("Trade failed: " + e.message + "\nMake sure you have Devnet SOL and USDC.");
    } finally {
        setIsTrading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <Header />
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Wallet</h2>
          <div className="flex items-center space-x-2">
              {connected && (
                  <Button onClick={handleCreateTestTrade} disabled={isTrading}>
                      <PlayCircle className="mr-2 h-4 w-4" />
                      {isTrading ? "Creating..." : "Create Test Trade (Devnet)"}
                  </Button>
              )}
          </div>
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Performance</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <PnlMetric />
          <WinRateMetric />
          <VolumeMetric />
          <FeeMetric />
        </div>
      </div>
    </div>
  );
}
