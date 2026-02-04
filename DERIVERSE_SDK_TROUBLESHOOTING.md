# Deriverse SDK Integration - Technical Diagnosis

## Status: SDK Initialization Error

The dashboard is currently operating in **Hybrid Mode** (Mock Data fallback) because the `@deriverse/kit` SDK cannot properly initialize with the current Devnet program state.

---

## The Problem

**Error**: `RangeError: The value of "offset" is out of range. It must be >= 0 and <= 336. Received 344`

**Context**: This error occurs during `engine.initialize()` when the SDK attempts to parse the root account data from the Solana RPC.

**Impact**: Real-time position fetching is disabled. The application gracefully degrades to use realistic test data.

---

## Technical Investigation

### Chronology of Attempts

1.  **Direct Client-Side Integration**: Failed due to missing Node.js `Buffer` environment in browser.
2.  **Polyfills**: Failed as `buffer` polyfills do not perfectly emulate the Node.js API required by the SDK.
3.  **Server-Side Architecture (Current)**:
    - Moved SDK logic to Next.js API Routes (`app/api/deriverse/...`).
    - This successfully solved the environment issues.
    - However, the SDK now throws the `offset` RangeError mentioned above.

### Root Cause Analysis

We performed an on-chain inspection of the Deriverse program account to diagnose the mismatch.

**Findings:**

1.  **Account Size**: The on-chain root account is exactly **344 bytes**.
2.  **SDK Expectation**: The `@deriverse/kit` (v1.0.24) appears to expect a structure of **336 bytes** (based on the error message).

**Conclusion**:
There is a version mismatch between the deployed Devnet program and the public SDK. The program has likely been updated with additional fields (increasing size from 336 to 344), but the public SDK schema has not yet been updated to match.

---

## Files Affected

The integration logic is isolated in the following files, ready for when the SDK is updated:

1.  **`app/api/deriverse/trades/route.ts`** - Server-side trade fetching
2.  **`lib/deriverse-sdk.ts`** - Core SDK initialization logic
3.  **`contexts/trades-context.tsx`** - Data fetching strategy (Live vs Mock fallback)
