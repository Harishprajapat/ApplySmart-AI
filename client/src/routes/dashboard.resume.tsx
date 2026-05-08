import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Wand2,
  Copy,
  Download,
  ChevronDown,
  ChevronUp,
  FileText,
  ListChecks,
  Search,
  FileUp,
  Eye,
  Trash2,
  RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { buildApiUrl } from "@/lib/api";
import { buildPageMeta } from "@/lib/seo";

export const Route = createFileRoute("/dashboard/resume")({
  head: () => ({
    meta: buildPageMeta({
      title: "Resume Analyzer",
      description:
        "Upload your resume PDF, compare it to a job description, and get ATS scoring plus AI-powered rewrite suggestions.",
    }),
  }),
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

interface AnalyzeResponseError {
  code?: string;
  error?: string;
  message?: string;
  retryAfter?: number;
  limit?: number;
  used?: number;
}

const MAX_ANALYZE_RETRIES = 2;

function isAnalyzeResponseError(value: unknown): value is AnalyzeResponseError {
  if (!value || typeof value !== "object") {
    return false;
  }

  return (
    "code" in value ||
    "error" in value ||
    "message" in value ||
    "retryAfter" in value ||
    "limit" in value ||
    "used" in value
  );
}

function isAnalysisResult(value: unknown): value is AnalysisResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  return (
    "score" in value &&
    "matched" in value &&
    "missing" in value &&
    "suggestions" in value &&
    "improved_resume" in value
  );
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

let jsPdfPromise: Promise<any> | null = null;

async function getJsPdf() {
  if (!jsPdfPromise) {
    jsPdfPromise = import("jspdf").then((module) => module.jsPDF);
  }

  return jsPdfPromise;
}

function formatResumeLines(resumeText: string) {
  return resumeText
    .split("\n")
    .map((line) => line.trim())
    .filter((line, index, lines) => line || (index > 0 && lines[index - 1] !== ""));
}

function isLikelyHeading(line: string) {
  const cleanLine = line.replace(/[:\-]$/, "").trim();
  return (
    cleanLine.length > 0 &&
    cleanLine.length < 48 &&
    cleanLine === cleanLine.toUpperCase() &&
    /[A-Z]/.test(cleanLine)
  );
}

function ResumeAnalyzer() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [parsedResumeText, setParsedResumeText] = useState("");
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsingResume, setParsingResume] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [limitError, setLimitError] = useState<string | null>(null);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [resumePreviewUrl, setResumePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const retryTimeoutRef = useRef<number | null>(null);
  const pendingPayloadRef = useRef<{ resume: string; jd: string } | null>(null);
  const retryAttemptRef = useRef(0);
  const isSubmittingRef = useRef(false);

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
  }, []);

  useEffect(() => {
    if (!resumeFile) {
      setResumePreviewUrl(null);
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(resumeFile);
    setResumePreviewUrl(nextPreviewUrl);

    return () => {
      URL.revokeObjectURL(nextPreviewUrl);
    };
  }, [resumeFile]);

  useEffect(() => {
    if (retryCountdown === null) {
      return undefined;
    }

    if (retryCountdown <= 0) {
      retryTimeoutRef.current = window.setTimeout(() => {
        retryTimeoutRef.current = null;
        void retryAnalyzeNow();
      }, 0);

      return () => {
        if (retryTimeoutRef.current !== null) {
          window.clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = null;
        }
      };
    }

    const intervalId = window.setInterval(() => {
      setRetryCountdown((current) => {
        if (current === null) {
          return null;
        }

        return current <= 1 ? 0 : current - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [retryCountdown]);

  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current !== null) {
        window.clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const clearRetryState = () => {
    if (retryTimeoutRef.current !== null) {
      window.clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    setRetryMessage(null);
    setRetryCountdown(null);
    setRetryAttempt(0);
    retryAttemptRef.current = 0;
    pendingPayloadRef.current = null;
  };

  const performAnalyzeRequest = async (payload: { resume: string; jd: string }) => {
    const res = await fetch(buildApiUrl("/api/analyze"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token") || "",
      },
      body: JSON.stringify(payload),
    });

    const data = (await res.json().catch(() => null)) as AnalyzeResponseError | AnalysisResult | null;

    return { res, data };
  };

  const scheduleAnalyzeRetry = (payload: { resume: string; jd: string }, retryAfter: number) => {
    pendingPayloadRef.current = payload;
    retryAttemptRef.current += 1;
    setRetryAttempt(retryAttemptRef.current);
    setRetryCountdown(retryAfter);
    setRetryMessage(`High demand right now - retrying in ${retryAfter} seconds...`);
    setLoading(true);
  };

  const retryAnalyzeNow = async () => {
    if (!pendingPayloadRef.current || isSubmittingRef.current) {
      return;
    }

    setRetryCountdown(null);
    setRetryMessage(null);
    await submitAnalyzeRequest(pendingPayloadRef.current, { isRetry: true });
  };

  const submitAnalyzeRequest = async (
    payload: { resume: string; jd: string },
    options: { isRetry?: boolean } = {},
  ) => {
    if (isSubmittingRef.current) {
      return;
    }

    isSubmittingRef.current = true;
    setLoading(true);

    try {
      const { res, data } = await performAnalyzeRequest(payload);
      const errorData = isAnalyzeResponseError(data) ? data : null;

      if (!res.ok) {
        if (res.status === 403 && errorData?.code === "PLAN_LIMIT_REACHED") {
          clearRetryState();
          setLimitError(errorData?.message || "Free plan limit reached. Upgrade to Pro.");
          setUsage({
            plan: "free",
            limit: errorData?.limit ?? 5,
            used: errorData?.used ?? 5,
            remaining: 0,
            blocked: true,
          });
          setLoading(false);
          return;
        }

        if (
          res.status === 429 &&
          errorData?.code === "AI_RATE_LIMIT" &&
          typeof errorData?.retryAfter === "number" &&
          retryAttemptRef.current < MAX_ANALYZE_RETRIES
        ) {
          scheduleAnalyzeRetry(payload, Math.max(1, errorData.retryAfter));
          return;
        }

        clearRetryState();

        if (res.status === 429 && errorData?.code === "AI_RATE_LIMIT") {
          throw new Error("Still busy. Please try again later.");
        }

        if (res.status >= 500 || errorData?.error === "AI error") {
          throw new Error("Server is busy right now. Please try again.");
        }

        throw new Error(errorData?.error || errorData?.message || "Error analyzing resume");
      }

      if (!isAnalysisResult(data)) {
        throw new Error("Invalid analysis response. Please try again.");
      }

      clearRetryState();
      setResult(data);
      if (data?.usage) {
        setUsage({
          ...data.usage,
          blocked: data.usage.plan === "free" && data.usage.remaining === 0,
        });
      }
      toast.success(options.isRetry ? "Analysis complete after retry!" : "Analysis complete!");
    } catch (error) {
      clearRetryState();
      const message = error instanceof Error ? error.message : "Error analyzing resume";
      toast.error(message);
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (loading || parsingResume || isSubmittingRef.current) {
      return;
    }

    if (!parsedResumeText.trim() || !jd.trim()) {
      toast.error("Please upload your resume PDF and add the job description.");
      return;
    }

    clearRetryState();
    setResult(null);
    setLimitError(null);

    await submitAnalyzeRequest({ resume: parsedResumeText, jd });
  };

  const handleResumeFileSelection = async (file: File | null) => {
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    const reader = new FileReader();
    setParsingResume(true);
    setResumeFile(file);
    setParsedResumeText("");
    setResult(null);

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

        setParsedResumeText(fullText);
        toast.success("PDF uploaded successfully!");
      } catch {
        setResumeFile(null);
        setParsedResumeText("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        toast.error("Could not read this PDF. Please try another file.");
      } finally {
        setParsingResume(false);
      }
    };

    reader.onerror = () => {
      setResumeFile(null);
      setParsedResumeText("");
      setParsingResume(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      toast.error("Could not read this PDF. Please try another file.");
    };

    reader.readAsArrayBuffer(file);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    await handleResumeFileSelection(file);
  };

  const handleRemoveResume = () => {
    clearRetryState();
    setResumeFile(null);
    setParsedResumeText("");
    setParsingResume(false);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleReplaceResume = () => {
    fileInputRef.current?.click();
  };

  const handlePreviewResume = () => {
    if (!resumePreviewUrl) {
      toast.error("Preview is not available for this file yet.");
      return;
    }

    window.open(resumePreviewUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Resume Analyzer</h1>
        <p className="mt-1.5 text-muted-foreground">
          Upload your resume PDF and paste the job description. Get an ATS score and suggestions in seconds.
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

      {retryMessage && retryCountdown !== null && (
        <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 text-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">
                🚀 {retryMessage.replace(/\d+\sseconds?/, `${retryCountdown} second${retryCountdown === 1 ? "" : "s"}`)}
              </p>
              <p className="mt-1 text-muted-foreground">
                Retry {retryAttempt} of {MAX_ANALYZE_RETRIES} is queued automatically.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => void retryAnalyzeNow()}>
              Retry now
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <Label className="text-sm font-semibold">Your resume</Label>
          <p className="mt-1 text-xs text-muted-foreground">
            Upload a PDF and we will extract the content in the background for analysis.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileUpload}
          />

          {!resumeFile ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 flex min-h-64 w-full flex-col items-center justify-center rounded-3xl border border-dashed border-border/70 bg-muted/20 px-6 text-center transition-all hover:border-primary/40 hover:bg-primary/5"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-soft">
                <FileUp className="h-6 w-6" />
              </div>
              <div className="mt-5 text-base font-semibold">Upload your resume PDF</div>
              <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                Drag-and-drop is not required here. Just choose a PDF and we will keep the extracted text hidden while analysis runs.
              </p>
              <span className="mt-5 inline-flex items-center rounded-full border border-border/60 bg-background px-3 py-1 text-xs text-muted-foreground">
                PDF only
              </span>
            </button>
          ) : (
            <div className="mt-4 rounded-3xl border border-border/70 bg-muted/20 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    {parsingResume ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{resumeFile.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {formatFileSize(resumeFile.size)}
                    </div>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-success/20 bg-success/10 px-3 py-1 text-xs font-medium text-success">
                      {parsingResume ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                      {parsingResume ? "Extracting text..." : "Uploaded successfully"}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviewResume}
                    disabled={!resumePreviewUrl}
                  >
                    <Eye />
                    Preview PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleReplaceResume}>
                    <RefreshCcw />
                    Replace file
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleRemoveResume}>
                    <Trash2 />
                    Remove file
                  </Button>
                </div>
              </div>
            </div>
          )}
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
          className="w-full sm:w-auto"
          onClick={handleAnalyze}
          disabled={loading || parsingResume || Boolean(usage?.blocked)}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" /> {retryCountdown !== null ? "Waiting to retry..." : "Analyzing..."}
            </>
          ) : parsingResume ? (
            <>
              <Loader2 className="animate-spin" /> Preparing resume...
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

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ResultsSkeleton() {
  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-4 h-10 w-56" />
        <Skeleton className="mt-6 h-40 w-full" />
      </div>
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
    </div>
  );
}

function ResultsView({ result }: { result: AnalysisResult }) {
  const [visibleSuggestions, setVisibleSuggestions] = useState(3);
  const [copying, setCopying] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const displayedSuggestions = result.suggestions.slice(0, visibleSuggestions);
  const hasMoreSuggestions = result.suggestions.length > 3;

  const handleCopy = async () => {
    if (!result.improved_resume) {
      toast.error("No improved resume is available to copy yet.");
      return;
    }

    try {
      setCopying(true);
      await navigator.clipboard.writeText(result.improved_resume);
      toast.success("Improved resume copied to clipboard.");
    } catch {
      toast.error("Could not copy the resume. Please try again.");
    } finally {
      setCopying(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!result.improved_resume) {
      toast.error("No improved resume is available to download yet.");
      return;
    }

    try {
      setDownloading(true);
      const JsPdf = await getJsPdf();
      const doc = new JsPdf({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const marginX = 52;
      const topMargin = 56;
      const bottomMargin = 56;
      const contentWidth = pageWidth - marginX * 2;
      const lines = formatResumeLines(result.improved_resume);

      let y = topMargin;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Improved Resume", marginX, y);
      y += 28;

      lines.forEach((line) => {
        const heading = isLikelyHeading(line);
        const bulletLine = /^[\u2022\-*]\s+/.test(line);
        const prefix = bulletLine ? "• " : "";
        const body = bulletLine ? line.replace(/^[\u2022\-*]\s+/, "") : line;

        doc.setFont("helvetica", heading ? "bold" : "normal");
        doc.setFontSize(heading ? 12 : 10.5);

        const wrapped = doc.splitTextToSize(`${prefix}${body}`, contentWidth) as string[];
        const lineHeight = heading ? 18 : 15;
        const blockHeight = wrapped.length * lineHeight + (heading ? 6 : 2);

        if (y + blockHeight > pageHeight - bottomMargin) {
          doc.addPage();
          y = topMargin;
        }

        doc.text(wrapped, marginX, y);
        y += blockHeight;
      });

      doc.save("improved-resume.pdf");
      toast.success("PDF downloaded.");
    } catch {
      toast.error("Could not generate the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-[28px] border border-border/60 bg-card p-4 shadow-soft sm:p-6">
        <div className="flex flex-col gap-4 border-b border-border/60 pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Improved Resume Ready
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Use your optimized resume first</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                We kept the ATS score visible, but the rewritten resume is now the main output so it is instantly usable.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div className="rounded-2xl border border-border/60 bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                ATS Score
              </div>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-3xl font-bold">{result.score}</span>
                <span className="pb-1 text-sm text-muted-foreground">/ 100</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
                <div
                  className="h-full rounded-full bg-gradient-primary transition-all duration-700"
                  style={{ width: `${result.score}%` }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:w-44">
              <Button onClick={handleCopy} disabled={copying || !result.improved_resume} className="w-full">
                <Copy />
                {copying ? "Copying..." : "Copy to Clipboard"}
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadPdf}
                disabled={downloading || !result.improved_resume}
                className="w-full"
              >
                <Download />
                {downloading ? "Preparing PDF..." : "Download as PDF"}
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="resume" className="mt-5">
          <TabsList className="grid h-auto w-full grid-cols-1 rounded-2xl bg-muted/50 p-1 sm:grid-cols-3">
            <TabsTrigger value="resume" className="h-11 rounded-xl">
              <FileText />
              Resume
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="h-11 rounded-xl">
              <ListChecks />
              Suggestions
            </TabsTrigger>
            <TabsTrigger value="analysis" className="h-11 rounded-xl">
              <Search />
              Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resume" className="mt-4">
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 sm:p-5">
              {result.improved_resume ? (
                <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7 text-foreground">
                  {result.improved_resume}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">
                  We could not generate an improved resume this time. Please try again.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="suggestions" className="mt-4">
            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">AI Suggestions</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    The most important improvements are surfaced first.
                  </p>
                </div>
                <Badge variant="outline">{result.suggestions.length} items</Badge>
              </div>

              {result.suggestions.length ? (
                <>
                  <ul className="mt-4 space-y-3">
                    {displayedSuggestions.map((s, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 rounded-2xl border border-border/40 bg-muted/30 p-4"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-xs font-bold text-primary-foreground">
                          {i + 1}
                        </div>
                        <span className="pt-0.5 text-sm leading-6">{s}</span>
                      </li>
                    ))}
                  </ul>

                  {hasMoreSuggestions && (
                    <Button
                      variant="ghost"
                      className="mt-3"
                      onClick={() =>
                        setVisibleSuggestions((current) =>
                          current > 3 ? 3 : result.suggestions.length,
                        )
                      }
                    >
                      {visibleSuggestions > 3 ? (
                        <>
                          <ChevronUp />
                          View less
                        </>
                      ) : (
                        <>
                          <ChevronDown />
                          View more
                        </>
                      )}
                    </Button>
                  )}
                </>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  No suggestions were returned for this analysis.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="mt-4">
            <Accordion type="single" collapsible className="rounded-2xl border border-border/60 bg-card px-5 shadow-soft">
              <AccordionItem value="ats-analysis" className="border-b-0">
                <AccordionTrigger className="py-5 text-base font-semibold hover:no-underline">
                  Detailed ATS Analysis
                </AccordionTrigger>
                <AccordionContent className="pb-5">
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-success/20 bg-success/5 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        Matched keywords
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {result.matched.length ? (
                          result.matched.map((keyword) => (
                            <Badge
                              key={keyword}
                              variant="outline"
                              className="border-success/30 bg-success/10 text-success"
                            >
                              {keyword}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">No matched skills found.</span>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-warning/20 bg-warning/5 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <AlertCircle className="h-4 w-4 text-warning" />
                        Missing skills
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {result.missing.length ? (
                          result.missing.map((keyword) => (
                            <Badge
                              key={keyword}
                              variant="outline"
                              className="border-warning/40 bg-warning/10 text-foreground"
                            >
                              {keyword}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">No missing skills flagged.</span>
                        )}
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground">
                        Add these only when they honestly match your experience.
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
