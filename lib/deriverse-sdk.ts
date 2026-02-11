import { Connection, PublicKey, Transaction, TransactionInstruction, AccountMeta } from '@solana/web3.js';
import { Engine } from '@deriverse/kit';
import { Trade } from './types';
import { OrderType } from '@deriverse/kit/dist/structure_models';

// Initialize singleton engine instance
let engine: Engine | null = null;

export const DERIVERSE_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_DERIVERSE_PROGRAM_ID || 'CDESjex4EDBKLwx9ZPzVbjiHEHatasb5fhSJZMzNfvw2'
);

// Helper to convert Experimental SDK Instruction to Legacy Web3 Instruction
function convertInstruction(validIx: any): TransactionInstruction {
    const keys: AccountMeta[] = validIx.accounts.map((acc: any) => {
        const isSigner = acc.role >= 2;
        const isWritable = acc.role === 1 || acc.role === 2 || acc.role === 3;
        
        return {
            pubkey: new PublicKey(acc.address),
            isSigner,
            isWritable
        };
    });

    return new TransactionInstruction({
        programId: new PublicKey(validIx.programAddress),
        keys,
        data: Buffer.from(validIx.data.data ? validIx.data.data : validIx.data) 
    });
}

import { createSolanaRpc, createSolanaRpcSubscriptions_UNSTABLE, address } from '@solana/kit';

export async function getDeriverseEngine(connection: Connection): Promise<Engine> {
  if (engine) return engine;

  console.log("SDK: Initializing Engine with Endpoint:", connection.rpcEndpoint);
  
  // Use the SAME pattern as the official kit-example
  const rpc = createSolanaRpc(connection.rpcEndpoint);
  const rpcSubscriptions = createSolanaRpcSubscriptions_UNSTABLE(
    connection.rpcEndpoint.replace('https://', 'wss://').replace('http://', 'ws://')
  );
  
  // IMPORTANT: Version must be 6 for the current Devnet deployment (Updated per Deriverse Team)
  engine = new Engine(rpc, { 
    programId: address(DERIVERSE_PROGRAM_ID.toBase58()),
    version: 6 
  });
  
  // Initialize the engine (fetches markets, tokens, etc.)
  console.log("SDK: Calling engine.initialize()...");
  await engine.initialize();
  console.log("SDK: Engine initialized.");
  
  return engine;
}

export async function createTestTradeTransaction(connection: Connection, walletPubkey: PublicKey): Promise<Transaction> {
    const engine = await getDeriverseEngine(connection);
    await engine.setSigner(walletPubkey.toBase58() as any);

    // Mints (Devnet)
    const MINT_USDC_STR = 'A2Pz6rVyXuadFkKnhMXd1w9xgSrZd8m8sEGpuGuyFhaj';
    const MINT_SOL_STR = '9pan9bMn5HatX4EJdBwg9VgCa7Uz5HL8N1m5D3NdXejP';

    // Get IDs
    const usdcId = await engine.getTokenId(MINT_USDC_STR as any);
    const solId = await engine.getTokenId(MINT_SOL_STR as any);
    if (usdcId === null || solId === null) throw new Error("Deriverse Tokens not found");

    const instrId = await engine.getInstrId({ assetTokenId: solId, crncyTokenId: usdcId });
    if (instrId === null) throw new Error("Instrument not found");

    const tx = new Transaction();

    // 1. Check Deposit
    const clientData = await engine.getClientData().catch(() => null);
    const deposited = clientData ? (clientData.tokens.get(usdcId)?.amount || 0) : 0;
    
    if (deposited < 100) {
        // Deposit 100 USDC
        // Note: Engine expects string addresses/types.
        const depositIx = await engine.depositInstruction({ tokenId: usdcId, amount: 100 * 1000000 });
        tx.add(convertInstruction(depositIx));
    }

    // 2. Place Trade
    await engine.updateInstrData({ instrId });
    const instr = engine.instruments.get(instrId);
    const price = (instr?.header.lastPx || 100) * 0.95; // 5% below

    const orderIx = await engine.newPerpOrderInstruction({
        instrId,
        price,
        qty: 10 / price,
        side: 0, // Bid
        orderType: OrderType.limit,
    });
    tx.add(convertInstruction(orderIx));
    
    return tx;
}

// --- NEW HELPERS FOR SDK COMPATIBILITY FIX ---

async function findRealUserAccount(connection: Connection, walletAddress: string): Promise<PublicKey | null> {
    const userPubkey = new PublicKey(walletAddress);
    
    // 1. Try Standard PDA first
    const [userPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('user'), userPubkey.toBuffer()],
        DERIVERSE_PROGRAM_ID
    );
    const info = await connection.getAccountInfo(userPDA);
    if (info) return userPDA;

    // 2. Try Search by Owner (Memcmp) - "The Scripts Method"
    // This finds the account even if it's at a weird address or old version
    const accounts = await connection.getProgramAccounts(DERIVERSE_PROGRAM_ID, {
        filters: [
            { memcmp: { offset: 8, bytes: userPubkey.toBase58() } } // Offset 8 is standard for Anchor
        ]
    });

    if (accounts.length > 0) return accounts[0].pubkey;

    // 3. Try offset 0 just in case
    const accounts0 = await connection.getProgramAccounts(DERIVERSE_PROGRAM_ID, {
        filters: [
            { memcmp: { offset: 0, bytes: userPubkey.toBase58() } }
        ]
    });
    
    if (accounts0.length > 0) return accounts0[0].pubkey;

    return null;
}

// ⚠️ Hack: Manually construct ClientData by tricking the SDK
// We fetch the raw data, PAD IT with zeros to satisfy the SDK's length checks,
// and then try to decode it.
export async function getWorkingClientData(connection: Connection, engine: Engine, walletAddress: string): Promise<any> {
    try {
        const accountPubkey = await findRealUserAccount(connection, walletAddress);
        if (!accountPubkey) return null;

        const info = await connection.getAccountInfo(accountPubkey);
        if (!info) return null;

        console.log(`SDK Patch: Found account ${accountPubkey.toBase58()}, size: ${info.data.length}`);

        // FIX: Pad the buffer if it's too small (e.g. 344 bytes vs expected 1000+)
        // This avoids the "RangeError: offset out of range"
        const MIN_SIZE = 5000; // Make it plenty big
        let workingBuffer = info.data;
        
        if (info.data.length < MIN_SIZE) {
            console.log(`SDK Patch: Padding buffer from ${info.data.length} to ${MIN_SIZE} bytes...`);
            const padded = Buffer.alloc(MIN_SIZE);
            info.data.copy(padded); // Copy actual data to start
            workingBuffer = padded;
        }

        // Now we need to use internal Engine methods to parse this.
        // Since 'engine.decodeClientData' might be private, we can try to use 
        // the public cache update method if available, or just parse using the Model if we can import it.
        
        // Strategy: We can't easily invoke private methods.
        // BUT, notice how fetchUserTrades uses 'engine.getClientData()'.
        // If we can't inject the data, maybe we can just return the raw buffer info 
        // and manually extract the ONE thing we care about: Active Positions?
        
        // Actually, let's try to map the raw buffer manually.
        // We verified the ClientID is at offset 8.
        // The Positions might be further down.
        
        return {
            rawBuffer: workingBuffer,
            accountSize: info.data.length,
            padded: true
        };

    } catch (e) {
        console.error("SDK Patch Failed:", e);
        return null;
    }
}

export async function fetchUserTrades(
  connection: Connection,
  walletAddress: string
): Promise<Trade[]> {
  try {
    const engine = await getDeriverseEngine(connection);
    // const userKey = new PublicKey(walletAddress); // Removed, not needed for SDK methods expecting Address string

    // 1. Set Signer (Required to get client data)
    // Note: We are finding the public view, so we set signer to the userKey 
    // to tell the engine who we are interested in.
    await engine.setSigner(walletAddress as any);

    // 2. Get Client Data
    // 2. Get Client Data
    const clientData = await engine.getClientData();
    console.log("SDK: clientData fetched:", clientData); // DEBUG

    if (!clientData) {
      console.log('No client data found.');
      return [];
    }

    const trades: Trade[] = [];

    // 3. Process Perps (Positions & Orders)
    if (clientData.perp && clientData.perp.size > 0) {
      console.log("SDK: Inspecting Perp Data...", clientData.perp);
      for (const [instrId, perpData] of clientData.perp.entries()) {
        try {
          console.log(`SDK: Checking Instr ${instrId}, ClientId ${perpData.clientId}`);
          // Get specific info for this instrument
          const info = await engine.getClientPerpOrdersInfo({
            instrId,
            clientId: perpData.clientId
          });
          console.log(`SDK: Info for ${instrId}:`, info);

          // A. Map Active Position as a "Trade"
          if (info.perps !== 0) {
             console.log("SDK: Found Position!", info.perps);
             trades.push({
               id: `pos-${instrId}-${clientData.clientId}`,
               timestamp: Date.now(), // Approximate
               symbol: `PERP-${instrId} (SOL/USDC)`, // Hardcoded mapping for now or fetch instr name
               side: info.perps > 0 ? 'long' : 'short',
               entryPrice: Math.abs(info.cost / (info.perps || 1)), // Approx entry
               exitPrice: null,
               size: Math.abs(info.perps),
               pnl: info.result / 1000000, // Check decimals! USually USDC is 6 decimals.
               fees: info.fees / 1000000,
               duration: 0,
               orderType: 'market',
               status: 'open'
             });
          }

          // B. Map Open Orders
          if (info.bidsCount > 0 || info.asksCount > 0) {
             const ordersResp = await engine.getClientPerpOrders({
               instrId,
               bidsCount: info.bidsCount,
               asksCount: info.asksCount,
               bidsEntry: info.bidsEntry,
               asksEntry: info.asksEntry
             });
            
             console.log("SDK: Orders found:", ordersResp);

             const processOrders = (orderList: any[], side: 'long' | 'short') => {
                orderList.forEach(order => {
                  trades.push({
                    id: order.id ? order.id.toString() : `ord-${Math.random()}`,
                    timestamp: Date.now(),
                    symbol: `PERP-${instrId}`,
                    side, 
                    entryPrice: Number(order.price) || 0,
                    exitPrice: null,
                    size: Number(order.qty) || 0,
                    pnl: 0,
                    fees: 0,
                    duration: 0,
                    orderType: 'limit',
                    status: 'open'
                  });
                });
             };

             if (ordersResp.bids) processOrders(ordersResp.bids, 'long');
             if (ordersResp.asks) processOrders(ordersResp.asks, 'short');
          }
        } catch (err) {
          console.warn(`Failed to fetch perp info for instr ${instrId}`, err);
        }
      }
    } else {
        console.log("SDK: No Perp Data found in clientData");
    }

    // 4. Fallback: Check Deposits (if no trades, show deposit as a 'closed' trade or something to indicator activity)
    if (trades.length === 0 && clientData.tokens) {
        console.log("SDK: Checking Deposits...", clientData.tokens);
        // If we have USDC balance, show it
        const usdcId = 1; // Assuming 1 from earlier log. Ideally dynamic.
        const token = clientData.tokens.get(usdcId);
        if (token && token.amount > 0) {
            console.log("SDK: Found Deposit!", token.amount);
            trades.push({
                id: `dep-${usdcId}`,
                timestamp: Date.now(),
                symbol: "USDC Deposit",
                side: "long",
                orderType: "market",
                entryPrice: 1,
                exitPrice: 1,
                size: token.amount / 1000000, // 6 decimals
                pnl: 0,
                fees: 0,
                duration: 0,
                notes: "Deposit Balance",
                status: "closed"
            });
        }
    }

    return trades;

  } catch (error) {
    console.error('Error in Deriverse SDK fetch:', error);
    return [];
  }
}
