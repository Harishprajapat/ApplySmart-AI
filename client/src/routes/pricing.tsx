import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — ApplySmart AI" },
      {
        name: "description",
        content: "Free, Pro (₹199/mo), and Premium (₹399/mo) plans for job seekers. Cancel anytime.",
      },
      { property: "og:title", content: "Pricing — ApplySmart AI" },
      { property: "og:description", content: "Simple plans starting free. Pro from ₹199/month." },
    ],
  }),
  component: PricingPage,
});

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    desc: "Try the magic. No credit card required.",
    features: [
      "5 resume analyses per month",
      "Basic ATS scoring",
      "1 cover letter draft",
      "Job tracker (10 jobs)",
      "Community support",
    ],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "₹199",
    period: "/month",
    desc: "For active job seekers who mean business.",
    features: [
      "Unlimited resume analyses",
      "Advanced ATS scoring + rewrites",
      "Unlimited cover letters",
      "200+ interview questions w/ AI answers",
      "Unlimited job tracking",
      "Email support",
    ],
    cta: "Get Pro",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Premium",
    price: "₹399",
    period: "/month",
    desc: "Best for career switchers & senior roles.",
    features: [
      "Everything in Pro",
      "Priority AI responses (2x faster)",
      "Advanced career insights",
      "1:1 mock interviews (4/month)",
      "LinkedIn profile rewrite",
      "Priority support",
    ],
    cta: "Get Premium",
    highlighted: false,
  },
];

const faqs = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from settings — you'll keep access until the end of your billing period.",
  },
  { q: "Do you offer refunds?", a: "Full refund within 7 days, no questions asked." },
  { q: "Is my data private?", a: "Your resumes and applications are encrypted and never shared. Period." },
  { q: "Do you offer student discounts?", a: "Yes — verified students get 50% off Pro. Contact support." },
];

function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-gradient-hero" />
          <div className="container relative mx-auto max-w-7xl px-4 pb-12 pt-20 sm:px-6 sm:pt-28 lg:px-8">
            <div className="mx-auto max-w-2xl text-center animate-fade-in-up">
              <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">
                Pricing
              </Badge>
              <h1 className="mt-4 text-balance text-5xl font-bold tracking-tight sm:text-6xl">
                Simple, honest pricing.
              </h1>
              <p className="mt-5 text-lg text-muted-foreground">
                Start free. Upgrade when you're ready. Cancel whenever.
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
              {plans.map((p, i) => (
                <div
                  key={p.name}
                  className={`animate-fade-in-up relative flex flex-col rounded-3xl border p-7 transition-all hover:-translate-y-1 ${
                    p.highlighted
                      ? "border-primary/50 bg-card shadow-elegant md:scale-105"
                      : "border-border/60 bg-card shadow-soft hover:shadow-elegant"
                  }`}
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  {p.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-gradient-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-soft">
                      <Sparkles className="h-3 w-3" /> {p.badge}
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold">{p.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                    <div className="mt-5 flex items-end gap-1">
                      <span className="text-5xl font-bold tracking-tight">{p.price}</span>
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
                  <Button variant={p.highlighted ? "hero" : "outline"} className="mt-7" asChild>
                    <Link to="/signup">
                      {p.cta} <ArrowRight />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl font-bold tracking-tight">Frequently asked</h2>
            <div className="mt-10 divide-y divide-border/60 rounded-2xl border border-border/60 bg-card shadow-soft">
              {faqs.map((f) => (
                <details key={f.q} className="group p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                    {f.q}
                    <span className="ml-4 text-muted-foreground transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
