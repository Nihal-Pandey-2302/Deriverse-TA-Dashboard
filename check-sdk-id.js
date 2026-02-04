const kit = require('@deriverse/kit');
const { Connection, PublicKey } = require('@solana/web3.js');

console.log('--- SDK Configuration Check ---');

const sdkProgramId = kit.PROGRAM_ID;
console.log('SDK Exported PROGRAM_ID:', sdkProgramId ? sdkProgramId.toString() : 'undefined');

// Let's also check if there are other IDs
if (kit.IDL) console.log('IDL found');

// Re-check Devnet with this specific ID
const connection = new Connection('https://api.devnet.solana.com');

async function checkAccount() {
  if (!sdkProgramId) return;
  
  console.log(`Checking ${sdkProgramId.toString()} on Devnet...`);
  const info = await connection.getAccountInfo(new PublicKey(sdkProgramId));
  console.log('Account Info:', info ? 'Exists' : 'Not Found');
  
  if (info) {
     console.log('Executable:', info.executable);
     console.log('Owner:', info.owner.toString());
  }
}

checkAccount();
