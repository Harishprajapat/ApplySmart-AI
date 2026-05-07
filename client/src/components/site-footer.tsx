import { Link } from "@tanstack/react-router";
import { Github, Linkedin } from "lucide-react";
import { Logo } from "@/components/logo";

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
    <footer className="border-t border-border/60 bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2 max-w-xs">
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground">
              The AI workspace that turns rejections into offers. Built for ambitious job seekers.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-muted-foreground">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-2 text-sm transition-colors hover:border-primary/30 hover:bg-accent hover:text-foreground"
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

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 text-sm text-muted-foreground sm:flex-row">
          <p>&copy; {new Date().getFullYear()} ApplySmart AI &middot; Built by Harish Prajapat</p>
          <p>Made with care for job seekers worldwide.</p>
        </div>
      </div>
    </footer>
  );
}
