'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTradesContext } from '@/contexts/trades-context';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
  const { isMock, useMockData, setUseMockData } = useTradesContext();
  const [rpcUrl, setRpcUrl] = useState('');
  
  // Load saved RPC from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('deriverse_custom_rpc');
    if (saved) setRpcUrl(saved);
  }, []);

  const handleSaveRpc = () => {
    if (rpcUrl) {
      localStorage.setItem('deriverse_custom_rpc', rpcUrl);
      alert('Custom RPC saved. Please reload the page to apply.');
    } else {
        localStorage.removeItem('deriverse_custom_rpc');
        alert('Custom RPC cleared.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <Header />
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
            <Badge variant="outline">v1.0.0-beta</Badge>
        </div>

        <div className="grid gap-6">
            
            {/* Data Source Configuration */}
            <Card>
              <CardHeader>
                 <CardTitle>Data Source</CardTitle>
                 <CardDescription>Control how the dashboard fetches trading data.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                        <Label className="text-base">Hybrid Mock Engine</Label>
                        <p className="text-sm text-muted-foreground">
                            When enabled, uses realistic simulation data. <br/>
                            <span className="text-orange-500 text-xs">Recommended if SDK connection fails.</span>
                        </p>
                    </div>
                    <Switch checked={useMockData} onCheckedChange={setUseMockData} />
                </div>
                <div className="p-3 bg-muted rounded-md text-xs font-mono">
                    Current Status: <span className={isMock ? "text-yellow-500" : "text-green-500"}>
                        {isMock ? "USING MOCK DATA" : "USING LIVE DATA"}
                    </span>
                </div>
              </CardContent>
            </Card>

            {/* Network Configuration */}
            <Card>
              <CardHeader>
                 <CardTitle>Network Configuration</CardTitle>
                 <CardDescription>Advanced RPC settings for debugging connection issues.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="rpc">Custom RPC URL</Label>
                    <div className="flex space-x-2">
                        <Input 
                            id="rpc" 
                            placeholder="https://devnet.helius-rpc.com/..." 
                            value={rpcUrl}
                            onChange={(e) => setRpcUrl(e.target.value)}
                        />
                        <Button onClick={handleSaveRpc}>Save</Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Leave empty to use the default Solana Devnet endpoint.
                    </p>
                 </div>
              </CardContent>
            </Card>

            {/* About */}
            <Card>
              <CardHeader>
                 <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                 <p>
                    <strong>Deriverse Analytics</strong> is a community-built dashboard for the Deriverse Protocol.
                 </p>
                 <p>
                    Built with Next.js 15, Tailwind CSS, and the Deriverse SDK.
                 </p>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
