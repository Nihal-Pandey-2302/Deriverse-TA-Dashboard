
const { createSolanaRpc, address } = require('@solana/kit');

async function test() {
    console.log("Creating RPC...");
    const rpc = createSolanaRpc('https://api.devnet.solana.com');
    
    console.log("RPC created:", rpc);
    console.log("Has getAccountInfo?", !!rpc.getAccountInfo);
    
    const addr = address('Drvrseg8AQLP8B96DBGmHRjFGviFNYTkHueY9g3k27Gu'); // Just a random address
    
    try {
        console.log("Calling getAccountInfo...");
        const pending = rpc.getAccountInfo(addr, { encoding: 'base64' });
        console.log("Pending request:", pending);
        console.log("Has send?", !!pending.send);
        
        const result = await pending.send();
        console.log("Result:", result);
    } catch (e) {
        console.error("Error:", e);
    }
}

test();
