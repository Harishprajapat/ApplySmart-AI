import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { toast } from "sonner";
import { buildPageMeta } from "@/lib/seo";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: buildPageMeta({
      title: "Sign Up",
      description:
        "Create your ApplySmart AI account to start optimizing resumes, generating cover letters, and tracking your job search.",
    }),
  }),
  component: SignupPage,
});

const perks = [
  "5 free resume analyses every month",
  "AI cover letter drafts",
  "200+ interview questions with answers",
  "No credit card required",
];

function SignupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Signup failed");
      }

      localStorage.setItem("token", data.token);
      toast.success("Account created successfully");
      navigate({ to: "/dashboard" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not create account";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-6">
          <Logo />
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">
            Have an account? <span className="font-medium text-primary">Log in</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-sm animate-fade-in-up">
            <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Free forever plan. Upgrade only when you're ready.
            </p>

            <form onSubmit={submit} className="mt-8 space-y-4">
              <div>
                <Label>Full name</Label>
                <Input
                  placeholder="Alex Smith"
                  className="mt-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  className="mt-2"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  placeholder="At least 8 characters"
                  className="mt-2"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button variant="hero" size="lg" className="w-full" type="submit" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
            </div>
            <Button variant="outline" size="lg" className="w-full">
              Continue with Google
            </Button>

            <p className="mt-8 text-center text-xs text-muted-foreground">
              By signing up you agree to our Terms and Privacy.
            </p>
          </div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-gradient-primary lg:block">
        <div className="pointer-events-none absolute inset-0 bg-gradient-glow" />
        <div className="relative flex h-full flex-col justify-center p-12 text-primary-foreground">
          <h2 className="max-w-md text-3xl font-bold leading-tight">
            Join 42,000+ job seekers landing interviews faster.
          </h2>
          <ul className="mt-8 space-y-3">
            {perks.map((p) => (
              <li key={p} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <Check className="h-3 w-3" />
                </span>
                <span className="text-sm opacity-95">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
