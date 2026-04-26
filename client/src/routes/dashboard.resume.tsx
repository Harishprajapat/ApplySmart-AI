import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Loader2, CheckCircle2, AlertCircle, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/resume")({
  component: ResumeAnalyzer,
});

interface AnalysisResult {
  score: number;
  matched: string[];
  missing: string[];
  suggestions: string[];
}

function ResumeAnalyzer() {
  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = () => {
    if (!resume.trim() || !jd.trim()) {
      toast.error("Please add both your resume and the job description.");
      return;
    }
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      setResult({
        score: 87,
        matched: ["React", "TypeScript", "Node.js", "REST APIs", "Agile", "Git"],
        missing: ["GraphQL", "Kubernetes", "System Design"],
        suggestions: [
          "Add a metric to your most recent role (e.g. 'reduced load time by 40%').",
          "Include 'GraphQL' in your skills — it's mentioned 4× in the JD.",
          "Move your education section below your experience for senior roles.",
          "Use stronger action verbs: replace 'worked on' with 'led' or 'shipped'.",
        ],
      });
      setLoading(false);
      toast.success("Analysis complete!");
    }, 1800);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Resume Analyzer</h1>
        <p className="mt-1.5 text-muted-foreground">
          Paste your resume and the job description. Get an ATS score and suggestions in seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <Label className="text-sm font-semibold">Your resume</Label>
          <p className="mt-1 text-xs text-muted-foreground">Paste plain text or upload a PDF.</p>
          <Textarea
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            placeholder="Paste your resume here…"
            className="mt-3 min-h-64 resize-none"
          />
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>{resume.length} characters</span>
            <button className="font-medium text-primary hover:underline">Upload PDF instead</button>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <Label className="text-sm font-semibold">Job description</Label>
          <p className="mt-1 text-xs text-muted-foreground">Paste the full JD for best results.</p>
          <Textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste the job description here…"
            className="mt-3 min-h-64 resize-none"
          />
          <div className="mt-3 text-xs text-muted-foreground">{jd.length} characters</div>
        </div>
      </div>

      <div className="flex justify-center">
        <Button variant="hero" size="xl" onClick={handleAnalyze} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="animate-spin" /> Analyzing…
            </>
          ) : (
            <>
              <Wand2 /> Analyze now
            </>
          )}
        </Button>
      </div>

      {/* Results */}
      {(loading || result) && (
        <div className="animate-fade-in-up space-y-6">
          {loading && <ResultsSkeleton />}
          {result && !loading && <ResultsView result={result} />}
        </div>
      )}
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-3 h-12 w-32" />
          <Skeleton className="mt-4 h-2 w-full" />
          <Skeleton className="mt-2 h-2 w-3/4" />
        </div>
      ))}
    </div>
  );
}

function ResultsView({ result }: { result: AnalysisResult }) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 to-primary-glow/10 p-6 shadow-soft">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" /> ATS Match Score
          </div>
          <div className="mt-2 flex items-end gap-1">
            <span className="text-5xl font-bold text-gradient">{result.score}</span>
            <span className="mb-2 text-xl text-muted-foreground">%</span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-primary transition-all duration-700"
              style={{ width: `${result.score}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Strong match. A few tweaks could push you to 95+.
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="h-4 w-4 text-success" /> Matched keywords
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {result.matched.map((k) => (
              <Badge
                key={k}
                variant="outline"
                className="border-success/30 bg-success/10 text-success"
              >
                {k}
              </Badge>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <AlertCircle className="h-4 w-4 text-warning" /> Missing skills
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {result.missing.map((k) => (
              <Badge
                key={k}
                variant="outline"
                className="border-warning/40 bg-warning/10 text-foreground"
              >
                {k}
              </Badge>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Add these where genuine to lift your score.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
        <h2 className="text-lg font-semibold">AI Suggestions</h2>
        <ul className="mt-4 space-y-3">
          {result.suggestions.map((s, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-xl border border-border/40 bg-muted/30 p-4 transition-colors hover:bg-muted/60"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-primary text-xs font-bold text-primary-foreground">
                {i + 1}
              </div>
              <span className="text-sm">{s}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
