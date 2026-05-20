import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Clock3,
  FileSearch,
  Gauge,
  PenLine,
  SearchX,
  Sparkles,
  UploadCloud,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import ProductPreview from "@/components/ProductPreview";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ApplySmart AI - Stop Sending Resumes Into a Black Hole" },
      {
        name: "description",
        content:
          "ApplySmart AI helps students, freshers, and job seekers analyze ATS fit, find missing skills, improve resumes, and generate job-ready cover letters.",
      },
      { property: "og:title", content: "ApplySmart AI - Your Resume Deserves Better" },
      {
        property: "og:description",
        content:
          "A modern AI workspace for people tired of rejection emails, silent recruiters, and ATS guessing games.",
      },
    ],
  }),
  component: LandingPage,
});

const proof = ["Built for rejection", "PDF upload", "ATS feedback", "Private workspace"];

const features = [
  {
    icon: Gauge,
    title: "ATS Resume Analysis",
    desc: "See how the filter reads you before a recruiter does.",
  },
  {
    icon: SearchX,
    title: "Missing Skill Detection",
    desc: "Find the keywords and experience signals the JD expects.",
  },
  {
    icon: PenLine,
    title: "Resume Rewrite Help",
    desc: "Turn weak bullets into proof people can skim fast.",
  },
  {
    icon: Sparkles,
    title: "Job-Ready Cover Letters",
    desc: "Write letters that sound tailored, not templated.",
  },
];

const steps = [
  {
    icon: UploadCloud,
    title: "Upload Resume",
    desc: "Drop in the PDF and paste the job description.",
  },
  {
    icon: FileSearch,
    title: "AI Analyzes Fit",
    desc: "ApplySmart spots gaps, weak structure, and missing proof.",
  },
  {
    icon: Zap,
    title: "Improve & Apply Smarter",
    desc: "Fix the signal, then apply with more confidence.",
  },
];

function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <SiteHeader />
      <main>
        <Hero />
        <Trust />
        <Features />
        <HowItWorks />
        <ProductPreview />
        <RejectionSection />
        <CTASection />
      </main>
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_50%_0%,oklch(0.58_0.18_25/.10),transparent_30%),linear-gradient(180deg,oklch(0.04_0.01_285),oklch(0.045_0.01_285)_58%,oklch(0.035_0.01_285))]" />
      <div className="absolute inset-0 -z-10 bg-grid-fade opacity-45" />
      <div className="absolute left-1/2 top-24 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/8 blur-[110px] animate-pulse-glow" />

      <div className="container mx-auto max-w-7xl px-4 pb-18 pt-20 sm:px-6 sm:pb-24 sm:pt-28 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <div className="animate-fade-in inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground shadow-soft backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-primary" />
            For job seekers tired of silence
          </div>

          <h1 className="animate-fade-in-up mt-7 text-balance text-5xl font-black tracking-[-0.07em] text-foreground sm:text-7xl lg:text-8xl">
            Stop sending resumes{" "}
            <span className="black-hole-emphasis">
              into a black hole
              <span aria-hidden="true" className="black-hole-emphasis-bar" />
            </span>
            .
          </h1>

          <p
            className="animate-fade-in-up mx-auto mt-7 max-w-3xl text-pretty text-lg leading-8 text-muted-foreground sm:text-xl"
            style={{ animationDelay: "0.08s" }}
          >
            See why ATS filters you out, what is missing, and what to fix before the next apply.
          </p>

          <div
            className="animate-fade-in-up mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ animationDelay: "0.16s" }}
          >
            <Button variant="hero" size="xl" asChild>
              <Link to="/dashboard/resume">Analyze Resume <ArrowRight /></Link>
            </Button> 
            <Button variant="outline" size="xl" asChild>
              <Link to="/dashboard">Try Demo</Link>
            </Button>
          </div>

          <div className="animate-fade-in-up mt-10 grid grid-cols-1 gap-3 text-left sm:grid-cols-3">
            {[
              ["ATS clarity", "Know why the filter says no."],
              ["Skill gaps", "See what the job description wants."],
              ["Fast fixes", "Rewrite weak bullets in minutes."],
            ].map(([title, desc]) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-soft backdrop-blur transition-all hover:-translate-y-1 hover:border-primary/30"
              >
                <div className="text-sm font-semibold text-foreground">{title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Trust() {
  return (
    <section className="border-y border-white/10 bg-card/35 py-8 backdrop-blur">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <p className="max-w-md text-sm font-medium text-muted-foreground">
            Not another ATS checker. A focused AI workspace for people tired of being filtered out.
          </p>
          <div className="flex flex-wrap gap-2">
            {proof.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <Badge variant="outline" className="border-primary/20 bg-white/[0.03] text-primary">
            Product arsenal
          </Badge>
          <h2 className="mt-5 text-balance text-4xl font-black tracking-[-0.05em] sm:text-6xl">
            Fix what recruiters silently reject.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            Short feedback. Less fluff. More signal.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-card/80 p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-elegant"
              style={{ animationDelay: `${index * 0.04}s` }}
            >
              <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-primary/0 blur-3xl transition-colors duration-500 group-hover:bg-primary/10" />
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-primary">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-6 text-xl font-bold tracking-tight">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="relative border-y border-white/10 bg-muted/25 py-24 sm:py-32">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="outline" className="border-primary/20 bg-white/[0.03] text-primary">
            How it works
          </Badge>
          <h2 className="mt-5 text-balance text-4xl font-black tracking-[-0.05em] sm:text-6xl">
            Three steps from guesswork to clarity.
          </h2>
        </div>

        <div className="relative mt-16 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="absolute left-8 right-8 top-16 hidden h-px bg-gradient-to-r from-transparent via-white/20 to-transparent lg:block" />
          {steps.map((step, index) => (
            <div key={step.title} className="relative rounded-3xl border border-white/10 bg-background/70 p-7 shadow-soft backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] text-primary shadow-soft">
                  <step.icon className="h-6 w-6" />
                </div>
                <span className="text-5xl font-black tracking-[-0.08em] text-white/10">0{index + 1}</span>
              </div>
              <h3 className="mt-8 text-2xl font-bold tracking-tight">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ComparisonLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-3 last:border-b-0 last:pb-0">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      <span className="max-w-[14rem] text-right text-sm font-medium leading-6 text-foreground">
        {value}
      </span>
    </div>
  );
}

function RejectionSection() {
  return (
    <section id="why" className="relative overflow-hidden border-y border-white/10 bg-card/45 py-24 sm:py-32">
      <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-primary/6 blur-3xl" />
      <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1fr] lg:items-start">
          <div>
            <Badge variant="outline" className="border-primary/20 bg-white/[0.03] text-primary">
              Why you get filtered
            </Badge>
            <h2 className="mt-5 text-balance text-4xl font-black tracking-[-0.05em] sm:text-6xl">
              Good candidates still get ignored.
            </h2>
          </div>
          <div className="space-y-4">
            {[
              "ATS reads keywords first, potential second.",
              "If your proof is buried, recruiters skim past it.",
              "Weak structure looks like weak signal.",
            ].map((line) => (
              <div
                key={line}
                className="rounded-3xl border border-white/10 bg-background/65 p-6 text-lg leading-8 text-muted-foreground shadow-soft"
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-card p-8 text-center shadow-elegant sm:p-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,oklch(0.58_0.18_25/.10),transparent_44%)]" />
          <div className="relative mx-auto max-w-3xl">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-primary">
              <Clock3 className="h-6 w-6" />
            </div>
            <h2 className="text-balance text-4xl font-black tracking-[-0.05em] text-foreground sm:text-6xl">
              Your next application should not be a blind shot.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              Upload the resume, paste the job, and get the verdict before the rejection email does.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button variant="hero" size="xl" asChild>
                <Link to="/dashboard/resume">Get ATS Feedback</Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to="/dashboard">Open Workspace</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
