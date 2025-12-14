"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <h1 className="text-6xl font-bold">Error</h1>
      <p className="text-xl text-muted-foreground mt-4">Something went wrong</p>
      <Button onClick={reset} className="mt-8">
        Try again
      </Button>
    </div>
  );
}
