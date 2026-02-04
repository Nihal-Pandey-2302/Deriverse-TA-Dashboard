# Deriverse SDK Integration - Troubleshooting Guide

## Current Status: ⚠️ SDK Initialization Failing

The dashboard is **fully functional with mock data**, but cannot fetch real Deriverse trades due to an SDK compatibility issue.

---

## The Problem

**Error**: `RangeError: The value of "offset" is out of range. It must be >= 0 and <= 336. Received 344`

**Where it fails**: During `engine.initialize()` when the SDK tries to parse account data from Solana RPC.

**Impact**: Cannot fetch user's real perpetual or spot positions from Deriverse protocol.

---

## What We Tried (Chronologically)

### Attempt 1: Direct Client-Side SDK Integration ❌

**Approach**: Used `@deriverse/kit` directly in browser (React components)
**Result**: Failed - Browser doesn't have full Node.js `Buffer` API
**Error**: `this.buffer.readUint32LE is not a function`

### Attempt 2: Buffer Polyfills ❌

**Approach**: Added `buffer` npm package and polyfills for browser
**Result**: Failed - Polyfill doesn't fully replicate Node.js Buffer behavior
**Error**: Same buffer-related errors

### Attempt 3: Custom RPC Adapter ❌

**Approach**: Created `lib/rpc-adapter.ts` to wrap `Connection` with `Buffer.from()`
**Result**: Failed - SDK still couldn't parse account data correctly
**Error**: RangeError during data parsing

### Attempt 4: Server-Side API Routes ⚠️ (Current)

**Approach**: Moved SDK to Next.js API routes (Node.js environment)

- Created `/api/deriverse/trades` endpoint
- Created `/api/deriverse/test-trade` endpoint
- Used official `createSolanaRpc` pattern from `deriverse/kit-example`
  **Result**: Partially working - SDK runs in Node.js but still fails during initialization
  **Error**: `RangeError: offset out of range` when parsing root state account

### Attempt 5: Version Downgrade ❌

**Approach**: Tried `@deriverse/kit@1.0.22` (older version)
**Result**: Failed - Same offset errors

### Attempt 6: Comprehensive Error Handling ✅

**Approach**: Added try-catch blocks to gracefully fall back to mock data
**Result**: Success - Dashboard works, shows mock data when SDK fails

---

## Root Cause Analysis (CONFIRMED ✅)

We successfully diagnosed the exact cause of the failure using a custom on-chain inspection script (`scripts/inspect-deriverse-account.ts`).

**The Evidence:**

1. **Account Exists**: We found the user's account at address `EnTuRt...JyS`.
2. **Non-Standard Location**: It was NOT at the standard PDA address derived from seeds `['user', wallet]`.
3. **Size Mismatch (The Smoking Gun)**: The on-chain account size is exactly **344 bytes**.
   - The SDK error was `RangeError: ... Received 344`.
   - This confirms the SDK expects a different account structure/version than what is deployed for this user.

**Conclusion**: The user is interacting with an older/different version of the Deriverse program than the current `@deriverse/kit` SDK supports. The SDK tries to read fields at offsets that don't exist or don't match the 344-byte structure.

---

## What You Need to Get Real Data

### Option 1: Contact Deriverse Team (RECOMMENDED) 🎯

**Action**: Ask Deriverse Discord/Twitter about SDK compatibility

**Questions to ask**:

1. "What version of `@deriverse/kit` should I use for current Devnet deployment?"
2. "Is there a known issue with `RangeError: offset out of range` during initialization?"
3. "Can you share a working example repository that successfully fetches user positions?"

**Why this works**: They know their SDK best and can provide the correct version or fix

### Option 2: Use Deriverse REST API (if available)

**Action**: Check if Deriverse has a REST API endpoint

**Example**:

```
GET https://api.deriverse.io/v1/positions/{walletAddress}
```

**Implementation**: Replace `/api/deriverse/trades` to call REST API instead of SDK

**Advantage**: No SDK compatibility issues

### Option 3: Direct On-Chain Data Parsing

**Action**: Parse Deriverse account data directly from Solana

**Steps**:

1. Get Deriverse program account structure (from team or contract code)
2. Use `@solana/buffer-layout` to parse raw account data
3. Decode positions manually

**Code Example**:

```typescript
const accountInfo = await connection.getAccountInfo(userAccountPubkey);
const layout = struct([
  u64("positions"),
  // ... define structure
]);
const decoded = layout.decode(accountInfo.data);
```

**Advantage**: Full control, no SDK dependency
**Disadvantage**: Requires knowing exact account structure

### Option 4: Wait for SDK Update

**Action**: Monitor `@deriverse/kit` npm releases

**Check**: `npm view @deriverse/kit versions`

**Implementation**: Update package.json when new version releases

---

## Quick Win: Test with Different RPC

The issue might be RPC-specific. Try Helius or QuickNode:

```bash
# In .env.local
NEXT_PUBLIC_SOLANA_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_KEY
```

Or use public Solana Devnet RPC:

```bash
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
```

---

## Current Dashboard State

✅ **Working Features**:

- Server-side API architecture
- Spot & Perp position support
- Comprehensive error handling
- Mock data fallback
- All UI components functional

❌ **Blocked Feature**:

- Real Deriverse data fetching (due to SDK issue)

---

## Files Modified for SDK Integration

1. **`app/api/deriverse/trades/route.ts`** - Server-side trade fetching
2. **`app/api/deriverse/test-trade/route.ts`** - SDK connection test
3. **`lib/deriverse-api-client.ts`** - Browser-safe API wrapper
4. **`lib/deriverse-sdk.ts`** - Core SDK logic (server-only)
5. **`contexts/trades-context.tsx`** - Uses API client
6. **`README.md`** - Architecture documentation

---

## Recommended Next Steps

1. **Immediate**: Contact Deriverse team on Discord
2. **Short-term**: Try different RPC endpoints (Helius, QuickNode)
3. **Medium-term**: Wait for SDK update or get REST API access
4. **Long-term**: Implement direct on-chain parsing if needed

---

## Dashboard Submission Strategy

**For bounty submission**:

- ✅ Dashboard works perfectly with mock data
- ✅ All features implemented and polished
- ✅ Server-side architecture is production-ready
- ⚠️ Note in README: "Real data integration blocked by SDK compatibility - awaiting Deriverse team response"

**This is NOT your fault** - it's an SDK version compatibility issue. Your dashboard architecture is solid and ready for real data once the SDK issue is resolved.
