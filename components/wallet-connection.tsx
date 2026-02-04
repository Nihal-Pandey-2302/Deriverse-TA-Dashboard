'use client';

import dynamic from 'next/dynamic';

const WalletMultiButton = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
);

export function WalletConnection() {
    return <WalletMultiButton className="!bg-primary hover:!bg-primary/90" />;
}
