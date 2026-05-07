import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  Clock3,
  Copy,
  Download,
  Eye,
  FileStack,
  FileText,
  PenLine,
  Sparkles,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import {
  type AIHistoryItem,
  type AIHistoryType,
  buildAIHistoryCopyText,
  fetchAIHistory,
  getAIHistoryPreview,
  getAIHistoryTypeLabel,
} from "@/lib/ai-history";
import { buildPageMeta } from "@/lib/seo";

export const Route = createFileRoute("/dashboard/history")({
  head: () => ({
    meta: buildPageMeta({
      title: "AI History",
      description:
        "Review every resume analysis and cover letter generation from one unified ApplySmart AI history timeline.",
    }),
  }),
  component: HistoryPage,
});

let jsPdfPromise: Promise<any> | null = null;

async function getJsPdf() {
  if (!jsPdfPromise) {
    jsPdfPromise = import("jspdf").then((module) => module.jsPDF);
  }

  return jsPdfPromise;
}

function addWrappedText(doc: any, text: string, startY: number, options: {
  pageWidth: number;
  pageHeight: number;
  marginX: number;
  bottomMargin: number;
  lineHeight: number;
}) {
  const { pageWidth, pageHeight, marginX, bottomMargin, lineHeight } = options;
  const contentWidth = pageWidth - marginX * 2;
  const lines = doc.splitTextToSize(text, contentWidth);
  let y = startY;

  for (const line of lines) {
    if (y > pageHeight - bottomMargin) {
      doc.addPage();
      y = 56;
    }

    doc.text(line, marginX, y);
    y += lineHeight;
  }

  return y;
}

function HistoryPage() {
  const [items, setItems] = useState<AIHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | AIHistoryType>("all");
  const [selectedItem, setSelectedItem] = useState<AIHistoryItem | null>(null);
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to view your AI history.");
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        const data = await fetchAIHistory(token, { limit: 100 });
        setItems(data.items);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch history";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const filteredItems = useMemo(() => {
    if (activeTab === "all") {
      return items;
    }

    return items.filter((item) => item.type === activeTab);
  }, [activeTab, items]);

  const totalItems = items.length;
  const resumeItems = useMemo(() => items.filter((item) => item.type === "resume"), [items]);
  const coverLetterItems = useMemo(
    () => items.filter((item) => item.type === "cover_letter"),
    [items],
  );
  const averageScore = useMemo(() => {
    if (!resumeItems.length) return 0;
    const sum = resumeItems.reduce((acc, item) => acc + (item.data.atsScore || 0), 0);
    return Math.round(sum / resumeItems.length);
  }, [resumeItems]);

  const handleCopy = async (item: AIHistoryItem) => {
    try {
      setCopyingId(item._id);
      await navigator.clipboard.writeText(buildAIHistoryCopyText(item));
      toast.success(`${getAIHistoryTypeLabel(item.type)} copied to clipboard.`);
    } catch {
      toast.error("Could not copy this item. Please try again.");
    } finally {
      setCopyingId(null);
    }
  };

  const handleDownloadPdf = async (item: AIHistoryItem) => {
    try {
      setDownloadingId(item._id);
      const JsPdf = await getJsPdf();
      const doc = new JsPdf({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const marginX = 54;
      const bottomMargin = 56;
      const lineHeight = 18;
      let y = 58;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text(item.title, marginX, y);
      y += 22;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(90, 90, 90);
      doc.text(
        `${getAIHistoryTypeLabel(item.type)} - ${new Date(item.createdAt).toLocaleString()}`,
        marginX,
        y,
      );
      y += 28;
      doc.setTextColor(20, 20, 20);

      if (item.type === "resume") {
        doc.setFontSize(12);
        doc.text(`ATS Score: ${item.data.atsScore ?? 0}%`, marginX, y);
        y += 22;

        const sections = [
          item.data.matchedSkills.length
            ? `Matched Skills: ${item.data.matchedSkills.join(", ")}`
            : "Matched Skills: None recorded",
          item.data.missingSkills.length
            ? `Missing Skills: ${item.data.missingSkills.join(", ")}`
            : "Missing Skills: None recorded",
          item.data.suggestions.length
            ? `Suggestions: ${item.data.suggestions.join(" | ")}`
            : "Suggestions: None recorded",
          item.data.content ? `Improved Resume:\n${item.data.content}` : "Improved Resume: Not available",
        ];

        for (const section of sections) {
          y = addWrappedText(doc, section, y, {
            pageWidth,
            pageHeight,
            marginX,
            bottomMargin,
            lineHeight,
          });
          y += 18;
        }
      } else {
        doc.setFontSize(12);
        y = addWrappedText(doc, item.data.content || "Cover letter content not available.", y, {
          pageWidth,
          pageHeight,
          marginX,
          bottomMargin,
          lineHeight,
        });
      }

      doc.save(
        `${item.type === "resume" ? "resume-analysis" : "cover-letter"}-${item._id.slice(-6)}.pdf`,
      );
      toast.success("PDF downloaded.");
    } catch {
      toast.error("Could not generate the PDF. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI History</h1>
        <p className="mt-1.5 text-muted-foreground">
          Browse every resume analysis and cover letter generation in one timeline.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileStack className="h-4 w-4" />
            Total activity
          </div>
          <div className="mt-2 text-3xl font-bold">{totalItems}</div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="h-4 w-4" />
            Average ATS
          </div>
          <div className="mt-2 text-3xl font-bold">{averageScore}%</div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            Resume analyses
          </div>
          <div className="mt-2 text-3xl font-bold">{resumeItems.length}</div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <PenLine className="h-4 w-4" />
            Cover letters
          </div>
          <div className="mt-2 text-3xl font-bold">{coverLetterItems.length}</div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "all" | AIHistoryType)}>
        <TabsList className="grid h-auto w-full grid-cols-1 gap-2 rounded-2xl bg-muted/60 p-2 sm:grid-cols-3">
          <TabsTrigger value="all" className="rounded-xl px-4 py-2">
            All
          </TabsTrigger>
          <TabsTrigger value="resume" className="rounded-xl px-4 py-2">
            Resume
          </TabsTrigger>
          <TabsTrigger value="cover_letter" className="rounded-xl px-4 py-2">
            Cover Letters
          </TabsTrigger>
        </TabsList>
      </Tabs>

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
            No AI activity yet. Generate your first resume analysis or cover letter to see it here.
          </p>
        </div>
      )}

      {!loading && !error && items.length > 0 && filteredItems.length === 0 && (
        <div className="rounded-2xl border border-border/60 bg-card p-8 text-center shadow-soft">
          <Sparkles className="mx-auto h-7 w-7 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            No {activeTab === "resume" ? "resume analyses" : "cover letters"} in this view yet.
          </p>
        </div>
      )}

      {!loading && !error && filteredItems.length > 0 && (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div key={item._id} className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                  <div className="mt-1 text-2xl font-bold">{item.title}</div>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                    {getAIHistoryPreview(item)}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    item.type === "resume"
                      ? "border-success/30 bg-success/10 text-success"
                      : "border-primary/30 bg-primary/10 text-primary"
                  }
                >
                  {getAIHistoryTypeLabel(item.type)}
                </Badge>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                {item.type === "resume" ? (
                  <>
                    <div>
                      <p className="text-sm font-semibold">Matched skills</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {item.data.matchedSkills.length ? (
                          item.data.matchedSkills.map((skill, idx) => (
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
                        {item.data.missingSkills.length ? (
                          item.data.missingSkills.map((skill, idx) => (
                            <Badge key={`${item._id}-x-${idx}`} variant="outline">
                              {skill}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">No missing skills recorded.</span>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="lg:col-span-2">
                    <p className="text-sm font-semibold">Preview</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{getAIHistoryPreview(item)}</p>
                  </div>
                )}
              </div>

              <div className="mt-5 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
                <Button variant="outline" size="sm" onClick={() => setSelectedItem(item)} className="w-full sm:w-auto">
                  <Eye />
                  View Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(item)}
                  disabled={copyingId === item._id}
                  className="w-full sm:w-auto"
                >
                  <Copy />
                  {copyingId === item._id ? "Copying..." : "Copy"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadPdf(item)}
                  disabled={downloadingId === item._id}
                  className="w-full sm:w-auto"
                >
                  <Download />
                  {downloadingId === item._id ? "Preparing..." : "Download PDF"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={Boolean(selectedItem)} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto rounded-3xl border border-border/70 p-0">
          {selectedItem && (
            <div className="p-6 sm:p-8">
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge
                    variant="outline"
                    className={
                      selectedItem.type === "resume"
                        ? "border-success/30 bg-success/10 text-success"
                        : "border-primary/30 bg-primary/10 text-primary"
                    }
                  >
                    {getAIHistoryTypeLabel(selectedItem.type)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(selectedItem.createdAt).toLocaleString()}
                  </span>
                </div>
                <DialogTitle className="mt-3 text-2xl">{selectedItem.title}</DialogTitle>
                <DialogDescription>
                  {selectedItem.type === "resume"
                    ? "Review ATS results, skill gaps, and the improved resume draft."
                    : "Review the full generated cover letter."}
                </DialogDescription>
              </DialogHeader>

              {selectedItem.type === "resume" ? (
                <div className="mt-6 space-y-6">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                      <div className="text-sm text-muted-foreground">ATS Score</div>
                      <div className="mt-2 text-3xl font-bold">{selectedItem.data.atsScore ?? 0}%</div>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                      <div className="text-sm text-muted-foreground">Matched Skills</div>
                      <div className="mt-2 text-3xl font-bold">{selectedItem.data.matchedSkills.length}</div>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                      <div className="text-sm text-muted-foreground">Missing Skills</div>
                      <div className="mt-2 text-3xl font-bold">{selectedItem.data.missingSkills.length}</div>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-border/60 p-5">
                      <p className="text-sm font-semibold">Matched skills</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {selectedItem.data.matchedSkills.length ? (
                          selectedItem.data.matchedSkills.map((skill, idx) => (
                            <Badge key={`detail-match-${idx}`} variant="secondary">
                              {skill}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">No matched skills recorded.</span>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border/60 p-5">
                      <p className="text-sm font-semibold">Missing skills</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {selectedItem.data.missingSkills.length ? (
                          selectedItem.data.missingSkills.map((skill, idx) => (
                            <Badge key={`detail-missing-${idx}`} variant="outline">
                              {skill}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">No missing skills recorded.</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/60 p-5">
                    <p className="text-sm font-semibold">Suggestions</p>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                      {selectedItem.data.suggestions.length ? (
                        selectedItem.data.suggestions.map((suggestion, idx) => (
                          <li key={`detail-suggestion-${idx}`} className="rounded-xl bg-muted/20 px-3 py-2">
                            {suggestion}
                          </li>
                        ))
                      ) : (
                        <li>No suggestions recorded.</li>
                      )}
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-border/60 p-5">
                    <p className="text-sm font-semibold">Improved resume</p>
                    <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-6 text-muted-foreground">
                      {selectedItem.data.content || "No improved resume content was stored for this analysis."}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-border/60 p-5">
                  <p className="text-sm font-semibold">Generated cover letter</p>
                  <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-7 text-muted-foreground">
                    {selectedItem.data.content || "No cover letter content was stored for this entry."}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
