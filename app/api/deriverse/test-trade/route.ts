import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { Engine } from '@deriverse/kit';
import { createSolanaRpc, address } from '@solana/kit';

const DERIVERSE_PROGRAM_ID = new PublicKey('Drvrseg8AQLP8B96DBGmHRjFGviFNYTkHueY9g3k27Gu');
const RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Initialize engine
    const rpc = createSolanaRpc(RPC_ENDPOINT);
    const engine = new Engine(rpc, { 
      programId: address(DERIVERSE_PROGRAM_ID.toBase58()),
      version: 12 
    });
    
    await engine.initialize();
    await engine.setSigner(address(walletAddress));

    // Get market info
    const markets = Array.from(engine.instruments.entries()).map(([id, instr]) => ({
      id,
      assetToken: instr.header.assetTokenId,
      currencyToken: instr.header.crncyTokenId,
      lastPrice: instr.header.lastPx,
      bestBid: instr.header.bestBid,
      bestAsk: instr.header.bestAsk,
    }));

    return NextResponse.json({
      success: true,
      data: {
        initialized: true,
        clientId: engine.originalClientId,
        marketsCount: markets.length,
        markets: markets.slice(0, 5), // Return first 5 markets
      }
    });

  } catch (error: any) {
    console.error('Deriverse Test Trade API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to test trade connection',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
