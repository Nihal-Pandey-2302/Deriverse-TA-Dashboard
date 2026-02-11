
import { Connection, PublicKey } from '@solana/web3.js';
import { Engine } from '@deriverse/kit';
import { createSolanaRpc, address } from '@solana/kit';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function verify() {
    const programIdStr = process.env.NEXT_PUBLIC_DERIVERSE_PROGRAM_ID;
    console.log("---------------------------------------------------");
    console.log("Verifying SDK Configuration...");
    console.log("Program ID:", programIdStr);

    if (!programIdStr) {
        throw new Error("Missing NEXT_PUBLIC_DERIVERSE_PROGRAM_ID");
    }

    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com';
    console.log("RPC URL:", rpcUrl);

    // Setup Connection
    const connection = new Connection(rpcUrl);
    const rpc = createSolanaRpc(rpcUrl);

    console.log("Initializing Engine with Version 6...");
    
    try {
        const engine = new Engine(rpc, { 
            programId: address(programIdStr),
            version: 6 as any 
        });

        console.log("Calling engine.initialize()...");
        await engine.initialize();
        
        console.log("✅ SUCCESS: Engine initialized successfully!");
        // console.log("Markets found:", engine.markets.size);
        // console.log("Tokens found:", engine.tokens.size);
        // console.log("Instruments found:", engine.instruments.size);

    } catch (err: any) {
        console.error("❌ FAILURE: Engine initialization failed.");
        console.error("Error Name:", err.name);
        console.error("Error Message:", err.message);
        if (err.stack) console.error(err.stack);
    }
}

verify().catch(console.error);
