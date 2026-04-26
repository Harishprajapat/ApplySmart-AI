import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1.5 text-muted-foreground">Manage your account, preferences, and billing.</p>
      </div>

      <Section title="Profile" desc="Update your personal info.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Full name</Label>
            <Input defaultValue="Alex Smith" className="mt-2" />
          </div>
          <div>
            <Label>Email</Label>
            <Input defaultValue="alex@applysmart.ai" className="mt-2" />
          </div>
          <div>
            <Label>Target role</Label>
            <Input defaultValue="Senior Product Designer" className="mt-2" />
          </div>
          <div>
            <Label>Location</Label>
            <Input defaultValue="Bangalore, India" className="mt-2" />
          </div>
        </div>
        <Button variant="hero" className="mt-5" onClick={() => toast.success("Profile saved")}>Save changes</Button>
      </Section>

      <Section title="Notifications" desc="Choose what we email you about.">
        <Toggle label="Weekly job-match digest" defaultChecked />
        <Toggle label="Interview reminders" defaultChecked />
        <Toggle label="New feature announcements" />
        <Toggle label="Tips & career advice" defaultChecked />
      </Section>

      <Section title="Privacy" desc="Your data, your rules.">
        <Toggle label="Allow anonymous usage analytics" defaultChecked />
        <Toggle label="Use my resumes to improve AI models" />
        <Button variant="outline" className="mt-4">Download my data</Button>
      </Section>

      <Section title="Danger zone" desc="Irreversible actions.">
        <Button variant="destructive">Delete my account</Button>
      </Section>
    </div>
  );
}

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
      <Separator className="my-5" />
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Toggle({ label, defaultChecked = false }: { label: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/30 p-4">
      <span className="text-sm font-medium">{label}</span>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
