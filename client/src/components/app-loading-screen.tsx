import { Loader2 } from "lucide-react";

export function AppLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="flex max-w-sm flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
        <h1 className="mt-5 text-xl font-semibold tracking-tight">Loading your workspace</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We&apos;re getting your latest AI activity, usage, and dashboard tools ready.
        </p>
      </div>
    </div>
  );
}
