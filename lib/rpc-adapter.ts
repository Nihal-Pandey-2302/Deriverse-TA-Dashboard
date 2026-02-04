import { Connection, PublicKey } from '@solana/web3.js';
import { Buffer } from 'buffer';

/**
 * Adapter that wraps a legacy @solana/web3.js Connection
 * and exposes an interface compatible with @solana/kit RPC
 * as expected by @deriverse/kit
 */
export function createRpcAdapter(connection: Connection) {
  return {
    getAccountInfo(addressString: string, config?: { commitment?: string; encoding?: string }) {
      return {
        async send() {
          const pubkey = new PublicKey(addressString);
          const info = await connection.getAccountInfo(pubkey, config?.commitment as any);
          if (!info) {
            return { context: { slot: 0 }, value: null };
          }
          // Convert to the format @solana/kit returns
          // IMPORTANT: Ensure data is a proper Node.js Buffer with readUint32LE
          return {
            context: { slot: 0 },
            value: {
              data: Buffer.from(info.data), // Ensure proper Buffer with all methods
              executable: info.executable,
              lamports: BigInt(info.lamports),
              owner: info.owner.toBase58(),
              rentEpoch: BigInt(info.rentEpoch || 0),
              space: BigInt(info.data.length)
            }
          };
        }
      };
    },

    getMultipleAccounts(addresses: string[], config?: { commitment?: string; encoding?: string }) {
      // MUST return object with .send() method, not a direct Promise
      return {
        async send() {
          const pubkeys = addresses.map(addr => new PublicKey(addr));
          const infos = await connection.getMultipleAccountsInfo(pubkeys, config?.commitment as any);
          
          return {
            context: { slot: 0 },
            value: infos.map(info => {
              if (!info) return null;
              return {
                data: Buffer.from(info.data), // Ensure proper Buffer with all methods
                executable: info.executable,
                lamports: BigInt(info.lamports),
                owner: info.owner.toBase58(),
                rentEpoch: BigInt(info.rentEpoch || 0),
                space: BigInt(info.data.length)
              };
            })
          };
        }
      };
    },

    getSlot(config?: { commitment?: string }) {
      return {
        async send() {
          return BigInt(await connection.getSlot(config?.commitment as any));
        }
      };
    },

    getLatestBlockhash(config?: { commitment?: string }) {
      return {
        async send() {
          const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash(config?.commitment as any);
          return {
            context: { slot: 0 },
            value: {
              blockhash,
              lastValidBlockHeight: BigInt(lastValidBlockHeight)
            }
          };
        }
      };
    },

    sendTransaction(transaction: any, config?: any) {
      return {
        async send() {
          const signature = await connection.sendRawTransaction(transaction);
          return signature;
        }
      };
    }
  };
}
