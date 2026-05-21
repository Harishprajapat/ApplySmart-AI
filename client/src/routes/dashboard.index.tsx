import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowRight,
  ArrowUpRight,
  FileSearch,
  PenLine,
  MessageSquareQuote,
  KanbanSquare,
  TrendingUp,
  Briefcase,
  Target,
  Clock,
  Sparkles,
  RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/use-current-user";
import { type AIHistoryItem, fetchAIHistory, getAIHistoryTypeLabel } from "@/lib/ai-history";
import { fetchDashboardMetrics, type DashboardMetrics } from "@/lib/dashboard-metrics";
import { buildPageMeta } from "@/lib/seo";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: buildPageMeta({
      title: "Dashboard",
      description:
        "See recent AI activity, quick actions, and job search momentum from your ApplySmart AI dashboard.",
    }),
  }),
  component: DashboardHome,
});

const statConfig = [
  { key: "applications", label: "Applications", icon: Briefcase },
  { key: "avgAtsSignal", label: "Avg. ATS Signal", icon: Target },
  { key: "interviewsBooked", label: "Interviews booked", icon: TrendingUp },
  { key: "timeSaved", label: "Time saved", icon: Clock },
] as const;

type MetricCard = {
  key: (typeof statConfig)[number]["key"];
  label: string;
  icon: (typeof statConfig)[number]["icon"];
  value: string;
  change: string;
};

const quickActions = [
  {
    to: "/dashboard/resume",
    title: "Get ATS feedback",
    desc: "See what the filter sees.",
    icon: FileSearch,
    color: "from-primary to-primary-glow",
  },
  {
    to: "/dashboard/cover-letter",
    title: "Generate a job-ready letter",
    desc: "Tailored without sounding fake.",
    icon: PenLine,
    color: "from-blue-500 to-primary",
  },
  {
    to: "/dashboard/interview",
    title: "Prep for interview",
    desc: "Practice with AI feedback.",
    icon: MessageSquareQuote,
    color: "from-fuchsia-500 to-primary-glow",
  },
  {
    to: "/dashboard/jobs",
    title: "Track the hunt",
    desc: "Keep momentum visible.",
    icon: KanbanSquare,
    color: "from-primary-glow to-pink-500",
  },
] as const;

function DashboardHome() {
  const { user } = useCurrentUser();
  const [recentActivity, setRecentActivity] = useState<AIHistoryItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setActivityLoading(false);
      return;
    }

    const fetchRecentActivity = async () => {
      try {
        const data = await fetchAIHistory(token, { limit: 4 });
        setRecentActivity(data.items);
      } catch {
        setRecentActivity([]);
      } finally {
        setActivityLoading(false);
      }
    };

    fetchRecentActivity();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMetricsLoading(false);
      return;
    }

    const fetchMetrics = async () => {
      try {
        setMetricsError(null);
        const data = await fetchDashboardMetrics(token);
        setMetrics(data);
      } catch (error) {
        setMetrics(null);
        setMetricsError(error instanceof Error ? error.message : "Failed to fetch metrics");
      } finally {
        setMetricsLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const retryMetrics = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setMetricsLoading(true);
    setMetricsError(null);

    try {
      const data = await fetchDashboardMetrics(token);
      setMetrics(data);
    } catch (error) {
      setMetrics(null);
      setMetricsError(error instanceof Error ? error.message : "Failed to fetch metrics");
    } finally {
      setMetricsLoading(false);
    }
  };

  const formatTrend = (delta: number | null, options?: { suffix?: string }) => {
    const suffix = options?.suffix || "";
    if (delta === null || delta === 0) return "Same as last week";
    return `${delta > 0 ? "+" : ""}${delta}${suffix}`;
  };

  const metricCards: MetricCard[] = [
    {
      ...statConfig[0],
      value: metrics ? `${metrics.applications.total}` : "—",
      change: metrics
        ? `${metrics.applications.weekly > 0 ? "+" : ""}${metrics.applications.weekly} this week`
        : "Loading",
    },
    {
      ...statConfig[1],
      value: metrics ? `${metrics.avgAtsSignal.average ?? "—"}%` : "—",
      change: metrics
        ? formatTrend(metrics.avgAtsSignal.delta, { suffix: " pts vs last week" })
        : "Loading",
    },
    {
      ...statConfig[2],
      value: metrics ? `${metrics.interviewsBooked.total}` : "—",
      change: metrics
        ? `${metrics.interviewsBooked.weekly > 0 ? "+" : ""}${metrics.interviewsBooked.weekly} this week`
        : "Loading",
    },
    {
      ...statConfig[3],
      value: metrics ? `${metrics.timeSaved.hoursSaved}h` : "—",
      change: metrics ? "saved this month" : "Loading",
    },
  ];

  const displayCards: MetricCard[] = metricsLoading
    ? statConfig.map((s) => ({ ...s, value: "—", change: "Loading" }))
    : metricCards;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Your AI workspace, {user?.name?.split(" ")[0] || "there"}
          </h1>
          <p className="mt-1.5 text-muted-foreground">
            No more guessing in the dark. Pick a role, sharpen the signal, and apply with receipts.
          </p>
        </div>
        <Button variant="hero" asChild>
          <Link to="/dashboard/resume">
            Get ATS Feedback <ArrowRight />
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between gap-3">
        {metricsError ? (
          <Button variant="outline" size="sm" onClick={() => void retryMetrics()} className="ml-auto">
            <RefreshCcw className="h-4 w-4" />
            Retry metrics
          </Button>
        ) : (
          <div />
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 xl:grid-cols-4">
        {displayCards.map((s) => (
          <div
            key={s.key}
            className="rounded-2xl border border-white/10 bg-card/80 p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-elegant"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <s.icon className="h-4 w-4 text-primary" />
            </div>
            {metricsLoading ? (
              <div className="mt-3 space-y-3">
                <Skeleton className="h-8 w-24 bg-white/5" />
                <Skeleton className="h-3 w-28 bg-white/5" />
              </div>
            ) : (
              <>
                <div className="mt-2 text-3xl font-bold tracking-tight">
                  {metricsError ? "—" : s.value}
                </div>
                <div className="mt-1 text-xs text-success">
                  {metricsError ? "Unable to load metrics" : s.change}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Start where the rejection usually starts</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((q) => (
            <Link
              key={q.to}
              to={q.to}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card/80 p-5 shadow-soft transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant"
            >
              <div
                className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${q.color} shadow-soft`}
              >
                <q.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">{q.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{q.desc}</div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-card/80 p-6 shadow-soft lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Your AI Workspace</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/history">View all</Link>
            </Button>
          </div>

          {activityLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="rounded-xl border border-border/50 p-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="mt-2 h-3 w-24" />
                </div>
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
              Your workspace is quiet. Run an ATS scan or generate a cover letter and we will keep it here.
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {recentActivity.map((item) => (
                <li
                  key={item._id}
                  className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="text-sm font-medium">{item.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {getAIHistoryTypeLabel(item.type)} -{" "}
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      item.type === "resume"
                        ? "border-success/30 bg-success/10 text-success"
                        : "border-primary/30 bg-primary/10 text-primary"
                    }
                  >
                    {item.type === "resume" && item.data.atsScore != null
                      ? `${item.data.atsScore}% match`
                      : "Cover letter"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-primary/15 via-card to-accent/20 p-6 shadow-soft">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-xs font-medium shadow-soft">
              <Sparkles className="h-3 w-3 text-primary" /> AI Tip of the day
            </div>
            <h3 className="mt-4 text-lg font-semibold">Make the good stuff louder</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Recruiters skim for proof. Add numbers, ownership, and tools to your strongest bullets so
              your work does not undersell itself.
            </p>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link to="/dashboard/resume">Improve my resume</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
