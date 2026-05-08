import { createFileRoute, Link, Outlet, redirect, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileSearch,
  PenLine,
  MessageSquareQuote,
  KanbanSquare,
  Settings,
  Sparkles,
  LogOut,
  ChevronDown,
  Bell,
  Search,
  Clock,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { buildApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard | ApplySmart AI" },
      {
        name: "description",
        content:
          "Open your ApplySmart AI workspace to manage resume analysis, cover letters, interview prep, history, and job tracking.",
      },
    ],
  }),
  beforeLoad: ({ location }) => {
    if (typeof window === "undefined") return;

    const token = window.localStorage.getItem("token");
    if (!token) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: () => (
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  ),
});

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/resume", label: "Resume Analyzer", icon: FileSearch, exact: false },
  { to: "/dashboard/cover-letter", label: "Cover Letter", icon: PenLine, exact: false },
  { to: "/dashboard/interview", label: "Interview Prep", icon: MessageSquareQuote, exact: false },
  { to: "/dashboard/jobs", label: "Job Tracker", icon: KanbanSquare, exact: false },
  { to: "/dashboard/settings", label: "Settings", icon: Settings, exact: false },
  { to: "/dashboard/history", label: "History", icon: Clock, exact: false },
] as const;

function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user } = useCurrentUser();
  const [usage, setUsage] = useState<{
    plan: "free" | "pro";
    limit: number | null;
    used: number;
    remaining: number | null;
    blocked: boolean;
  } | null>(null);

  const userName = user?.name?.trim() || "User";
  const userEmail = user?.email?.trim() || "";
  const initials =
    userName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchUsage = async () => {
      try {
        const response = await fetch(buildApiUrl("/api/analyze/usage"), {
          headers: { Authorization: token },
        });
        if (!response.ok) return;
        const data = await response.json();
        setUsage(data);
      } catch {
        setUsage(null);
      }
    };

    fetchUsage();
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85vw] flex-col transform border-r border-sidebar-border bg-sidebar transition-transform duration-200 lg:static lg:w-64 lg:max-w-none lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border px-5">
          <Logo />
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            const Icon = item.icon;

            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-gradient-primary text-primary-foreground shadow-soft"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mx-3 mb-3 mt-auto rounded-2xl border border-sidebar-border bg-gradient-to-br from-primary/10 to-primary-glow/10 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-primary" />
            {usage?.plan === "pro" ? "Pro plan" : "Free plan"}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {usage?.plan === "pro"
              ? "Unlimited analyses this month."
              : `${usage?.used ?? 0} of ${usage?.limit ?? 5} analyses used this month.`}
          </p>
          {usage?.plan !== "pro" && (
            <Button variant="hero" size="sm" className="mt-3 w-full" asChild>
              <Link to="/pricing">Upgrade to Pro</Link>
            </Button>
          )}
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        <header className="sticky top-0 z-20 flex min-h-16 flex-wrap items-center gap-3 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-xl sm:flex-nowrap sm:px-6 sm:py-0">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle navigation"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </Button>

          <div className="relative order-3 w-full sm:order-none sm:block sm:max-w-md sm:flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search applications, drafts, questions..." className="pl-9" />
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <ThemeToggle />
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-1 flex items-center gap-2 rounded-full p-1 pr-3 transition-colors hover:bg-accent">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">
                    {initials}
                  </div>
                  <span className="hidden text-sm font-medium sm:block">{userName}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="font-semibold">{userName}</div>
                  <div className="text-xs font-normal text-muted-foreground">{userEmail}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/pricing">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Upgrade
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    to="/login"
                    search={{ redirect: undefined }}
                    onClick={() => {
                      localStorage.removeItem("token");
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
