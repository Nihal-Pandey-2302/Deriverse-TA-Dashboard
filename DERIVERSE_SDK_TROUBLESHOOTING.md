## Current Status: ✅ SDK Issue Resolved

The dashboard is fully configured to use the correct Deriverse Devnet Program ID (`CDES...`) and Version (`6`).

**Note**: To fetch real trade data, your wallet must be **whitelisted** on the Deriverse Devnet. Please follow the instructions in the Deriverse Discord if you see 0 balances.

---

## The Solution

**Root Cause**: The SDK defaults to an older Program ID and Version (`12`). The current Devnet deployment uses a different ID and Version (`6`).

**Fix Applied**:

1. Updated `NEXT_PUBLIC_DERIVERSE_PROGRAM_ID` to `CDESjex4EDBKLwx9ZPzVbjiHEHatasb5fhSJZMzNfvw2`.
2. Updated SDK initialization to use `version: 6`.
3. Validated initialization with script `scripts/verify-sdk-version.ts`.

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
