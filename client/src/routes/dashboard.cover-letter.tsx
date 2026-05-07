import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Copy,
  Download,
  FileUp,
  FileText,
  Loader2,
  Sparkles,
  Wand2,
  CheckCircle2,
  Eye,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { buildPageMeta } from "@/lib/seo";

export const Route = createFileRoute("/dashboard/cover-letter")({
  head: () => ({
    meta: buildPageMeta({
      title: "Cover Letter Generator",
      description:
        "Upload your resume PDF, add a job description, and generate a personalized cover letter grounded in your experience.",
    }),
  }),
  component: CoverLetterPage,
});

interface UsageInfo {
  plan: "free" | "pro";
  limit: number | null;
  used: number;
  remaining: number | null;
  blocked: boolean;
}

let pdfjsLibPromise: Promise<any> | null = null;
let jsPdfPromise: Promise<any> | null = null;

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

async function getJsPdf() {
  if (!jsPdfPromise) {
    jsPdfPromise = import("jspdf").then((module) => module.jsPDF);
  }

  return jsPdfPromise;
}

function CoverLetterPage() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [parsedResumeText, setParsedResumeText] = useState("");
  const [jd, setJd] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsingResume, setParsingResume] = useState(false);
  const [copying, setCopying] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [limitError, setLimitError] = useState<string | null>(null);
  const [resumePreviewUrl, setResumePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchUsage = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/cover-letter/usage", {
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

  const handleResumeFileSelection = async (file: File | null) => {
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file.");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    const reader = new FileReader();
    setParsingResume(true);
    setResumeFile(file);
    setParsedResumeText("");
    setCoverLetter("");

    reader.onload = async () => {
      try {
        const pdfjsLib = await getPdfJs();
        const typedArray = new Uint8Array(reader.result as ArrayBuffer);
        const pdf = await pdfjsLib.getDocument(typedArray).promise;

        let fullText = "";

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const page = await pdf.getPage(pageNumber);
          const content = await page.getTextContent();
          const strings = content.items.map((item: any) => item.str);
          fullText += `${strings.join(" ")}\n`;
        }

        setParsedResumeText(fullText.trim());
        toast.success("Resume PDF uploaded successfully.");
      } catch {
        setResumeFile(null);
        setParsedResumeText("");
        toast.error("Could not read this PDF. Please try another file.");
      } finally {
        setParsingResume(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    await handleResumeFileSelection(file);
  };

  const handleGenerate = async () => {
    if (!parsedResumeText.trim() || !jd.trim()) {
      toast.error("Please upload your resume PDF and add the job description.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to generate a cover letter.");
      return;
    }

    setLoading(true);
    setCoverLetter("");
    setLimitError(null);

    try {
      const response = await fetch("http://localhost:5000/api/cover-letter/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ resume: parsedResumeText, jd }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        if (response.status === 403 && data?.code === "PLAN_LIMIT_REACHED") {
          const message = data?.message || "Free plan limit reached. Upgrade to Pro.";
          setLimitError(message);
          setUsage({
            plan: "free",
            limit: data?.limit ?? 3,
            used: data?.used ?? 3,
            remaining: 0,
            blocked: true,
          });
          toast.error(message);
          return;
        }

        if (response.status === 401) {
          throw new Error(data?.message || "Your session has expired. Please log in again.");
        }

        throw new Error(data?.error || data?.message || "Failed to generate cover letter");
      }

      setCoverLetter(data?.coverLetter || "");
      if (data?.usage) {
        setUsage({
          ...data.usage,
          blocked: data.usage.plan === "free" && data.usage.remaining === 0,
        });
      }
      toast.success("Cover letter ready!");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to generate cover letter";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveResume = () => {
    setResumeFile(null);
    setParsedResumeText("");
    setParsingResume(false);
    setCoverLetter("");
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

  const handleCopy = async () => {
    if (!coverLetter) {
      toast.error("No cover letter is available to copy yet.");
      return;
    }

    try {
      setCopying(true);
      await navigator.clipboard.writeText(coverLetter);
      toast.success("Cover letter copied to clipboard.");
    } catch {
      toast.error("Could not copy the cover letter. Please try again.");
    } finally {
      setCopying(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!coverLetter) {
      toast.error("No cover letter is available to download yet.");
      return;
    }

    try {
      setDownloading(true);
      const JsPdf = await getJsPdf();
      const doc = new JsPdf({ unit: "pt", format: "a4" });
      const marginX = 54;
      const topMargin = 64;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const contentWidth = pageWidth - marginX * 2;
      const maxY = pageHeight - 56;

      doc.setFont("times", "bold");
      doc.setFontSize(17);
      doc.text("Cover Letter", marginX, topMargin);

      doc.setFont("times", "normal");
      doc.setFontSize(11.5);

      let y = topMargin + 28;
      const paragraphs = coverLetter.split("\n").map((line) => line.trim());

      paragraphs.forEach((paragraph) => {
        const lines = doc.splitTextToSize(paragraph || " ", contentWidth) as string[];
        const blockHeight = Math.max(lines.length, 1) * 16 + 6;

        if (y + blockHeight > maxY) {
          doc.addPage();
          y = topMargin;
        }

        doc.text(lines, marginX, y);
        y += blockHeight;
      });

      doc.save("cover-letter.pdf");
      toast.success("PDF downloaded.");
    } catch {
      toast.error("Could not generate the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cover Letter Generator</h1>
        <p className="mt-1.5 text-muted-foreground">
          Generate a personalized, job-aligned cover letter from your resume and the JD.
        </p>
      </div>

      {usage && (
        <div className="rounded-2xl border border-border/60 bg-card p-4 text-sm shadow-soft">
          {usage.plan === "pro" ? (
            <p className="text-muted-foreground">Pro plan: Unlimited cover letter generations this month.</p>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-muted-foreground">
                Free plan: {usage.used}/{usage.limit ?? 5} cover letters used this month.
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
            <Label className="text-sm font-semibold">Your resume</Label>
            <p className="mt-1 text-xs text-muted-foreground">
              Upload a PDF and we will extract the content in the background for generation.
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
                className="mt-4 flex min-h-72 w-full flex-col items-center justify-center rounded-3xl border border-dashed border-border/70 bg-muted/20 px-6 text-center transition-all hover:border-primary/40 hover:bg-primary/5"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-soft">
                  <FileUp className="h-6 w-6" />
                </div>
                <div className="mt-5 text-base font-semibold">Upload your resume PDF</div>
                <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                  Choose a PDF and we will keep the extracted text hidden while the cover letter stays grounded in your resume.
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
            <p className="mt-1 text-xs text-muted-foreground">
              Include responsibilities, required skills, and company context for a stronger result.
            </p>
            <Textarea
              value={jd}
              onChange={(event) => setJd(event.target.value)}
              placeholder="Paste the full job description here..."
              className="mt-3 min-h-72 resize-none"
            />
            <p className="mt-3 text-xs text-muted-foreground">{jd.length} characters</p>
          </div>

          <Button
            variant="hero"
            size="xl"
            className="w-full"
            onClick={handleGenerate}
            disabled={loading || parsingResume || Boolean(usage?.blocked)}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Generating...
              </>
            ) : parsingResume ? (
              <>
                <Loader2 className="animate-spin" />
                Preparing resume...
              </>
            ) : (
              <>
                <Wand2 />
                {usage?.blocked ? "Limit reached" : "Generate cover letter"}
              </>
            )}
          </Button>
        </div>

        <div className="rounded-[28px] border border-border/60 bg-card shadow-soft">
          <div className="flex flex-col gap-4 border-b border-border/60 p-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                AI Draft
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Your generated cover letter</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  The draft stays grounded in the resume details you provided.
                </p>
              </div>
            </div>

            <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:flex-wrap">
              <Button onClick={handleCopy} disabled={copying || !coverLetter} className="w-full sm:w-auto">
                <Copy />
                {copying ? "Copying..." : "Copy"}
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadPdf}
                disabled={downloading || !coverLetter}
                className="w-full sm:w-auto"
              >
                <Download />
                {downloading ? "Preparing PDF..." : "Download PDF"}
              </Button>
            </div>
          </div>

          <div className="min-h-[38rem] p-5 sm:p-6">
            {loading && <CoverLetterSkeleton />}

            {!loading && !coverLetter && (
              <div className="flex h-full min-h-[32rem] flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Your draft will appear here</h3>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Add your resume and the job description, then generate a tailored cover letter you can copy or export.
                </p>
              </div>
            )}

            {!loading && coverLetter && (
              <div className="rounded-2xl border border-border/60 bg-muted/20 p-5">
                <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7 text-foreground">
                  {coverLetter}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CoverLetterSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-48" />
      {Array.from({ length: 10 }).map((_, index) => (
        <Skeleton
          key={index}
          className="h-4"
          style={{ width: `${index % 3 === 0 ? 92 : index % 3 === 1 ? 84 : 76}%` }}
        />
      ))}
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
