import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { Github, Twitter, Linkedin } from "lucide-react";

const cols = [
  {
    title: "Product",
    links: [
      { label: "Resume Analyzer", to: "/dashboard/resume" },
      { label: "Cover Letter", to: "/dashboard/cover-letter" },
      { label: "Interview Prep", to: "/dashboard/interview" },
      { label: "Job Tracker", to: "/dashboard/jobs" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Pricing", to: "/pricing" },
      { label: "About", to: "/" },
      { label: "Blog", to: "/" },
      { label: "Contact", to: "/" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", to: "/" },
      { label: "Terms", to: "/" },
      { label: "Security", to: "/" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2 max-w-xs">
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground">
              The AI workspace that turns rejections into offers. Built for ambitious job seekers.
            </p>
            <div className="mt-5 flex gap-2 text-muted-foreground">
              <a href="#" className="rounded-lg p-2 hover:bg-accent hover:text-foreground" aria-label="Twitter">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="rounded-lg p-2 hover:bg-accent hover:text-foreground" aria-label="GitHub">
                <Github className="h-4 w-4" />
              </a>
              <a href="#" className="rounded-lg p-2 hover:bg-accent hover:text-foreground" aria-label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-foreground">{col.title}</h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} ApplySmart AI. All rights reserved.</p>
          <p>Made with care for job seekers worldwide.</p>
        </div>
      </div>
    </footer>
  );
}
