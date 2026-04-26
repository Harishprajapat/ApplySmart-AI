import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, MoreHorizontal, Building2, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/jobs")({
  component: JobTracker,
});

type Status = "Applied" | "Interview" | "Offer" | "Rejected";

interface Job {
  id: string;
  company: string;
  role: string;
  location: string;
  date: string;
  status: Status;
  salary?: string;
}

const initialJobs: Job[] = [
  { id: "1", company: "Stripe", role: "Senior Product Designer", location: "Remote", date: "Apr 22", status: "Applied", salary: "₹45L" },
  { id: "2", company: "Notion", role: "Product Manager", location: "SF", date: "Apr 20", status: "Applied" },
  { id: "3", company: "Linear", role: "Frontend Engineer", location: "Remote", date: "Apr 18", status: "Interview", salary: "₹38L" },
  { id: "4", company: "Razorpay", role: "Senior PM", location: "Bangalore", date: "Apr 15", status: "Interview" },
  { id: "5", company: "Google", role: "UX Researcher", location: "Bangalore", date: "Apr 12", status: "Offer", salary: "₹52L" },
  { id: "6", company: "Microsoft", role: "Data Scientist", location: "Hyderabad", date: "Apr 10", status: "Rejected" },
];

const statusMeta: Record<Status, { color: string; bg: string }> = {
  Applied: { color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
  Interview: { color: "text-primary", bg: "bg-primary/10" },
  Offer: { color: "text-success", bg: "bg-success/10" },
  Rejected: { color: "text-muted-foreground", bg: "bg-muted" },
};

const columns: Status[] = ["Applied", "Interview", "Offer", "Rejected"];

function JobTracker() {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    company: "",
    role: "",
    location: "",
    status: "Applied" as Status,
  });

  const addJob = () => {
    if (!form.company || !form.role) {
      toast.error("Please add a company and role.");
      return;
    }
    const newJob: Job = {
      id: String(Date.now()),
      company: form.company,
      role: form.role,
      location: form.location || "Remote",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      status: form.status,
    };
    setJobs((j) => [newJob, ...j]);
    setOpen(false);
    setForm({ company: "", role: "", location: "", status: "Applied" });
    toast.success(`${newJob.company} added to ${newJob.status}`);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Tracker</h1>
          <p className="mt-1.5 text-muted-foreground">
            Every application in one place. {jobs.length} active.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="hero">
              <Plus /> Add job
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a new application</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label>Company</Label>
                <Input
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="e.g. Stripe"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Role</Label>
                <Input
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="e.g. Senior Product Designer"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Remote, Bangalore"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v as Status })}
                >
                  <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {columns.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button variant="hero" onClick={addJob}>Add job</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {columns.map((col) => {
          const items = jobs.filter((j) => j.status === col);
          return (
            <div
              key={col}
              className="rounded-2xl border border-border/60 bg-card/50 p-4 shadow-soft"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${statusMeta[col].bg.replace("/10", "")}`} />
                  <span className="text-sm font-semibold">{col}</span>
                  <Badge variant="outline" className="text-xs">{items.length}</Badge>
                </div>
              </div>
              <div className="space-y-3">
                {items.map((job) => (
                  <div
                    key={job.id}
                    className="group cursor-grab rounded-xl border border-border/60 bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elegant"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary text-xs font-bold text-primary-foreground">
                          {job.company.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{job.company}</div>
                          <div className="text-xs text-muted-foreground">{job.role}</div>
                        </div>
                      </div>
                      <button className="opacity-0 transition-opacity group-hover:opacity-100" aria-label="More">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{job.date}</span>
                      {job.salary && (
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          <Building2 className="h-3 w-3" />{job.salary}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-xs text-muted-foreground">
                    No jobs yet
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
