
import { Connection, PublicKey } from '@solana/web3.js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const PROGRAM_ID = new PublicKey('Drvrseg8AQLP8B96DBGmHRjFGviFNYTkHueY9g3k27Gu');
const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

async function main() {
  const walletAddr = process.argv[2];
  if (!walletAddr) {
    console.error('Usage: ts-node scripts/inspect-deriverse-account.ts <WALLET_ADDRESS>');
    process.exit(1);
  }

  console.log(`\n🔍 Inspecting Deriverse Account`);
  console.log(`------------------------------`);
  console.log(`RPC: ${RPC_URL}`);
  console.log(`Program: ${PROGRAM_ID.toBase58()}`);
  console.log(`User Wallet: ${walletAddr}`);

  const connection = new Connection(RPC_URL, 'confirmed');
  const userPubkey = new PublicKey(walletAddr);

  // 1. Try to find the account by searching all program accounts
  // This is slower but guarantees we find it if it exists, regardless of seeds
  console.log(`\n🕵️ Searching all program accounts for owner: ${walletAddr}...`);
  
  // We'll assume the user's wallet address is stored SOMEWHERE in the account
  // efficiently using memcmp. Common offsets: 0, 8, 32, 40 etc.
  // But since we don't know the offset, we'll fetch all and filter client-side 
  // (Devnet volume is low, so this is fine for a script)
  
  const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
    filters: [
      {
        memcmp: {
          offset: 0, // Try offset 0 first (unlikely if anchor, but possible)
          bytes: userPubkey.toBase58()
        }
      }
    ]
  });

  if (accounts.length > 0) {
     console.log(`\n✅ Found ${accounts.length} accounts with user pubkey at offset 0!`);
     accounts.forEach(acc => {
         console.log(`- Address: ${acc.pubkey.toBase58()} (Size: ${acc.account.data.length})`);
         processAccountData(acc.account.data);
     });
     return;
  }
  
  // Try Offset 8 (Standard Anchor Account: 8 byte discriminator + Pubkey)
  console.log("Checking offset 8 (Standard Anchor)...");
   const accounts8 = await connection.getProgramAccounts(PROGRAM_ID, {
    filters: [
      {
        memcmp: {
          offset: 8,
          bytes: userPubkey.toBase58()
        }
      }
    ]
  });
  
  if (accounts8.length > 0) {
     console.log(`\n✅ Found ${accounts8.length} accounts with user pubkey at offset 8!`);
     accounts8.forEach(acc => {
         console.log(`- Address: ${acc.pubkey.toBase58()} (Size: ${acc.account.data.length})`);
         processAccountData(acc.account.data);
     });
     return;
  }
  
   console.log("Checking plain getProgramAccounts...");
  // Failsafe: Fetch 10 largest accounts and print them just to see structure
  const allAccounts = await connection.getProgramAccounts(PROGRAM_ID);
  console.log(`Total Program Accounts: ${allAccounts.length}`);
  
  if (allAccounts.length === 0) {
      console.log("❌ No accounts found for this program. Is the Program ID correct?");
  } else {
      console.log("Sampling first 3 accounts to guess structure:");
      allAccounts.slice(0, 3).forEach(acc => {
           console.log(`\nAccount: ${acc.pubkey.toBase58()} (Size: ${acc.account.data.length})`);
           processAccountData(acc.account.data);
      });
  }
}

function processAccountData(data: Buffer) {
  console.log(`\n🔢 Raw Data Inspection:`);
  console.log(`-----------------------`);
  
  // Print first 64 bytes in Hex
  console.log(`First 64 bytes (Hex):`);
  console.log(data.slice(0, 64).toString('hex').match(/.{1,2}/g)?.join(' '));

  // Try to interpret fields
  try {
    // Usually starts with 8-byte discriminator (Anchor)
    const discriminator = data.slice(0, 8);
    console.log(`\nDiscriminator (u64): 0x${discriminator.toString('hex')}`);

    // Try reading Client ID (usually u64 at offset 8)
    const clientId = data.readBigUInt64LE(8);
    console.log(`Possible Client ID (offset 8): ${clientId.toString()}`);

    // Look for "336" (the offset error mentioned earlier might be a hint)
    // The error was "offset out of range... received 344".
    // This implies the SDK expected a buffer length of at least 344+something but got less? 
    // OR it tried to read at 344 and buffer ended.

  } catch (err: any) {
    console.log(`Error decoding basic fields: ${err.message}`);
  }
}

main().catch(console.error);
