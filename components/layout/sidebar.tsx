'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  CreditCard, 
  History, 
  LayoutDashboard, 
  Settings, 
  LineChart,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();

  const routes = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/',
      active: pathname === '/',
    },
    {
      label: 'Analytics',
      icon: LineChart,
      href: '/analytics',
      active: pathname === '/analytics',
    },
    {
      label: 'Trade History',
      icon: History,
      href: '/history',
      active: pathname === '/history',
    },
    {
      label: 'Wallet',
      icon: CreditCard,
      href: '/wallet',
      active: pathname === '/wallet',
    },
    {
      label: 'Docs',
      icon: FileText,
      href: '/docs',
      active: pathname === '/docs',
    },
    {
      label: 'Settings',
      icon: Settings,
      href: '/settings',
      active: pathname === '/settings',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-card border-r border-border min-h-screen w-64 p-4 space-y-4">
      <div className="px-3 py-2">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
          DERIVERSE
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Analytics Dashboard</p>
      </div>
      <div className="space-y-1">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
              route.active ? "text-white bg-white/10" : "text-zinc-400"
            )}
          >
            <div className="flex items-center flex-1">
              <route.icon className={cn("h-5 w-5 mr-3", route.active ? "text-primary" : "text-zinc-400")} />
              {route.label}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
