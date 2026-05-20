import { Link } from "@tanstack/react-router";
import { Radar } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, to = "/" }: { className?: string; to?: string }) {
  return (
    <Link
      to={to}
      className={cn("group flex items-center gap-2.5 transition-opacity hover:opacity-90", className)}
    >
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-gradient-primary shadow-soft">
        <Radar className="h-5 w-5 text-primary-foreground" strokeWidth={2.4} />
        <span className="absolute inset-0 rounded-xl bg-gradient-primary opacity-0 blur-md transition-opacity group-hover:opacity-70" />
      </div>
      <span className="text-lg font-black tracking-[-0.04em] text-foreground">
        ApplySmart<span className="text-gradient"> AI</span>
      </span>
    </Link>
  );
}
