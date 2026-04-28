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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

const stats = [
  { label: "Applications", value: "24", change: "+8 this week", icon: Briefcase },
  { label: "Avg. ATS Score", value: "87%", change: "+12% vs last week", icon: Target },
  { label: "Interviews booked", value: "5", change: "+2 this week", icon: TrendingUp },
  { label: "Time saved", value: "14h", change: "this month", icon: Clock },
];

const quickActions = [
  {
    to: "/dashboard/resume",
    title: "Analyze a resume",
    desc: "Score against any job description.",
    icon: FileSearch,
    color: "from-primary to-primary-glow",
  },
  {
    to: "/dashboard/cover-letter",
    title: "Write a cover letter",
    desc: "Personalized in 15 seconds.",
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
    title: "Track applications",
    desc: "Stay organized.",
    icon: KanbanSquare,
    color: "from-primary-glow to-pink-500",
  },
] as const;

type AnalysisItem = {
  _id: string;
  score: number;
  createdAt: string;
};

function DashboardHome() {
  const [recentActivity, setRecentActivity] = useState<AnalysisItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setActivityLoading(false);
      return;
    }

    const fetchRecentActivity = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/analyze/history", {
          headers: {
            Authorization: token,
          },
        });

        const data = await response.json();
        if (!response.ok || !Array.isArray(data)) {
          setRecentActivity([]);
          return;
        }

        setRecentActivity(data.slice(0, 4));
      } catch {
        setRecentActivity([]);
      } finally {
        setActivityLoading(false);
      }
    };

    fetchRecentActivity();
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, Alex</h1>
          <p className="mt-1.5 text-muted-foreground">
            You've got 3 active applications. Let's land you an interview today.
          </p>
        </div>
        <Button variant="hero" asChild>
          <Link to="/dashboard/resume">
            New analysis <ArrowRight />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elegant"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <s.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-3xl font-bold tracking-tight">{s.value}</div>
            <div className="mt-1 text-xs text-success">{s.change}</div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Quick actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((q) => (
            <Link
              key={q.to}
              to={q.to}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-soft transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-elegant"
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
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent activity</h2>
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
              No recent analyses yet. Run a resume analysis to see activity here.
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {recentActivity.map((item) => (
                <li key={item._id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div>
                    <div className="text-sm font-medium">Resume analysis completed</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                  <Badge variant="outline" className="border-success/30 bg-success/10 text-success">
                    {item.score}% match
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10 via-card to-primary-glow/10 p-6 shadow-soft">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-xs font-medium shadow-soft">
              <Sparkles className="h-3 w-3 text-primary" /> AI Tip of the day
            </div>
            <h3 className="mt-4 text-lg font-semibold">Quantify your impact</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Resumes with numbers (e.g. "increased revenue by 32%") get 40% more callbacks. Try it on
              your top 3 bullets.
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
