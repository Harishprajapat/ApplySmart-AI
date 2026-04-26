import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  FileSearch,
  PenLine,
  MessageSquareQuote,
  KanbanSquare,
  ShieldCheck,
  Zap,
  Users,
  Star,
  Quote,
  Check,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ApplySmart AI — Get Shortlisted 3x Faster with AI" },
      {
        name: "description",
        content:
          "Stop getting ghosted. ApplySmart AI rewrites your resume for ATS, drafts personalized cover letters, and preps you for interviews — in under 60 seconds.",
      },
      { property: "og:title", content: "ApplySmart AI — Get Shortlisted 3x Faster with AI" },
      {
        property: "og:description",
        content:
          "The AI workspace ambitious job seekers use to beat ATS, write cover letters, and crack interviews.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <DashboardPreview />
        <TrustLogos />
        <Features />
        <HowItWorks />
        <Testimonials />
        <PricingPreview />
        <CTASection />
      </main>
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-hero" />
      <div className="pointer-events-none absolute left-1/2 top-0 -z-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />

      <div className="container relative mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 sm:pt-28 lg:px-8 lg:pt-36">
        <div className="mx-auto max-w-4xl text-center">
          <div className="animate-fade-in inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium shadow-soft backdrop-blur">
            <span className="flex h-2 w-2 items-center justify-center">
              <span className="absolute h-2 w-2 animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative h-2 w-2 rounded-full bg-primary" />
            </span>
            <span className="text-muted-foreground">
              New: AI-powered ATS scoring engine v2 is live
            </span>
            <ArrowRight className="h-3 w-3 text-primary" />
          </div>

          <h1 className="animate-fade-in-up mt-7 text-balance text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Stop getting <span className="relative inline-block">
              <span className="text-gradient">rejected by bots</span>
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 12"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 9C50 3 150 3 298 9"
                  stroke="url(#underline)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="underline" x1="0" y1="0" x2="300" y2="0">
                    <stop offset="0%" stopColor="oklch(0.55 0.23 280)" />
                    <stop offset="100%" stopColor="oklch(0.7 0.25 295)" />
                  </linearGradient>
                </defs>
              </svg>
            </span>.<br className="hidden sm:block" /> Start landing interviews.
          </h1>

          <p
            className="animate-fade-in-up mx-auto mt-7 max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl"
            style={{ animationDelay: "0.1s" }}
          >
            ApplySmart AI rewrites your resume to beat any ATS, drafts cover letters that get read,
            and preps you for interviews — all in under 60 seconds.
          </p>

          <div
            className="animate-fade-in-up mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ animationDelay: "0.2s" }}
          >
            <Button variant="hero" size="xl" asChild>
              <Link to="/signup">
                Analyze My Resume <ArrowRight />
              </Link>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <Link to="/dashboard">See live demo</Link>
            </Button>
          </div>

          <div
            className="animate-fade-in-up mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-primary" />
              <span><span className="font-semibold text-foreground">42,000+</span> job seekers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-primary" />
              <span>Results in <span className="font-semibold text-foreground">&lt; 60s</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>100% private &amp; secure</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <section className="relative -mt-2 pb-24">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div
          className="animate-fade-in-up relative rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 via-transparent to-primary-glow/10 p-2 shadow-elegant"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-soft">
            {/* Window chrome */}
            <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-destructive/70" />
                <div className="h-3 w-3 rounded-full bg-warning/70" />
                <div className="h-3 w-3 rounded-full bg-success/70" />
              </div>
              <div className="rounded-md bg-background/60 px-3 py-1 text-xs text-muted-foreground">
                applysmart.ai/dashboard
              </div>
              <div className="w-12" />
            </div>

            {/* Mock dashboard */}
            <div className="grid grid-cols-12 gap-0">
              {/* Sidebar mock */}
              <aside className="col-span-3 hidden border-r border-border/60 bg-sidebar p-4 lg:block">
                <div className="space-y-1">
                  {["Dashboard", "Resume Analyzer", "Cover Letter", "Interview Prep", "Job Tracker"].map(
                    (item, i) => (
                      <div
                        key={item}
                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm ${
                          i === 1
                            ? "bg-gradient-primary text-primary-foreground shadow-soft"
                            : "text-muted-foreground"
                        }`}
                      >
                        <div className="h-4 w-4 rounded bg-current opacity-60" />
                        {item}
                      </div>
                    ),
                  )}
                </div>
              </aside>

              {/* Main */}
              <div className="col-span-12 p-6 lg:col-span-9">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wide text-primary">
                      Resume Analyzer
                    </div>
                    <div className="mt-1 text-xl font-semibold">Senior Product Designer @ Stripe</div>
                  </div>
                  <Badge variant="outline" className="gap-1">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" /> Analysis
                    complete
                  </Badge>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 to-primary-glow/10 p-5">
                    <div className="text-xs text-muted-foreground">ATS Match Score</div>
                    <div className="mt-1 flex items-end gap-1">
                      <span className="text-4xl font-bold text-gradient">94</span>
                      <span className="mb-1 text-lg text-muted-foreground">%</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full w-[94%] rounded-full bg-gradient-primary" />
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-xs text-success">
                      <TrendingUp className="h-3 w-3" /> +47% vs original
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-card p-5">
                    <div className="text-xs text-muted-foreground">Keywords Found</div>
                    <div className="mt-1 text-4xl font-bold">28<span className="text-lg text-muted-foreground">/30</span></div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {["Figma", "Design Systems", "User Research", "A/B Testing"].map((k) => (
                        <span
                          key={k}
                          className="rounded-md bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-card p-5">
                    <div className="text-xs text-muted-foreground">Suggestions</div>
                    <div className="mt-1 text-4xl font-bold">3</div>
                    <div className="mt-3 space-y-1.5">
                      {[
                        "Add 'roadmap' to skills",
                        "Quantify impact in role 2",
                        "Use stronger action verbs",
                      ].map((s) => (
                        <div key={s} className="flex items-start gap-1.5 text-xs">
                          <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                          <span className="text-muted-foreground">{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-border/60 bg-card p-5">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Sparkles className="h-4 w-4 text-primary" /> AI Recommendation
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your resume strongly matches this role. Tweak the summary to highlight your{" "}
                    <span className="font-medium text-foreground">design systems</span> work and you'll
                    likely land an interview.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Floating accent cards */}
          <div className="animate-float absolute -left-6 top-32 hidden rounded-2xl border border-border/60 bg-card p-3 shadow-elegant lg:block">
            <div className="flex items-center gap-2 text-xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/15">
                <CheckCircle2 className="h-4 w-4 text-success" />
              </div>
              <div>
                <div className="font-semibold">Resume optimized</div>
                <div className="text-muted-foreground">2 seconds ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustLogos() {
  const items = [
    "TechCrunch",
    "Product Hunt",
    "Y Combinator",
    "Forbes",
    "Indeed",
    "LinkedIn News",
  ];
  return (
    <section className="border-y border-border/40 bg-muted/30 py-10">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Trusted by job seekers placed at top companies
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70 grayscale">
          {items.map((logo) => (
            <span
              key={logo}
              className="text-base font-semibold tracking-tight text-muted-foreground transition-opacity hover:opacity-100"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: FileSearch,
    title: "Beat the ATS in one click",
    desc: "Our scoring engine compares your resume against the JD line-by-line and rewrites weak sections so recruiters actually see your application.",
    stat: "94% avg. match score",
  },
  {
    icon: PenLine,
    title: "Cover letters that get read",
    desc: "Drop in your resume + role. Get a personalized, hiring-manager-ready cover letter in under 15 seconds. No more blank pages.",
    stat: "10s average draft time",
  },
  {
    icon: MessageSquareQuote,
    title: "Walk into interviews prepared",
    desc: "Practice 200+ HR & behavioral questions with AI-generated answers tailored to your background and the company you're targeting.",
    stat: "3x more confident",
  },
  {
    icon: KanbanSquare,
    title: "Never lose track of an application",
    desc: "A clean Kanban board for every job — from Applied to Offer. Auto-reminders so follow-ups happen on time.",
    stat: "Zero spreadsheets",
  },
];

function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">
            Everything you need
          </Badge>
          <h2 className="mt-4 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            One workspace. Every step of the job hunt.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Tools designed around outcomes — interviews booked, offers signed.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-2">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-elegant"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-primary opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20" />
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-soft">
                  <f.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="mt-5 text-xl font-semibold">{f.title}</h3>
                <p className="mt-2 text-muted-foreground">{f.desc}</p>
                <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                  <Sparkles className="h-3 w-3" /> {f.stat}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    number: "01",
    title: "Paste your resume",
    desc: "Upload a PDF or paste plain text. Drop in the job description you're targeting.",
  },
  {
    number: "02",
    title: "Let AI do the heavy lifting",
    desc: "Our model scores ATS match, rewrites weak bullets, and generates supporting docs.",
  },
  {
    number: "03",
    title: "Apply with confidence",
    desc: "Send a tailored application that beats the bots and impresses the human.",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="relative bg-muted/30 py-24 sm:py-32">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">
            How it works
          </Badge>
          <h2 className="mt-4 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            From rejection to interview in 3 steps
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.number} className="relative">
              <div className="rounded-3xl border border-border/60 bg-card p-8 shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant">
                <div className="text-5xl font-bold text-gradient">{s.number}</div>
                <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-muted-foreground">{s.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <ArrowRight className="absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 text-primary/40 md:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const testimonials = [
  {
    quote:
      "I was getting auto-rejected for months. After ApplySmart, I landed 4 interviews in 2 weeks. Wild.",
    name: "Priya Sharma",
    role: "Product Manager → Razorpay",
    avatar: "PS",
  },
  {
    quote:
      "The cover letter generator alone saved me 10+ hours. The quality is genuinely better than what I'd write.",
    name: "Marcus Chen",
    role: "SWE → Stripe",
    avatar: "MC",
  },
  {
    quote:
      "Interview prep with AI feedback was a game changer. Walked into my Google final round feeling ready.",
    name: "Aisha Patel",
    role: "Data Scientist → Google",
    avatar: "AP",
  },
];

function Testimonials() {
  return (
    <section className="py-24 sm:py-32">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            Loved by job seekers,<br />placed at top companies
          </h2>
          <div className="mt-4 flex items-center justify-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-warning text-warning" />
            ))}
            <span className="ml-2 text-sm text-muted-foreground">4.9 from 2,400+ reviews</span>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="group relative rounded-3xl border border-border/60 bg-card p-7 shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant"
            >
              <Quote className="h-8 w-8 text-primary/20" />
              <blockquote className="mt-3 text-foreground">{t.quote}</blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-border/60 pt-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    desc: "Try the magic. No credit card.",
    features: ["5 resume analyses /month", "Basic ATS scoring", "1 cover letter draft", "Job tracker (10 jobs)"],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "₹199",
    period: "/month",
    desc: "For active job seekers.",
    features: [
      "Unlimited resume analyses",
      "Advanced ATS scoring + rewrites",
      "Unlimited cover letters",
      "200+ interview questions w/ AI answers",
      "Unlimited job tracking",
    ],
    cta: "Get started",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Premium",
    price: "₹399",
    period: "/month",
    desc: "Best for career switchers.",
    features: [
      "Everything in Pro",
      "Priority AI responses",
      "Advanced career insights",
      "1:1 mock interviews (4/mo)",
      "LinkedIn profile rewrite",
    ],
    cta: "Get Premium",
    highlighted: false,
  },
];

function PricingPreview() {
  return (
    <section id="pricing" className="relative bg-muted/30 py-24 sm:py-32">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">
            Pricing
          </Badge>
          <h2 className="mt-4 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            Pay less than one cup of coffee a week
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Simple plans. Cancel anytime. Refunds within 7 days.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative flex flex-col rounded-3xl border p-7 transition-all hover:-translate-y-1 ${
                p.highlighted
                  ? "border-primary/50 bg-card shadow-elegant md:scale-105"
                  : "border-border/60 bg-card shadow-soft hover:shadow-elegant"
              }`}
            >
              {p.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-soft">
                  {p.badge}
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                <div className="mt-5 flex items-end gap-1">
                  <span className="text-4xl font-bold tracking-tight">{p.price}</span>
                  <span className="mb-1 text-sm text-muted-foreground">{p.period}</span>
                </div>
              </div>
              <ul className="mt-6 flex-1 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant={p.highlighted ? "hero" : "outline"}
                className="mt-7"
                asChild
              >
                <Link to="/signup">{p.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/pricing">
              Compare all features <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-12 text-center shadow-elegant sm:p-16">
          <div className="pointer-events-none absolute inset-0 bg-gradient-glow opacity-50" />
          <div className="relative">
            <h2 className="text-balance text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl">
              Your dream job is one application away.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-lg text-primary-foreground/85">
              Join 42,000+ job seekers who stopped guessing and started getting interviews.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button variant="glass" size="xl" asChild>
                <Link to="/signup">Start free — no card required</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
