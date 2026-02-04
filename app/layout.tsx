import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/layout/sidebar';
import { ClientWalletProvider } from '@/components/providers/client-wallet-provider';
import { TradesProvider } from '@/contexts/trades-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Deriverse Analytics',
  description: 'Pro trading analytics for Deriverse',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className={`${inter.className} h-full bg-background text-foreground antialiased selection:bg-primary/20`}>
        <ClientWalletProvider>
          <TradesProvider>
            <div className="flex h-full min-h-screen">
              <Sidebar />
              <main className="flex-1 overflow-y-auto">
                {children}
              </main>
            </div>
          </TradesProvider>
        </ClientWalletProvider>
      </body>
    </html>
  );
}
