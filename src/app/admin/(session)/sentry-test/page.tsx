"use client";

import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { testSentryServerAction } from "./actions";
import { useState } from "react";

export default function SentryTestPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Sentry Test Page</h1>
      <p className="text-gray-500">
        Use buttons below to trigger errors and verify they appear in Sentry.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Client Side Error */}
        <Card>
          <CardHeader>
            <CardTitle>Client-Side Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              Throws an error immediately in the browser (React Error Boundary
              should catch this, or Sentry global handler).
            </p>
            <Button
              variant="destructive"
              onClick={() => {
                throw new Error(
                  "Sentry Test: Client-Side Error " + new Date().toISOString(),
                );
              }}
            >
              Throw Client Error
            </Button>
          </CardContent>
        </Card>

        {/* Server Action Error */}
        <Card>
          <CardHeader>
            <CardTitle>Server Action Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              Calls a Server Action that throws an error on the server side.
            </p>
            <Button
              disabled={loading}
              onClick={async () => {
                try {
                  setLoading(true);
                  await testSentryServerAction();
                } catch (e) {
                  // Error is expected
                  console.error("Caught expected error:", e);
                } finally {
                  setLoading(false);
                }
              }}
            >
              {loading ? "Testing..." : "Trigger Server Error"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
