"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { logError } from "@/lib/telemetry";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    // logError already sends to Sentry, so no need to call Sentry directly again
    logError("unhandled_error_boundary", error, {
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader eyebrow="⚠️ Error" title="Something went wrong!" />
        <CardContent>
          <p className="text-sm text-slate-600 mb-4">
            {error.message || "An unexpected error occurred"}
          </p>
          <Button onClick={reset} className="w-full">
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

