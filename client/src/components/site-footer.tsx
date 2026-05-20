import { Link } from "@tanstack/react-router";
import { Github, Linkedin } from "lucide-react";
import { Logo } from "@/components/logo";

const cols = [
  {
    title: "Product",
    links: [
      { label: "ATS Resume Analysis", to: "/dashboard/resume" },
      { label: "Job-Ready Cover Letters", to: "/dashboard/cover-letter" },
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

const socialLinks = [
  {
    label: "GitHub",
    href: "https://github.com/Harishprajapat",
    icon: Github,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/harish-prajapat",
    icon: Linkedin,
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2 max-w-xs">
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground">
              The AI workspace for people tired of rejection emails, silent recruiters, and ATS guessing games.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-muted-foreground">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-card px-3 py-2 text-sm transition-colors hover:border-primary/40 hover:bg-white/[0.06] hover:text-foreground"
                >
                  <social.icon className="h-4 w-4" />
                  <span>{social.label}</span>
                </a>
              ))}
            </div>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-foreground">{col.title}</h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-muted-foreground sm:flex-row">
          <p>&copy; {new Date().getFullYear()} ApplySmart AI &middot; Built by Harish Prajapat</p>
          <p>Built for resumes that deserve to be read.</p>
        </div>
      </div>
    </footer>
  );
}
