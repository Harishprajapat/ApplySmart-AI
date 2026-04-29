import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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

interface UsageInfo {
  plan: "free" | "pro";
  limit: number | null;
  used: number;
  remaining: number | null;
  blocked: boolean;
}

interface AnalysisResult {
  score: number;
  matched: string[];
  missing: string[];
  suggestions: string[];
  improved_resume: string;
  usage?: {
    plan: "free" | "pro";
    limit: number | null;
    used: number;
    remaining: number | null;
  };
}

let pdfjsLibPromise: Promise<any> | null = null;

async function getPdfJs() {
  if (typeof window === "undefined") {
    throw new Error("PDF parsing is only available in the browser.");
  }

  if (!pdfjsLibPromise) {
    pdfjsLibPromise = Promise.all([
      import("pdfjs-dist"),
      import("pdfjs-dist/build/pdf.worker?url"),
    ]).then(([pdfjsLib, workerModule]) => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerModule.default;
      return pdfjsLib;
    });
  }

  return pdfjsLibPromise;
}

function ResumeAnalyzer() {
  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [limitError, setLimitError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchUsage = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/analyze/usage", {
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
  }, []);

  const handleAnalyze = async () => {
    if (!resume.trim() || !jd.trim()) {
      toast.error("Please add both your resume and the job description.");
      return;
    }

    setLoading(true);
    setResult(null);
    setLimitError(null);

    try {
      const res = await fetch("http://localhost:5000/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token") || "",
        },
        body: JSON.stringify({ resume, jd }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        if (res.status === 403 && data?.code === "PLAN_LIMIT_REACHED") {
          setLimitError(data?.message || "Free plan limit reached. Upgrade to Pro.");
          setUsage({
            plan: "free",
            limit: data?.limit ?? 5,
            used: data?.used ?? 5,
            remaining: 0,
            blocked: true,
          });
        }
        if (res.status >= 500 || data?.error === "AI error") {
          throw new Error("Server is busy right now. Please try again.");
        }
        throw new Error(data?.error || data?.message || "Error analyzing resume");
      }

      setResult(data);
      if (data?.usage) {
        setUsage({
          ...data.usage,
          blocked: data.usage.plan === "free" && data.usage.remaining === 0,
        });
      }
      toast.success("Analysis complete!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error analyzing resume";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const pdfjsLib = await getPdfJs();
        const typedArray = new Uint8Array(reader.result as ArrayBuffer);
        const pdf = await pdfjsLib.getDocument(typedArray).promise;

        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map((item: any) => item.str);
          fullText += strings.join(" ") + "\n";
        }

        setResume(fullText);
        toast.success("PDF uploaded successfully!");
      } catch {
        toast.error("Could not read this PDF. Please try another file.");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Resume Analyzer</h1>
        <p className="mt-1.5 text-muted-foreground">
          Paste your resume and the job description. Get an ATS score and suggestions in seconds.
        </p>
      </div>

      {usage && (
        <div className="rounded-2xl border border-border/60 bg-card p-4 text-sm shadow-soft">
          {usage.plan === "pro" ? (
            <p className="text-muted-foreground">Pro plan: Unlimited analyses this month.</p>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-muted-foreground">
                Free plan: {usage.used}/{usage.limit ?? 5} analyses used this month.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/pricing">Upgrade</Link>
              </Button>
            </div>
          )}
        </div>
      )}

      {limitError && (
        <div className="rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm">
          <p className="font-medium">{limitError}</p>
          <Button variant="hero" size="sm" className="mt-3" asChild>
            <Link to="/pricing">Upgrade to Pro</Link>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <Label className="text-sm font-semibold">Your resume</Label>
          <p className="mt-1 text-xs text-muted-foreground">Paste plain text or upload a PDF.</p>
          <Textarea
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            placeholder="Paste your resume here..."
            className="mt-3 min-h-64 resize-none"
          />
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>{resume.length} characters</span>
            <label className="cursor-pointer font-medium text-primary hover:underline">
              Upload PDF instead
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Supports PDF resumes (auto-extracted)</p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <Label className="text-sm font-semibold">Job description</Label>
          <p className="mt-1 text-xs text-muted-foreground">Paste the full JD for best results.</p>
          <Textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste the job description here..."
            className="mt-3 min-h-64 resize-none"
          />
          <div className="mt-3 text-xs text-muted-foreground">{jd.length} characters</div>
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          variant="hero"
          size="xl"
          onClick={handleAnalyze}
          disabled={loading || Boolean(usage?.blocked)}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" /> Analyzing...
            </>
          ) : (
            <>
              <Wand2 /> {usage?.blocked ? "Limit reached" : "Analyze now"}
            </>
          )}
        </Button>
      </div>

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
              <Badge key={k} variant="outline" className="border-success/30 bg-success/10 text-success">
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
              <Badge key={k} variant="outline" className="border-warning/40 bg-warning/10 text-foreground">
                {k}
              </Badge>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Add these where genuine to lift your score.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
        <h2 className="text-lg font-semibold">AI Suggestions</h2>
        {result.suggestions.length ? (
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
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            No suggestions were returned for this analysis.
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
        <h2 className="text-lg font-semibold">Improved Resume</h2>
        {result.improved_resume ? (
          <div className="mt-4 rounded-xl border border-border/40 bg-muted/20 p-4">
            <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-6 text-foreground">
              {result.improved_resume}
            </pre>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            We could not generate an improved resume this time. Please try again.
          </p>
        )}
      </div>
    </>
  );
}
