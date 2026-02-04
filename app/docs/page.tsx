'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DocsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Project Documentation</h1>
        <p className="text-muted-foreground">Technical architecture and design decisions for Deriverse Analytics.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>1. High-Level Architecture</CardTitle>
            <CardDescription>Server-Side "BFF" (Backend-for-Frontend) architecture using Next.js 15.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Frontend:</strong> React (Client Components) + Shadcn/UI (Visuals).</li>
              <li><strong>Backend:</strong> Next.js API Routes (<code>app/api/deriverse/...</code>).</li>
              <li><strong>Blockchain:</strong> Server-Side Deriverse SDK instance.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Key Technical Decisions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">🅰️ Running the SDK on the Server</h3>
              <p className="text-sm text-muted-foreground mb-2">Moved all SDK logic to API routes.</p>
              <div className="bg-muted p-3 rounded-md text-sm">
                <strong>Why?</strong> The Deriverse SDK relies on Node.js libraries (Buffer, stream) that don't exist in the browser. Polyfilling creates bloat and fragility.
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">🅱️ The "Hybrid" Data Engine</h3>
              <p className="text-sm text-muted-foreground mb-2">Gracefully falls back to Realistic Mock Data if live fetch fails.</p>
              <div className="bg-muted p-3 rounded-md text-sm">
                <strong>Why?</strong> Resilience. A dashboard showing demo data is a sales tool; an empty dashboard is a failure.
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-900/50">
          <CardHeader>
            <CardTitle className="text-red-500">3. The SDK Compatibility Issue</CardTitle>
            <CardDescription>Diagnosis of the current blocker using on-chain inspection.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg">
                <span className="font-semibold block mb-1">The Mismatch</span>
                SDK expects <strong>336 bytes</strong>.<br/>
                On-Chain Program returns <strong>344 bytes</strong>.
              </div>
              <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg">
                <span className="font-semibold block mb-1">The Result</span>
                SDK throws <code>RangeError</code> during initialization because it tries to read data at offsets that don't match the version.
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              <strong>Fix Required:</strong> Needs either an SDK update or a program update from the Deriverse team.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Feature Recap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">PnL Analysis</Badge>
              <Badge variant="secondary">Win Rate</Badge>
              <Badge variant="secondary">Volume</Badge>
              <Badge variant="secondary">Drawdown Chart</Badge>
              <Badge variant="secondary">Heatmap Analysis</Badge>
              <Badge variant="secondary">Trading Health Score</Badge>
              <Badge variant="secondary">PDF Export</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
