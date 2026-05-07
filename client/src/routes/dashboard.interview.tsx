import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Loader2, MessageSquareQuote, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { buildPageMeta } from "@/lib/seo";

export const Route = createFileRoute("/dashboard/interview")({
  head: () => ({
    meta: buildPageMeta({
      title: "Interview Prep",
      description:
        "Practice common interview questions with AI-guided answers and sharpen your interview readiness.",
    }),
  }),
  component: InterviewPrep,
});

const categories = ["Behavioral", "HR Common", "Leadership", "Problem Solving"] as const;

const questions: { q: string; cat: (typeof categories)[number]; a: string }[] = [
  {
    q: "Tell me about yourself.",
    cat: "HR Common",
    a: "Start with a one-sentence professional summary, then walk through 2–3 highlights from your career that connect directly to this role. End with why you're excited about this specific opportunity. Keep it under 90 seconds.",
  },
  {
    q: "Why do you want to work here?",
    cat: "HR Common",
    a: "Show you've done your homework. Reference a specific product, value, or recent move the company made. Then bridge it to your own experience and what you'd uniquely contribute.",
  },
  {
    q: "What's your biggest weakness?",
    cat: "HR Common",
    a: "Pick a real but non-disqualifying weakness, explain how you noticed it, and walk through the concrete steps you've taken to improve. Avoid clichés like 'I work too hard.'",
  },
  {
    q: "Tell me about a time you failed.",
    cat: "Behavioral",
    a: "Use STAR: Situation, Task, Action, Result. Be honest about the failure, take ownership, and spend most of the time on what you learned and how you applied it later.",
  },
  {
    q: "Describe a conflict with a coworker.",
    cat: "Behavioral",
    a: "Pick a real example. Frame it as a difference in approach, not personality. Show empathy, the steps you took to align, and the outcome — ideally a stronger working relationship.",
  },
  {
    q: "How do you handle competing priorities?",
    cat: "Leadership",
    a: "Walk through your prioritization framework (impact vs effort, dependencies, deadlines). Give a concrete example where this approach led to a clear outcome.",
  },
  {
    q: "Where do you see yourself in 5 years?",
    cat: "HR Common",
    a: "Be honest but show your goals are aligned with the trajectory this role offers. Focus on the skills you want to build, not titles you want to collect.",
  },
  {
    q: "Walk me through a hard problem you solved.",
    cat: "Problem Solving",
    a: "Set context briefly. Spend most of your time on your thinking process: how you broke it down, options considered, trade-offs, and the result with measurable impact.",
  },
];

function InterviewPrep() {
  const [active, setActive] = useState<(typeof categories)[number] | "All">("All");
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [loadingIdx, setLoadingIdx] = useState<number | null>(null);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const filtered = questions.filter((q) => active === "All" || q.cat === active);

  const handleOpen = (i: number) => {
    if (openIdx === i) {
      setOpenIdx(null);
      return;
    }
    setOpenIdx(i);
    if (!revealed[i]) {
      setLoadingIdx(i);
      setTimeout(() => {
        setRevealed((r) => ({ ...r, [i]: true }));
        setLoadingIdx(null);
      }, 1100);
    }
  };

  const copy = async (text: string, i: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(i);
    toast.success("Answer copied");
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Interview Prep</h1>
        <p className="mt-1.5 text-muted-foreground">
          Tap any question to get a structured, AI-generated answer you can adapt.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["All", ...categories] as const).map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
              active === c
                ? "bg-gradient-primary text-primary-foreground shadow-soft"
                : "border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((item, i) => {
          const idx = questions.indexOf(item);
          const isOpen = openIdx === idx;
          const isLoading = loadingIdx === idx;
          return (
            <div
              key={idx}
              className={cn(
                "overflow-hidden rounded-2xl border bg-card shadow-soft transition-all",
                isOpen ? "border-primary/40" : "border-border/60 hover:border-primary/20",
              )}
            >
              <button
                onClick={() => handleOpen(idx)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent">
                    <MessageSquareQuote className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">{item.q}</div>
                    <Badge variant="outline" className="mt-1.5 text-xs">
                      {item.cat}
                    </Badge>
                  </div>
                </div>
                <div className="shrink-0 text-sm font-medium text-primary">
                  {isOpen ? "Hide" : "Generate answer"}
                </div>
              </button>

              {isOpen && (
                <div className="animate-fade-in border-t border-border/60 bg-muted/30 p-5">
                  {isLoading && (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      AI is thinking…
                    </div>
                  )}
                  {!isLoading && revealed[idx] && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                        <Sparkles className="h-3.5 w-3.5" /> AI suggested answer
                      </div>
                      <p className="text-sm leading-relaxed">{item.a}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copy(item.a, idx)}
                      >
                        {copiedIdx === idx ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedIdx === idx ? "Copied" : "Copy answer"}
                      </Button>
                    </div>
                  )}
                  {isLoading && (
                    <div className="mt-3 space-y-2">
                      <Skeleton className="h-3 w-11/12" />
                      <Skeleton className="h-3 w-10/12" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
