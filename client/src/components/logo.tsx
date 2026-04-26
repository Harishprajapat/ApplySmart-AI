import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, to = "/" }: { className?: string; to?: string }) {
  return (
    <Link
      to={to}
      className={cn("group flex items-center gap-2.5 transition-opacity hover:opacity-90", className)}
    >
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-soft">
        <Sparkles className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
        <span className="absolute inset-0 rounded-xl bg-gradient-primary opacity-0 blur-md transition-opacity group-hover:opacity-60" />
      </div>
      <span className="text-lg font-semibold tracking-tight text-foreground">
        ApplySmart<span className="text-gradient"> AI</span>
      </span>
    </Link>
  );
}
