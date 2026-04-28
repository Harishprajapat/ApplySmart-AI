import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Clock3, FileText, Target } from "lucide-react";

type AnalysisItem = {
  _id: string;
  score: number;
  matched: string[];
  missing: string[];
  suggestions: string[];
  createdAt: string;
};

export const Route = createFileRoute("/dashboard/history")({
  component: HistoryPage,
});

function HistoryPage() {
  const [items, setItems] = useState<AnalysisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to view your analysis history.");
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/analyze/history", {
          headers: {
            Authorization: token,
          },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.message || data?.error || "Failed to fetch history");
        }

        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch history";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const totalAnalyses = items.length;
  const averageScore = useMemo(() => {
    if (!items.length) return 0;
    const sum = items.reduce((acc, item) => acc + (item.score || 0), 0);
    return Math.round(sum / items.length);
  }, [items]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analysis History</h1>
        <p className="mt-1.5 text-muted-foreground">Review your previous resume analyses and results.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            Total analyses
          </div>
          <div className="mt-2 text-3xl font-bold">{totalAnalyses}</div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="h-4 w-4" />
            Average score
          </div>
          <div className="mt-2 text-3xl font-bold">{averageScore}%</div>
        </div>
      </div>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
              <Skeleton className="h-5 w-56" />
              <Skeleton className="mt-3 h-4 w-28" />
              <Skeleton className="mt-4 h-10 w-full" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="rounded-2xl border border-border/60 bg-card p-8 text-center shadow-soft">
          <Clock3 className="mx-auto h-7 w-7 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            No analyses yet. Run your first resume analysis to see it here.
          </p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item._id} className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                  <div className="mt-1 text-2xl font-bold">{item.score}% match</div>
                </div>
                <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                  Analysis
                </Badge>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold">Matched skills</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.matched.length ? (
                      item.matched.map((skill, idx) => (
                        <Badge key={`${item._id}-m-${idx}`} variant="secondary">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No matched skills recorded.</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold">Missing skills</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.missing.length ? (
                      item.missing.map((skill, idx) => (
                        <Badge key={`${item._id}-x-${idx}`} variant="outline">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No missing skills recorded.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
