import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Signed in (demo)");
    }, 1000);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-primary lg:block">
        <div className="pointer-events-none absolute inset-0 bg-gradient-glow" />
        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          <Logo />
          <div>
            <blockquote className="max-w-md text-2xl font-semibold leading-tight">
              "ApplySmart turned my job hunt around. I went from zero callbacks to 4 interviews in 2 weeks."
            </blockquote>
            <div className="mt-5 text-sm opacity-80">— Priya S., Product Manager @ Razorpay</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center justify-between p-6 lg:hidden">
          <Logo />
        </div>
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-sm animate-fade-in-up">
            <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to your ApplySmart account.
            </p>

            <form onSubmit={submit} className="mt-8 space-y-4">
              <div>
                <Label>Email</Label>
                <Input type="email" placeholder="you@example.com" className="mt-2" required />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label>Password</Label>
                  <a href="#" className="text-xs font-medium text-primary hover:underline">
                    Forgot?
                  </a>
                </div>
                <Input type="password" placeholder="••••••••" className="mt-2" required />
              </div>
              <Button variant="hero" size="lg" className="w-full" type="submit" disabled={loading}>
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
            </div>

            <Button variant="outline" size="lg" className="w-full">
              Continue with Google
            </Button>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              No account?{" "}
              <Link to="/signup" className="font-medium text-primary hover:underline">
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
