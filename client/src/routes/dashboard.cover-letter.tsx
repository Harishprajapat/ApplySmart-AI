import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Loader2, RefreshCw, Wand2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/cover-letter")({
  component: CoverLetterPage,
});

const sampleLetter = (role: string, company: string) => `Dear Hiring Manager,

I'm writing to express my strong interest in the ${role || "open"} role${company ? ` at ${company}` : ""}. After reviewing the job description, I'm excited by the opportunity to contribute to a team that values craft, ownership, and shipping work that matters.

In my most recent role, I led the redesign of our onboarding experience, which lifted activation by 34% within a single quarter. I partnered closely with engineering and research, ran weekly user interviews, and turned messy qualitative insights into a roadmap the team rallied around. The skills I built there — clear systems thinking, decisive trade-offs, and a bias for shipping — map directly to what you've described in this role.

What draws me to ${company || "your company"} specifically is the focus on building products people genuinely love using every day. I'd love to bring that same energy to your team and help you raise the bar even higher.

I've attached my resume and would love the chance to discuss how I can contribute. Thank you for your time and consideration.

Warm regards,
Alex Smith`;

function CoverLetterPage() {
  const [resume, setResume] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [letter, setLetter] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = () => {
    if (!resume.trim() || !role.trim()) {
      toast.error("Please add your resume and the job role.");
      return;
    }
    setLoading(true);
    setLetter(null);
    setTimeout(() => {
      setLetter(sampleLetter(role, company));
      setLoading(false);
      toast.success("Cover letter ready!");
    }, 1800);
  };

  const copy = async () => {
    if (!letter) return;
    await navigator.clipboard.writeText(letter);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cover Letter Generator</h1>
        <p className="mt-1.5 text-muted-foreground">
          Personalized to your resume and the role. Ready in 15 seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
            <Label>Your resume</Label>
            <Textarea
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              placeholder="Paste your resume…"
              className="mt-3 min-h-48 resize-none"
            />
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
            <div className="grid gap-4">
              <div>
                <Label>Job role</Label>
                <Input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Senior Product Designer"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Company (optional)</Label>
                <Input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Stripe"
                  className="mt-2"
                />
              </div>
            </div>
            <Button variant="hero" className="mt-5 w-full" size="lg" onClick={generate} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin" /> Generating…
                </>
              ) : (
                <>
                  <Wand2 /> Generate cover letter
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="sticky top-24 rounded-2xl border border-border/60 bg-card shadow-soft">
            <div className="flex items-center justify-between border-b border-border/60 p-4">
              <div className="text-sm font-semibold">Your cover letter</div>
              <div className="flex gap-1.5">
                <Button variant="ghost" size="sm" onClick={generate} disabled={!letter || loading}>
                  <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                </Button>
                <Button variant="outline" size="sm" onClick={copy} disabled={!letter}>
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>
            <div className="min-h-[28rem] p-6">
              {loading && (
                <div className="space-y-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-4" style={{ width: `${60 + Math.random() * 40}%` }} />
                  ))}
                </div>
              )}
              {!loading && !letter && (
                <div className="flex h-96 flex-col items-center justify-center text-center text-muted-foreground">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent">
                    <Wand2 className="h-5 w-5 text-primary" />
                  </div>
                  <p className="mt-4 text-sm">Your cover letter will appear here.</p>
                </div>
              )}
              {!loading && letter && (
                <pre className="animate-fade-in whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                  {letter}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
