import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Features", to: "/#features" },
  { label: "How it works", to: "/#how-it-works" },
  { label: "Preview", to: "/#preview" },
  { label: "Why rejected", to: "/#why" },
  { label: "Pricing", to: "/pricing" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/75 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.to}
              href={link.to}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Log in</Link>
          </Button>
          <Button variant="hero" size="sm" asChild>
            <Link to="/signup">Get ATS Feedback</Link>
          </Button>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-white/10 bg-background/95 backdrop-blur-xl transition-all md:hidden",
          open ? "max-h-96" : "max-h-0",
        )}
      >
        <nav className="container mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6">
          {navLinks.map((link) => (
            <a
              key={link.to}
              href={link.to}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/login">Log in</Link>
            </Button>
            <Button variant="hero" size="sm" asChild>
              <Link to="/signup">Get Feedback</Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
