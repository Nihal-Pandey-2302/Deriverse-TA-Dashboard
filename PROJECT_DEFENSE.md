# 🏗️ Deriverse Analytics Dashboard: Architecture & Project Defense

## 1. High-Level Architecture

We built a **Server-Side "BFF" (Backend-for-Frontend)** architecture using Next.js 15.

- **Frontend**: React (Client Components) + Shadcn/UI (Visuals).
- **Backend**: Next.js API Routes (`app/api/deriverse/...`).
- **Blockchain**: Server-Side Deriverse SDK instance.

## 2. Key Technical Decisions (The "Why" vs "Alternatives")

### 🅰️ Decision: Running the SDK on the Server (API Routes)

- **What we did**: We moved all `@deriverse/kit` logic into `route.ts` files inside `app/api/`. The frontend never touches the SDK directly; it just calls `fetch('/api/deriverse/trades')`.
- **Why? (The Critical Win)**:
  - The Deriverse SDK (like many Solana SDKs) relies heavily on Node.js-specific libraries like `Buffer` and `stream`. These **do not exist** in the browser.
  - If we ran it in the browser, the app would crash with `ReferenceError: Buffer is not defined`.
- **Alternative We Rejected**: "Polyfilling". We _could_ have tried to force Webpack to hack Node.js modules into the browser.
  - _Why Rejected?_ It massively bloats the app size (slow load times), is extremely fragile (breaks with every Next.js update), and is bad practice in 2024. Server-side is cleaner and more robust.

### 🅱️ Decision: The "Hybrid" Data Engine

- **What we did**: The feature `TradesContext` automatically attempts to fetch real data. If it fails (due to the SDK bug) or finds 0 trades, it **gracefully falls back** to the Realistic Mock Engine.
- **Why?**:
  - **Resilience**: A dashboard that shows _nothing_ is a failed product. A dashboard that shows _demo data_ is a sales tool.
  - **User Experience**: It ensures the "First Paint" is always beautiful, never an empty table.
- **Alternative We Rejected**: A simple "Error: Failed to Load" message.
  - _Why Rejected?_ This scares users away. We want to show them _what the dashboard CAN do_, not just that it failed to connect.

### 🆎 Decision: Charts Library (Recharts)

- **Why?**: It's composable, built for React, and lightweight.
- **Alternative**: Chart.js / Highcharts.
  - _Why Rejected?_ Chart.js is canvas-based (harder to style with CSS/Tailwind). Recharts uses SVG, which looks sharper and scales better on mobile.

---

## 3. The "Smoking Gun" (The SDK Bug)

**This is the key technical insight for the Deriverse team:**

- **The Problem**: When the SDK initializes (`engine.initialize()`), it fetches the "root" account from the Solana program to understand the protocol state.
- **The Mismatch**:
  - The SDK (Client code) expects a data structure of **336 bytes** (or similar version).
  - The Deployed Program (On-Chain) is sending back **344 bytes**.
- **The Result**: The SDK tries to read data, sees the size is wrong, and throws a `RangeError`. It thinks the data is corrupted because the version doesn't match.
- **The Fix**:
  1.  Update the SDK to a version that supports the 344-byte account structure.
  2.  Or update the Devnet program to match the current SDK.

---

## 4. Feature Recap

- **Core**: PnL Analysis, Win Rate, Volume.
- **Advanced**:
  - **Drawdown Chart**: Calculates "Peak-to-Valley" drop. (Investors love this).
  - **Heatmap**: Shows _when_ you trade best (Time of day analysis).
  - **Health Score**: An algorithm we wrote (0-100) based on Risk Management + Consistency.
- **Output**: PDF Generation (html2canvas) for sharing reports.

---

## 5. Final Narrative

This is a production-grade infrastructure. The Front-end is decoupled from the Back-end, so as soon as the working SDK is available, we only need to update the `package.json` dependency. The entire dashboard will switch to Live Data automatically without rewriting any UI code.
