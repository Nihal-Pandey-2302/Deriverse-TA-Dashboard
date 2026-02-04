'use client';

import { Bell, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WalletConnection } from "@/components/wallet-connection"

export function Header() {
  return (
    <div className="border-b border-white/5 bg-background/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex h-16 items-center px-4 md:px-6">
        <div className="flex items-center gap-2 mr-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <LayoutDashboard className="w-6 h-6 text-primary" />
          </div>
          <span className="font-bold text-xl tracking-tight hidden md:inline-block">Deriv<span className="text-primary">erse</span></span>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <WalletConnection />
        </div>
      </div>
    </div>
  )
}
